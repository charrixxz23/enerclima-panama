import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../out",
);
const prefix = "/enerclima-panama";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (!url.startsWith(prefix + "/")) {
      res.writeHead(404).end();
      return;
    }
    let relative = url.slice(prefix.length);
    if (url.endsWith("/")) relative += "index.html";
    const file = path.resolve(root, "." + relative);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    let body = await readFile(file);
    const headers = {
      "content-type": types[path.extname(file)] || "application/octet-stream",
      "cache-control": "public, max-age=600",
    };
    if (/\b(gzip)\b/.test(req.headers["accept-encoding"] || "")) {
      body = gzipSync(body);
      headers["content-encoding"] = "gzip";
    }
    res.writeHead(200, headers);
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
server.listen(3001, "127.0.0.1", () =>
  console.log("http://127.0.0.1:3001/enerclima-panama/"),
);
process.on("SIGINT", () => server.close(() => process.exit(0)));
