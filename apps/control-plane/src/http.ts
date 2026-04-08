import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { runRequestSchema } from "@pavlov/agent-contracts";

import {
  buildRunRequestFromGitHubWebhook,
  buildRunRequestFromVercelWebhook,
  parseApprovalPayload
} from "./integrations.js";
import type { RuntimeDependencies } from "./runtime.js";
import {
  jsonResponse,
  normalizePath,
  parseJson,
  verifyGitHubSignature,
  verifySharedSecret
} from "./utils.js";

export async function handleAppRequest(request: Request, runtime: RuntimeDependencies) {
  await runtime.repository.ensureSchema();

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (request.method === "GET" && path === "/health") {
    return jsonResponse({
      ok: true,
      siteProjectId: runtime.config.AGENT_SITE_PROJECT_ID,
      siteTeamId: runtime.config.AGENT_SITE_TEAM_ID
    });
  }

  if (request.method === "POST" && path === "/runs") {
    const payload = await parseJson(request, runRequestSchema);
    const run = await runtime.repository.createRun(payload);
    const processed = await runtime.orchestrator.processRun(run.id);
    return jsonResponse({ run: processed }, 202);
  }

  const runMatch = path.match(/^\/runs\/([^/]+)$/);
  if (request.method === "GET" && runMatch) {
    const run = await runtime.repository.getRun(runMatch[1]);
    return run ? jsonResponse({ run }) : jsonResponse({ error: "Run not found" }, 404);
  }

  const approveMatch = path.match(/^\/runs\/([^/]+)\/approve$/);
  if (request.method === "POST" && approveMatch) {
    const payload = await request.json();
    const decision = parseApprovalPayload(approveMatch[1], payload);
    const run = await runtime.orchestrator.applyApproval(decision);
    return run ? jsonResponse({ run }, 202) : jsonResponse({ error: "Run not found" }, 404);
  }

  if (request.method === "POST" && path === "/webhooks/github") {
    const rawBody = await request.text();
    const isValid = verifyGitHubSignature(
      rawBody,
      request.headers.get("x-hub-signature-256"),
      runtime.config.GITHUB_WEBHOOK_SECRET
    );

    if (!isValid) {
      return jsonResponse({ error: "Invalid GitHub signature" }, 401);
    }

    const payload = JSON.parse(rawBody);
    const runRequest = buildRunRequestFromGitHubWebhook(payload, runtime.config);

    if (!runRequest) {
      return jsonResponse({ accepted: false, reason: "No actionable /agent comment found." }, 202);
    }

    const run = await runtime.repository.createRun(runRequest);
    const processed = await runtime.orchestrator.processRun(run.id);
    return jsonResponse({ run: processed }, 202);
  }

  if (request.method === "POST" && path === "/webhooks/vercel") {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-vercel-signature") ?? request.headers.get("x-agent-secret") ?? null;
    const isValid = verifySharedSecret(
      signature,
      runtime.config.VERCEL_WEBHOOK_SECRET ?? runtime.config.AGENT_SHARED_SECRET
    );

    if (!isValid) {
      return jsonResponse({ error: "Invalid Vercel webhook secret" }, 401);
    }

    const payload = JSON.parse(rawBody);
    const event = buildRunRequestFromVercelWebhook(payload, runtime.config);

    if (!event) {
      return jsonResponse({ accepted: false, reason: "Webhook payload did not include a deployment URL." }, 202);
    }

    if ("existingRunId" in event) {
      const existingRun = await runtime.repository.getRun(event.existingRunId);
      if (!existingRun) {
        return jsonResponse({ accepted: false, reason: "Referenced run was not found." }, 404);
      }

      existingRun.request.previewUrl = event.previewUrl;
      existingRun.updatedAt = new Date().toISOString();
      await runtime.repository.saveRun(existingRun);
      const processed = await runtime.orchestrator.processRun(existingRun.id);
      return jsonResponse({ run: processed }, 202);
    }

    const run = await runtime.repository.createRun(event.runRequest);
    const processed = await runtime.orchestrator.processRun(run.id);
    return jsonResponse({ run: processed }, 202);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

export function createNodeHandler(runtime: RuntimeDependencies) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const body = await readRawBody(req);
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      } else if (value) {
        headers.set(key, value);
      }
    }

    const request = new Request(buildUrl(req), {
      method: req.method,
      headers,
      body: body.length > 0 ? body : undefined
    });
    const response = await handleAppRequest(request, runtime);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.end(Buffer.from(await response.arrayBuffer()));
  };
}

export function createRuntimeServer(runtime: RuntimeDependencies) {
  return createServer(createNodeHandler(runtime));
}

async function readRawBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function buildUrl(req: IncomingMessage) {
  const host = req.headers.host ?? "127.0.0.1";
  const protocol = req.headers["x-forwarded-proto"] ?? "http";
  return `${protocol}://${host}${req.url ?? "/"}`;
}
