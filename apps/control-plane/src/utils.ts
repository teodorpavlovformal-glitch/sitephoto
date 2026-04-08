import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import type { RunArtifact, RunStatus } from "@pavlov/agent-contracts";

export function createId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export async function parseJson<T>(request: Request, schema: z.ZodType<T>) {
  const payload = await request.json();
  return schema.parse(payload);
}

export function normalizePath(pathname: string) {
  const withoutApi = pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
  if (withoutApi === "/api") {
    return "/";
  }
  return withoutApi.replace(/\/+$/, "") || "/";
}

export function verifyGitHubSignature(rawBody: string, header: string | null, secret?: string) {
  if (!secret) {
    return true;
  }
  if (!header?.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeCompare(expected, header.slice("sha256=".length));
}

export function verifySharedSecret(candidate: string | null, secret?: string) {
  if (!secret) {
    return true;
  }
  if (!candidate) {
    return false;
  }
  return safeCompare(candidate, secret);
}

export function extractOutputText(response: { output_text?: string; output?: Array<Record<string, unknown>> }) {
  if (response.output_text) {
    return response.output_text;
  }

  const outputItems = response.output ?? [];
  for (const item of outputItems) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const piece of content) {
      if (piece && typeof piece === "object" && piece.type === "output_text" && typeof piece.text === "string") {
        return piece.text;
      }
    }
  }

  return "";
}

export function createArtifact(
  artifact: Omit<RunArtifact, "createdAt"> & { createdAt?: string }
): RunArtifact {
  return {
    ...artifact,
    createdAt: artifact.createdAt ?? nowIso()
  };
}

export function pushArtifact(artifacts: RunArtifact[], artifact: RunArtifact) {
  return [...artifacts, artifact];
}

export function summarizeNextActions(status: RunStatus, pendingReasons: string[], hasPreview: boolean) {
  if (status === "planning") {
    return ["Wait for the planner response job to finish, then rerun the worker."];
  }
  if (status === "awaiting_approval") {
    return pendingReasons.map((reason) => `Await approval: ${reason}`);
  }
  if (status === "blocked") {
    return [
      "Provide the missing GitHub workflow configuration or dispatch the implementation job manually.",
      "Rerun the worker after the dispatch dependency is available."
    ];
  }
  if (status === "qa_pending") {
    return hasPreview
      ? ["Run Playwright smoke coverage against the preview URL and attach traces/screenshots to the run."]
      : ["Attach a preview URL before browser QA can continue."];
  }
  if (status === "reviewing") {
    return hasPreview
      ? ["Review the QA output, confirm risk gates, and promote or merge when ready."]
      : ["Wait for preview and QA artifacts, then complete the review summary."];
  }
  if (status === "rejected") {
    return ["Revise the request or create a follow-up run with the required changes."];
  }
  if (status === "approved") {
    return ["Dispatch the Codex execution workflow."];
  }
  return [];
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
