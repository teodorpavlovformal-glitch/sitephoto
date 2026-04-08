import assert from "node:assert/strict";
import test from "node:test";

import {
  runRecordSchema,
  runRequestSchema,
  runSummarySchema,
  taskPlanSchema
} from "./index.js";

test("run request applies the expected defaults", () => {
  const request = runRequestSchema.parse({
    title: "Refresh homepage copy",
    objective: "Update the static site and keep the agent workflow documented.",
    prompt: "Improve the copy and keep the repo ready for agent execution.",
    source: "manual",
    repoTarget: {
      owner: "teodorpavlovformal-glitch",
      repo: "newsitelegit"
    }
  });

  assert.equal(request.specialistRoles.length, 5);
  assert.equal(request.repoTarget.baseBranch, "main");
});

test("task plan and run summary remain schema-compatible", () => {
  const plan = taskPlanSchema.parse({
    summary: "Implement the change with docs, checks, and approval gates.",
    steps: [
      {
        id: "planner",
        title: "Draft task plan",
        role: "planner",
        description: "Turn the request into a concrete implementation plan."
      }
    ],
    acceptanceCriteria: [
      {
        id: "check",
        description: "Run lint and tests.",
        verification: "test"
      }
    ]
  });

  const summary = runSummarySchema.parse({
    runId: "run_123",
    status: "awaiting_approval",
    plan,
    approvals: [
      {
        gateType: "merge",
        status: "pending",
        reason: "A human must approve the merge."
      }
    ]
  });

  const record = runRecordSchema.parse({
    id: "run_123",
    status: "awaiting_approval",
    request: runRequestSchema.parse({
      title: "Refresh homepage copy",
      objective: "Update the static site.",
      prompt: "Improve the public marketing copy.",
      source: "manual",
      repoTarget: {
        owner: "teodorpavlovformal-glitch",
        repo: "newsitelegit"
      }
    }),
    plan,
    summary,
    approvals: [],
    artifacts: [],
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  assert.equal(record.summary?.status, "awaiting_approval");
});
