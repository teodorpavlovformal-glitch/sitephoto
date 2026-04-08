import assert from "node:assert/strict";
import test from "node:test";

import { runRequestSchema } from "@pavlov/agent-contracts";

import { getConfig } from "./config.js";
import { AgentOrchestrator } from "./orchestrator.js";
import { InMemoryRunRepository } from "./repository.js";

test("run processing stops at approval gates, then advances after approval", async () => {
  const repository = new InMemoryRunRepository();
  const config = getConfig({
    NODE_ENV: "test"
  });
  const orchestrator = new AgentOrchestrator(config, repository);

  const run = await repository.createRun(
    runRequestSchema.parse({
      title: "Add new dependency",
      objective: "Install a dependency and document the approval path.",
      prompt: "Add a package and update the control-plane docs.",
      source: "manual",
      repoTarget: {
        owner: "teodorpavlovformal-glitch",
        repo: "newsitelegit"
      }
    })
  );

  const firstPass = await orchestrator.processRun(run.id);
  assert.equal(firstPass?.status, "awaiting_approval");
  assert.equal(firstPass?.approvals.some((approval) => approval.status === "pending"), true);

  const approved = await orchestrator.applyApproval({
    runId: run.id,
    gateType: "dependency_change",
    approved: true,
    approvedBy: "reviewer"
  });

  const mergeApproved = await orchestrator.applyApproval({
    runId: run.id,
    gateType: "merge",
    approved: true,
    approvedBy: "reviewer"
  });

  assert.equal(
    approved?.status === "awaiting_approval" ||
      approved?.status === "approved" ||
      approved?.status === "blocked",
    true
  );
  assert.equal(mergeApproved?.status === "blocked" || mergeApproved?.status === "qa_pending", true);
  assert.equal(
    mergeApproved?.artifacts.some((artifact) => artifact.kind === "workflow-dispatch"),
    true
  );
});
