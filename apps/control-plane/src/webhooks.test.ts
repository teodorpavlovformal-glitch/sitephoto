import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { getConfig } from "./config.js";
import {
  buildRunRequestFromGitHubWebhook,
  buildRunRequestFromVercelWebhook
} from "./integrations.js";
import { verifyGitHubSignature, verifySharedSecret } from "./utils.js";

test("github webhook parsing extracts /agent comments", () => {
  const config = getConfig({
    NODE_ENV: "test"
  });
  const request = buildRunRequestFromGitHubWebhook(
    {
      action: "created",
      repository: {
        owner: { login: "teodorpavlovformal-glitch" },
        name: "newsitelegit"
      },
      issue: {
        number: 12,
        title: "Homepage refresh",
        body: "Need stronger lead copy."
      },
      comment: {
        id: 77,
        body: "/agent update the hero section and keep approvals intact",
        user: { login: "teodorpavlovformal-glitch" }
      }
    },
    config
  );

  assert.equal(request?.source, "github_comment");
  assert.match(request?.objective ?? "", /update the hero section/i);
});

test("vercel webhook can attach a preview url to an existing run", () => {
  const config = getConfig({
    NODE_ENV: "test"
  });
  const event = buildRunRequestFromVercelWebhook(
    {
      payload: {
        url: "preview-example.vercel.app",
        meta: {
          runId: "run_123"
        }
      }
    },
    config
  );

  assert.deepEqual(event, {
    existingRunId: "run_123",
    previewUrl: "https://preview-example.vercel.app"
  });
});

test("github signatures and shared secrets are verified", () => {
  const rawBody = JSON.stringify({ hello: "world" });
  const secret = "topsecret";
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

  assert.equal(verifyGitHubSignature(rawBody, `sha256=${signature}`, secret), true);
  assert.equal(verifyGitHubSignature(rawBody, "sha256=bad", secret), false);
  assert.equal(verifySharedSecret("secret-value", "secret-value"), true);
  assert.equal(verifySharedSecret("secret-value", "different"), false);
});
