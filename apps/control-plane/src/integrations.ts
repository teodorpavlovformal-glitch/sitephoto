import { approvalDecisionSchema, runRequestSchema } from "@pavlov/agent-contracts";

import type { RuntimeConfig } from "./config.js";

type GitHubIssueCommentEvent = {
  action?: string;
  repository?: {
    owner?: { login?: string };
    name?: string;
  };
  issue?: {
    number?: number;
    title?: string;
    body?: string;
    user?: { login?: string };
  };
  comment?: {
    id?: number;
    body?: string;
    user?: { login?: string };
  };
};

type VercelDeploymentEvent = {
  type?: string;
  url?: string;
  payload?: {
    url?: string;
    target?: string;
    meta?: Record<string, string>;
    creator?: { username?: string };
    git?: {
      repo?: string;
      repoOwner?: string;
      branch?: string;
    };
  };
};

export function buildRunRequestFromGitHubWebhook(rawPayload: unknown, config: RuntimeConfig) {
  const payload = rawPayload as GitHubIssueCommentEvent;
  const commentBody = payload.comment?.body?.trim() ?? "";

  if (payload.action !== "created" || !commentBody.startsWith("/agent")) {
    return null;
  }

  const objective = commentBody.replace(/^\/agent\s*/, "").trim();
  if (!objective) {
    return null;
  }

  const owner = payload.repository?.owner?.login ?? config.GITHUB_OWNER;
  const repo = payload.repository?.name ?? config.GITHUB_REPO;
  const requestedBy = payload.comment?.user?.login ?? payload.issue?.user?.login ?? "github-user";

  return runRequestSchema.parse({
    title: payload.issue?.title ?? `Issue #${payload.issue?.number ?? "unknown"} agent run`,
    objective,
    prompt: [
      `GitHub issue: ${payload.issue?.title ?? "Untitled issue"}`,
      payload.issue?.body ?? "",
      "",
      `Comment request: ${commentBody}`
    ]
      .filter(Boolean)
      .join("\n"),
    source: "github_comment",
    requestedBy,
    repoTarget: {
      owner,
      repo,
      branch: "main",
      baseBranch: "main",
      workingDirectory: "."
    },
    metadata: {
      issueNumber: String(payload.issue?.number ?? ""),
      commentId: String(payload.comment?.id ?? "")
    }
  });
}

export function buildRunRequestFromVercelWebhook(rawPayload: unknown, config: RuntimeConfig) {
  const payload = rawPayload as VercelDeploymentEvent;
  const url = payload.payload?.url ?? payload.url;
  const meta = payload.payload?.meta ?? {};
  const existingRunId = meta.runId ?? meta.run_id ?? null;

  if (existingRunId && url) {
    return {
      existingRunId,
      previewUrl: url.startsWith("http") ? url : `https://${url}`
    };
  }

  if (!url) {
    return null;
  }

  return {
    runRequest: runRequestSchema.parse({
      title: `Validate Vercel deployment (${payload.payload?.target ?? "preview"})`,
      objective: `Review the Vercel deployment at ${url} with browser QA and produce a summary.`,
      prompt: `Inspect the deployment, validate the preview URL, and record review notes for ${url}.`,
      source: "vercel_deployment",
      requestedBy: payload.payload?.creator?.username ?? "vercel",
      repoTarget: {
        owner: payload.payload?.git?.repoOwner ?? config.GITHUB_OWNER,
        repo: payload.payload?.git?.repo ?? config.GITHUB_REPO,
        branch: payload.payload?.git?.branch ?? "main",
        baseBranch: "main",
        workingDirectory: "."
      },
      previewUrl: url.startsWith("http") ? url : `https://${url}`,
      metadata: {
        deploymentTarget: payload.payload?.target ?? "preview"
      }
    })
  };
}

export async function dispatchGitHubWorkflow(
  config: RuntimeConfig,
  runId: string,
  objective: string
) {
  if (!config.GITHUB_TOKEN) {
    return {
      dispatched: false,
      message: "GitHub token is not configured for workflow dispatch."
    };
  }

  const response = await fetch(
    `https://api.github.com/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/actions/workflows/${config.GITHUB_WORKFLOW_ID}/dispatches`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.GITHUB_TOKEN}`,
        "content-type": "application/json",
        accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          run_id: runId,
          objective
        }
      })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return {
      dispatched: false,
      message: `GitHub workflow dispatch failed: ${response.status} ${body}`
    };
  }

  return {
    dispatched: true,
    message: `GitHub workflow ${config.GITHUB_WORKFLOW_ID} dispatched.`
  };
}

export function parseApprovalPayload(runId: string, rawPayload: unknown) {
  return approvalDecisionSchema.parse({
    ...rawPayload,
    runId
  });
}
