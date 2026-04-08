import { createNodeHandler } from "../src/http.js";
import { createRuntime } from "../src/runtime.js";

const runtime = createRuntime();

export default createNodeHandler(runtime);
