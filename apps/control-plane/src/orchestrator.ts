import { StateGraph, START, END } from "@langchain/langgraph";
import OpenAI from "openai";
import { z } from "zod";

import {
  runRecordSchema,
  runSummarySchema,
  taskPlanSchema,
  type ApprovalDecision,
  type RunRecord,
  type RunRequest,
  type StoredApproval,
  type TaskPlan
} from "@pavlov/agent-contracts";

import type { RuntimeConfig } from "./config.js";
import { dispatchGitHubWorkflow } from "./integrations.js";
import type { RunRepository } from "./repository.js";
import {
  createArtifact,
  createId,
  extractOutputText,
  nowIso,
  pushArtifact,
  summarizeNextActions
} from "./utils.js";

type GraphState = {
  run: RunRecord;
  halt: boolean;
  reviewNotes: string[];
};

const graphStateSchema = z.object({
  run: z.any(),
  halt: z.boolean().default(false),
  reviewNotes: z.array(z.string()).default([])
});

export class AgentOrchestrator {
  private readonly openaiClient: OpenAI | null;
  private readonly graph;

  constructor(
    private readonly config: RuntimeConfig,
    private readonly repository: RunRepository
  ) {
    this.openaiClient = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;
    this.graph = new StateGraph(graphStateSchema)
      .addNode("trigger", async (state: GraphState) => this.triggerNode(state))
      .addNode("planner", async (state: GraphState) => this.plannerNode(state))
      .addNode("approval_gate", async (state: GraphState) => this.approvalNode(state))
      .addNode("codex_execution", async (state: GraphState) => this.executionNode(state))
      .addNode("browser_qa", async (state: GraphState) => this.browserQaNode(state))
      .addNode("review_security", async (state: GraphState) => this.reviewNode(state))
      .addNode("summary", async (state: GraphState) => this.summaryNode(state))
      .addEdge(START, "trigger")
      .addEdge("trigger", "planner")
      .addConditionalEdges("planner", (state: GraphState) =>
        state.halt ? "summary" : "approval_gate"
      )
      .addConditionalEdges("approval_gate", (state: GraphState) =>
        state.halt ? "summary" : "codex_execution"
      )
      .addEdge("codex_execution", "browser_qa")
      .addEdge("browser_qa", "review_security")
      .addEdge("review_security", "summary")
      .addEdge("summary", END)
      .compile();
  }

  async processRun(runId: string) {
    const run = await this.repository.getRun(runId);
    if (!run) {
      return null;
    }

    const result = await this.graph.invoke({
      run,
      halt: false,
      reviewNotes: []
    });

    const finalRun = runRecordSchema.parse(result.run);
    await this.repository.saveRun(finalRun);
    return finalRun;
  }

  async applyApproval(decision: ApprovalDecision) {
    const run = await this.repository.getRun(decision.runId);
    if (!run) {
      return null;
    }

    run.approvals = run.approvals.map((approval) =>
      approval.gateType === decision.gateType
        ? {
            ...approval,
            status: decision.approved ? "approved" : "rejected",
            approvedBy: decision.approvedBy,
            note: decision.note ?? null,
            updatedAt: nowIso()
          }
        : approval
    );
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return this.processRun(run.id);
  }

  private async triggerNode(state: GraphState) {
    const run = cloneRun(state.run);
    upsertStep(run, "trigger", "repo-ops", "completed", { source: run.request.source });
    run.status = "planning";
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return { run };
  }

  private async plannerNode(state: GraphState) {
    const run = cloneRun(state.run);
    upsertStep(run, "planner", "planner", "in_progress", {
      model: this.config.OPENAI_PLANNER_MODEL
    });

    const planResult = await this.planRun(run);
    if (planResult.kind === "pending") {
      run.plannerResponseId = planResult.responseId;
      run.status = "planning";
      run.artifacts = pushArtifact(run.artifacts, planResult.artifact);
      run.updatedAt = nowIso();
      await this.repository.saveRun(run);
      return { run, halt: true };
    }

    run.plan = planResult.plan;
    run.plannerResponseId = null;
    run.artifacts = pushArtifact(run.artifacts, planResult.artifact);
    upsertStep(run, "planner", "planner", "completed", {
      plannedSteps: planResult.plan.steps.length
    });
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return { run, halt: false };
  }

  private async approvalNode(state: GraphState) {
    const run = cloneRun(state.run);
    run.approvals = syncApprovals(run);

    const pending = run.approvals.filter((approval) => approval.status === "pending");
    const rejected = run.approvals.filter((approval) => approval.status === "rejected");
    upsertStep(run, "approval_gate", "repo-ops", "completed", {
      pending: pending.length,
      rejected: rejected.length
    });

    if (rejected.length > 0) {
      run.status = "rejected";
      run.updatedAt = nowIso();
      await this.repository.saveRun(run);
      return { run, halt: true };
    }

    if (pending.length > 0) {
      run.status = "awaiting_approval";
      run.updatedAt = nowIso();
      await this.repository.saveRun(run);
      return { run, halt: true };
    }

    run.status = "approved";
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return { run, halt: false };
  }

  private async executionNode(state: GraphState) {
    const run = cloneRun(state.run);
    const dispatch = await dispatchGitHubWorkflow(this.config, run.id, run.request.objective);

    run.artifacts = pushArtifact(
      run.artifacts,
      createArtifact({
        id: createId("artifact"),
        kind: "workflow-dispatch",
        label: dispatch.dispatched ? "GitHub workflow dispatched" : "GitHub workflow dispatch blocked",
        content: dispatch.message,
        metadata: { workflowId: this.config.GITHUB_WORKFLOW_ID }
      })
    );
    upsertStep(run, "codex_execution", "repo-ops", "completed", {
      dispatched: dispatch.dispatched
    });
    run.status = dispatch.dispatched ? "qa_pending" : "blocked";
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return { run };
  }

  private async browserQaNode(state: GraphState) {
    const run = cloneRun(state.run);
    const hasPreview = Boolean(run.request.previewUrl);

    run.artifacts = pushArtifact(
      run.artifacts,
      createArtifact({
        id: createId("artifact"),
        kind: "qa-report",
        label: hasPreview ? "Preview URL attached for browser QA" : "Preview URL pending for browser QA",
        content: hasPreview
          ? `Run Playwright smoke coverage against ${run.request.previewUrl}.`
          : "Waiting for a Vercel preview URL before browser QA can start."
      })
    );
    upsertStep(run, "browser_qa", "browser-qa", "completed", { hasPreview });
    if (hasPreview && run.status !== "blocked") {
      run.status = "reviewing";
    }
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return { run };
  }

  private async reviewNode(state: GraphState) {
    const run = cloneRun(state.run);
    const notes = await this.reviewRun(run);
    upsertStep(run, "review_security", "review-security", "completed", {
      notes: notes.length
    });
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return { run, reviewNotes: notes };
  }

  private async summaryNode(state: GraphState) {
    const run = cloneRun(state.run);
    const pendingReasons = run.approvals
      .filter((approval) => approval.status === "pending")
      .map((approval) => approval.reason);

    const summary = runSummarySchema.parse({
      runId: run.id,
      status: run.status,
      plan: run.plan,
      approvals: run.approvals.map((approval) => ({
        gateType: approval.gateType,
        status: approval.status,
        reason: approval.reason
      })),
      reviewNotes: state.reviewNotes,
      nextActions: summarizeNextActions(run.status, pendingReasons, Boolean(run.request.previewUrl)),
      artifacts: run.artifacts.slice(-10)
    });

    run.summary = summary;
    run.artifacts = pushArtifact(
      run.artifacts,
      createArtifact({
        id: createId("artifact"),
        kind: "summary",
        label: "Run summary updated",
        content: JSON.stringify(summary, null, 2),
        metadata: { status: run.status }
      })
    );
    run.updatedAt = nowIso();
    await this.repository.saveRun(run);
    return { run };
  }

  private async planRun(run: RunRecord) {
    const fallbackPlan = createDeterministicPlan(run.request);

    if (!this.openaiClient) {
      return {
        kind: "completed" as const,
        plan: fallbackPlan,
        artifact: createArtifact({
          id: createId("artifact"),
          kind: "plan",
          label: "Deterministic plan created",
          content: JSON.stringify(fallbackPlan, null, 2)
        })
      };
    }

    const prompt = [
      "Create a JSON plan for a Codex-driven web development run.",
      "Return JSON only with the fields summary, steps, acceptanceCriteria, riskGates, rollbackPlan.",
      `Title: ${run.request.title}`,
      `Objective: ${run.request.objective}`,
      `Prompt: ${run.request.prompt}`,
      `Repo target: ${JSON.stringify(run.request.repoTarget)}`
    ].join("\n");

    if (!run.plannerResponseId) {
      const response = await this.openaiClient.responses.create({
        model: this.config.OPENAI_PLANNER_MODEL,
        input: prompt,
        background: true
      });

      if (response.status !== "completed") {
        return {
          kind: "pending" as const,
          responseId: response.id,
          artifact: createArtifact({
            id: createId("artifact"),
            kind: "response-job",
            label: "Planner response job queued",
            content: response.id
          })
        };
      }

      return {
        kind: "completed" as const,
        plan: parsePlanText(extractOutputText(response), fallbackPlan),
        artifact: createArtifact({
          id: createId("artifact"),
          kind: "plan",
          label: "OpenAI planner completed",
          content: JSON.stringify(parsePlanText(extractOutputText(response), fallbackPlan), null, 2)
        })
      };
    }

    const response = await this.openaiClient.responses.retrieve(run.plannerResponseId);
    if (response.status !== "completed") {
      return {
        kind: "pending" as const,
        responseId: run.plannerResponseId,
        artifact: createArtifact({
          id: createId("artifact"),
          kind: "response-job",
          label: "Planner response job still running",
          content: run.plannerResponseId
        })
      };
    }

    const parsed = parsePlanText(extractOutputText(response), fallbackPlan);
    return {
      kind: "completed" as const,
      plan: parsed,
      artifact: createArtifact({
        id: createId("artifact"),
        kind: "plan",
        label: "Planner response job completed",
        content: JSON.stringify(parsed, null, 2)
      })
    };
  }

  private async reviewRun(run: RunRecord) {
    const fallbackNotes = createDeterministicReviewNotes(run);
    if (!this.openaiClient) {
      return fallbackNotes;
    }

    const prompt = [
      "Review this agent run and return JSON only with a notes array.",
      `Objective: ${run.request.objective}`,
      `Status: ${run.status}`,
      `Approvals: ${JSON.stringify(run.approvals)}`,
      `Artifacts: ${JSON.stringify(run.artifacts.slice(-6))}`
    ].join("\n");

    try {
      const response = await this.openaiClient.responses.create({
        model: this.config.OPENAI_REVIEW_MODEL,
        input: prompt
      });
      return parseReviewText(extractOutputText(response), fallbackNotes);
    } catch {
      return fallbackNotes;
    }
  }
}

function cloneRun(run: RunRecord) {
  return structuredClone(run);
}

function upsertStep(run: RunRecord, key: string, role: RunRecord["steps"][number]["role"], status: RunRecord["steps"][number]["status"], details: Record<string, unknown>) {
  const existing = run.steps.find((step) => step.key === key);
  if (existing) {
    existing.status = status;
    existing.details = details;
    existing.completedAt = status === "completed" ? nowIso() : existing.completedAt;
    return;
  }

  run.steps.push({
    id: createId("step"),
    key,
    role,
    status,
    details,
    startedAt: nowIso(),
    completedAt: status === "completed" ? nowIso() : null
  });
}

function syncApprovals(run: RunRecord) {
  const riskGates = run.plan?.riskGates.length ? run.plan.riskGates : run.request.riskGates;
  return riskGates
    .filter((gate) => gate.approvalRequired)
    .map((gate) => {
      const existing = run.approvals.find((approval) => approval.gateType === gate.type);
      const timestamp = nowIso();
      return {
        id: existing?.id ?? createId("approval"),
        gateType: gate.type,
        reason: gate.reason,
        status: existing?.status ?? "pending",
        requestedBy: existing?.requestedBy ?? "system",
        approvedBy: existing?.approvedBy ?? null,
        note: existing?.note ?? null,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp
      } satisfies StoredApproval;
    });
}

function createDeterministicPlan(request: RunRequest) {
  return taskPlanSchema.parse({
    summary: `Implement "${request.objective}" with repo ops, browser QA, and explicit approvals.`,
    steps: [
      { id: "planner", title: "Draft the implementation path", role: "planner", description: "Turn the request into a concrete set of repo changes." },
      { id: "site-code", title: "Apply site-facing changes", role: "site-code", description: "Update the static site or content while preserving the current stack." },
      { id: "repo-ops", title: "Update repo automation", role: "repo-ops", description: "Keep docs, workflows, and scripts aligned with the change." },
      { id: "browser-qa", title: "Run browser smoke coverage", role: "browser-qa", description: "Validate key flows with Playwright and keep artifacts." },
      { id: "review-security", title: "Summarize risk and review state", role: "review-security", description: "Capture approvals, QA context, and merge readiness." }
    ],
    acceptanceCriteria: [
      { id: "check", description: "Run npm run check.", verification: "lint" },
      { id: "e2e", description: "Run npm run e2e.", verification: "e2e" },
      ...request.acceptanceCriteria
    ],
    riskGates: request.riskGates.length > 0 ? request.riskGates : inferRiskGates(request),
    rollbackPlan: [
      "Revert the branch changes that touched apps/site, apps/control-plane, and docs/agent.",
      "Restore the previous deployment wiring if Vercel project settings changed."
    ]
  });
}

function inferRiskGates(request: RunRequest) {
  const prompt = `${request.objective}\n${request.prompt}`.toLowerCase();
  const gates = [];

  if (/\b(dep|package|install|npm|pnpm|yarn|library)\b/.test(prompt)) {
    gates.push({ type: "dependency_change", reason: "Dependency changes should be approved before execution.", approvalRequired: true });
  }
  if (/\b(secret|token|key|env|credential)\b/.test(prompt)) {
    gates.push({ type: "secret_change", reason: "Secret and environment changes require human approval.", approvalRequired: true });
  }
  if (/\b(auth|login|session|oauth)\b/.test(prompt)) {
    gates.push({ type: "auth_change", reason: "Authentication changes require explicit review.", approvalRequired: true });
  }
  if (/\b(schema|database|postgres|migration|table)\b/.test(prompt)) {
    gates.push({ type: "data_model_change", reason: "Schema and data-model changes require approval.", approvalRequired: true });
  }

  gates.push({ type: "merge", reason: "Merging or promoting the result must stay behind a human approval gate.", approvalRequired: true });
  return gates;
}

function createDeterministicReviewNotes(run: RunRecord) {
  return [
    `Run status: ${run.status}.`,
    `Risk gates tracked: ${run.approvals.length}.`,
    run.request.previewUrl ? `Preview URL is attached: ${run.request.previewUrl}.` : "Preview URL is not attached yet."
  ];
}

function parsePlanText(text: string, fallback: TaskPlan) {
  try {
    return taskPlanSchema.parse(JSON.parse(text));
  } catch {
    return fallback;
  }
}

function parseReviewText(text: string, fallback: string[]) {
  try {
    return z.object({ notes: z.array(z.string()).default([]) }).parse(JSON.parse(text)).notes;
  } catch {
    return fallback;
  }
}
