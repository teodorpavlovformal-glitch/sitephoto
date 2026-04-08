import "dotenv/config";

import { createRuntime } from "../runtime.js";

const runtime = createRuntime();
await runtime.repository.ensureSchema();

console.log("Control-plane database schema is ready.");
