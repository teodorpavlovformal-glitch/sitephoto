import "dotenv/config";

import { readFileSync } from "node:fs";

import { runRequestSchema } from "@pavlov/agent-contracts";

import { createRuntime } from "../runtime.js";

const args = parseArgs(process.argv.slice(2));
const runtime = createRuntime();

await runtime.repository.ensureSchema();

const payload = args.requestFile
  ? JSON.parse(readFileSync(String(args.requestFile), "utf8"))
  : {
      title: args.title ?? args.objective ?? "Manual agent run",
      objective: args.objective ?? "Manual run requested from the CLI.",
      prompt: args.prompt ?? args.objective ?? "No prompt provided.",
      source: args.source ?? "cli",
      requestedBy: args.requestedBy ?? "cli",
      repoTarget: {
        owner: runtime.config.GITHUB_OWNER,
        repo: runtime.config.GITHUB_REPO,
        branch: args.branch ?? "main",
        baseBranch: args.baseBranch ?? "main",
        workingDirectory: args.workingDirectory ?? "."
      }
    };

const run = await runtime.repository.createRun(runRequestSchema.parse(payload));
console.log(JSON.stringify(await runtime.orchestrator.processRun(run.id), null, 2));

function parseArgs(entries: string[]) {
  const result: Record<string, string> = {};
  for (let index = 0; index < entries.length; index += 2) {
    const key = entries[index]?.replace(/^--/, "");
    const value = entries[index + 1];
    if (key) {
      result[key] = value;
    }
  }
  return result;
}
