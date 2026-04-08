import "dotenv/config";

import { createRuntimeServer } from "./http.js";
import { createRuntime } from "./runtime.js";

const runtime = createRuntime();
await runtime.repository.ensureSchema();

createRuntimeServer(runtime).listen(runtime.config.CONTROL_PLANE_PORT, "127.0.0.1", () => {
  console.log(`Control plane listening on http://127.0.0.1:${runtime.config.CONTROL_PLANE_PORT}`);
});
