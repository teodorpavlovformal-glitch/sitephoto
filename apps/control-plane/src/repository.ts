import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Pool } from "pg";

import {
  runRecordSchema,
  type RunRecord,
  type RunRequest
} from "@pavlov/agent-contracts";

import { createId, nowIso } from "./utils.js";

export interface RunRepository {
  ensureSchema(): Promise<void>;
  createRun(request: RunRequest): Promise<RunRecord>;
  saveRun(run: RunRecord): Promise<RunRecord>;
  getRun(runId: string): Promise<RunRecord | null>;
  listActiveRuns(): Promise<RunRecord[]>;
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const initialSchemaSql = readFileSync(join(currentDir, "..", "sql", "001_initial.sql"), "utf8");

export class InMemoryRunRepository implements RunRepository {
  private readonly runs = new Map<string, RunRecord>();

  async ensureSchema() {}

  async createRun(request: RunRequest) {
    const timestamp = nowIso();
    const run = runRecordSchema.parse({
      id: createId("run"),
      status: "received",
      request,
      approvals: [],
      artifacts: [],
      steps: [],
      plannerResponseId: null,
      reviewResponseId: null,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    this.runs.set(run.id, structuredClone(run));
    return structuredClone(run);
  }

  async saveRun(run: RunRecord) {
    const parsed = runRecordSchema.parse({
      ...run,
      updatedAt: nowIso()
    });
    this.runs.set(parsed.id, structuredClone(parsed));
    return structuredClone(parsed);
  }

  async getRun(runId: string) {
    const run = this.runs.get(runId);
    return run ? structuredClone(run) : null;
  }

  async listActiveRuns() {
    return Array.from(this.runs.values())
      .filter((run) => !["completed", "failed", "rejected"].includes(run.status))
      .map((run) => structuredClone(run));
  }
}

export class PostgresRunRepository implements RunRepository {
  private readonly pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl
    });
  }

  async ensureSchema() {
    await this.pool.query(initialSchemaSql);
  }

  async createRun(request: RunRequest) {
    const timestamp = nowIso();
    const run = runRecordSchema.parse({
      id: createId("run"),
      status: "received",
      request,
      approvals: [],
      artifacts: [],
      steps: [],
      plannerResponseId: null,
      reviewResponseId: null,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    return this.saveRun(run);
  }

  async saveRun(run: RunRecord) {
    const parsed = runRecordSchema.parse({
      ...run,
      updatedAt: nowIso()
    });
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query(
        `
          insert into agent_runs (
            id,
            status,
            title,
            source,
            requested_by,
            repo_owner,
            repo_name,
            repo_branch,
            base_branch,
            working_directory,
            preview_url,
            request_json,
            plan_json,
            summary_json,
            planner_response_id,
            review_response_id,
            created_at,
            updated_at
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            $12::jsonb, $13::jsonb, $14::jsonb, $15, $16, $17::timestamptz, $18::timestamptz
          )
          on conflict (id) do update
          set
            status = excluded.status,
            title = excluded.title,
            source = excluded.source,
            requested_by = excluded.requested_by,
            repo_owner = excluded.repo_owner,
            repo_name = excluded.repo_name,
            repo_branch = excluded.repo_branch,
            base_branch = excluded.base_branch,
            working_directory = excluded.working_directory,
            preview_url = excluded.preview_url,
            request_json = excluded.request_json,
            plan_json = excluded.plan_json,
            summary_json = excluded.summary_json,
            planner_response_id = excluded.planner_response_id,
            review_response_id = excluded.review_response_id,
            updated_at = excluded.updated_at
        `,
        [
          parsed.id,
          parsed.status,
          parsed.request.title,
          parsed.request.source,
          parsed.request.requestedBy,
          parsed.request.repoTarget.owner,
          parsed.request.repoTarget.repo,
          parsed.request.repoTarget.branch,
          parsed.request.repoTarget.baseBranch,
          parsed.request.repoTarget.workingDirectory,
          parsed.request.previewUrl ?? null,
          JSON.stringify(parsed.request),
          JSON.stringify(parsed.plan ?? null),
          JSON.stringify(parsed.summary ?? null),
          parsed.plannerResponseId,
          parsed.reviewResponseId,
          parsed.createdAt,
          parsed.updatedAt
        ]
      );

      await client.query("delete from agent_steps where run_id = $1", [parsed.id]);
      for (const step of parsed.steps) {
        await client.query(
          `
            insert into agent_steps (
              id,
              run_id,
              step_key,
              role,
              status,
              details_json,
              started_at,
              completed_at
            )
            values ($1, $2, $3, $4, $5, $6::jsonb, $7::timestamptz, $8::timestamptz)
          `,
          [
            step.id,
            parsed.id,
            step.key,
            step.role,
            step.status,
            JSON.stringify(step.details),
            step.startedAt,
            step.completedAt
          ]
        );
      }

      await client.query("delete from artifacts where run_id = $1", [parsed.id]);
      for (const artifact of parsed.artifacts) {
        await client.query(
          `
            insert into artifacts (
              id,
              run_id,
              kind,
              label,
              url,
              content,
              metadata_json,
              created_at
            )
            values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::timestamptz)
          `,
          [
            artifact.id ?? createId("artifact"),
            parsed.id,
            artifact.kind,
            artifact.label,
            artifact.url ?? null,
            artifact.content ?? null,
            JSON.stringify(artifact.metadata ?? {}),
            artifact.createdAt ?? parsed.updatedAt
          ]
        );
      }

      await client.query("delete from approvals where run_id = $1", [parsed.id]);
      for (const approval of parsed.approvals) {
        await client.query(
          `
            insert into approvals (
              id,
              run_id,
              gate_type,
              reason,
              status,
              requested_by,
              approved_by,
              note,
              created_at,
              updated_at
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz)
          `,
          [
            approval.id,
            parsed.id,
            approval.gateType,
            approval.reason,
            approval.status,
            approval.requestedBy,
            approval.approvedBy,
            approval.note,
            approval.createdAt,
            approval.updatedAt
          ]
        );
      }

      await client.query("commit");
      return parsed;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async getRun(runId: string) {
    const runRows = await this.pool.query("select * from agent_runs where id = $1", [runId]);
    const row = runRows.rows[0];

    if (!row) {
      return null;
    }

    const [stepRows, artifactRows, approvalRows] = await Promise.all([
      this.pool.query("select * from agent_steps where run_id = $1 order by started_at asc", [runId]),
      this.pool.query("select * from artifacts where run_id = $1 order by created_at asc", [runId]),
      this.pool.query("select * from approvals where run_id = $1 order by created_at asc", [runId])
    ]);

    return runRecordSchema.parse({
      id: row.id,
      status: row.status,
      request: row.request_json,
      plan: row.plan_json ?? undefined,
      summary: row.summary_json ?? undefined,
      approvals: approvalRows.rows.map((approval) => ({
        id: approval.id,
        gateType: approval.gate_type,
        reason: approval.reason,
        status: approval.status,
        requestedBy: approval.requested_by,
        approvedBy: approval.approved_by,
        note: approval.note,
        createdAt: approval.created_at.toISOString(),
        updatedAt: approval.updated_at.toISOString()
      })),
      artifacts: artifactRows.rows.map((artifact) => ({
        id: artifact.id,
        kind: artifact.kind,
        label: artifact.label,
        url: artifact.url ?? undefined,
        content: artifact.content ?? undefined,
        metadata: artifact.metadata_json ?? {},
        createdAt: artifact.created_at.toISOString()
      })),
      steps: stepRows.rows.map((step) => ({
        id: step.id,
        key: step.step_key,
        role: step.role,
        status: step.status,
        details: step.details_json ?? {},
        startedAt: step.started_at.toISOString(),
        completedAt: step.completed_at ? step.completed_at.toISOString() : null
      })),
      plannerResponseId: row.planner_response_id,
      reviewResponseId: row.review_response_id,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    });
  }

  async listActiveRuns() {
    const rows = await this.pool.query(
      "select id from agent_runs where status not in ('completed', 'failed', 'rejected') order by updated_at asc"
    );

    const runs = await Promise.all(rows.rows.map((row) => this.getRun(row.id)));
    return runs.filter((run): run is RunRecord => Boolean(run));
  }
}
