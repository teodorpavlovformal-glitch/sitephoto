import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.SITE_PORT ?? 4173);
const rootDir = process.cwd();

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function resolveFile(pathname: string) {
  const trimmed = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = normalize(trimmed)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^([/\\])+/, "");
  return join(rootDir, normalizedPath);
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const filePath = resolveFile(url.pathname);

  if (!existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  if (statSync(filePath).isDirectory()) {
    response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    response.end("Directory listing is disabled");
    return;
  }

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream"
  });

  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Static site available at http://127.0.0.1:${port}`);
});
