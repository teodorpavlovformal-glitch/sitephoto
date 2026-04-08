import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { getConfig } from "./config.js";
import { handleAppRequest } from "./http.js";
import { InMemoryRunRepository } from "./repository.js";
import { createRuntime } from "./runtime.js";

test("github webhook creates a run and returns an approval-gated summary", async () => {
  const secret = "github-secret";
  const repository = new InMemoryRunRepository();
  const runtime = createRuntime({
    config: getConfig({
      NODE_ENV: "test",
      GITHUB_WEBHOOK_SECRET: secret
    }),
    repository
  });

  const payload = {
    action: "created",
    repository: {
      owner: { login: "teodorpavlovformal-glitch" },
      name: "newsitelegit"
    },
    issue: {
      number: 7,
      title: "Add automation docs",
      body: "Keep the monorepo and approvals documented."
    },
    comment: {
      id: 99,
      body: "/agent wire the docs and keep merge approval required",
      user: { login: "teodorpavlovformal-glitch" }
    }
  };
  const rawBody = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

  const response = await handleAppRequest(
    new Request("http://localhost/webhooks/github", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": `sha256=${signature}`
      },
      body: rawBody
    }),
    runtime
  );

  assert.equal(response.status, 202);
  const json = (await response.json()) as { run: { status: string } };
  assert.equal(json.run.status, "awaiting_approval");
});
