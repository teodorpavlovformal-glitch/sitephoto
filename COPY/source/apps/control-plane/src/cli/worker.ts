import "dotenv/config";

import { createArtifact, createId, nowIso } from "../utils.js";
import { createRuntime } from "../runtime.js";

const args = parseArgs(process.argv.slice(2));
const runtime = createRuntime();

await runtime.repository.ensureSchema();

if (args.runId) {
  const run = await runtime.repository.getRun(args.runId);
  if (!run) {
    console.error(`Run ${args.runId} not found.`);
    process.exitCode = 1;
  } else {
    if (args.phase === "post-execution") {
      run.artifacts = [
        ...run.artifacts,
        createArtifact({
          id: createId("artifact"),
          kind: "log",
          label: "GitHub Actions execution update",
          content: args.status ?? "unknown",
          metadata: { phase: "post-execution" }
        })
      ];
      if (args.previewUrl) {
        run.request.previewUrl = args.previewUrl;
      }
      run.updatedAt = nowIso();
      await runtime.repository.saveRun(run);
    }

    console.log(JSON.stringify(await runtime.orchestrator.processRun(args.runId), null, 2));
  }
} else {
  const activeRuns = await runtime.repository.listActiveRuns();
  const processed = [];

  for (const run of activeRuns) {
    processed.push(await runtime.orchestrator.processRun(run.id));
  }

  console.log(JSON.stringify(processed, null, 2));
}

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
