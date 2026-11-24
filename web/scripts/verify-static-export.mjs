import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "../out");
const basePath = "/enerclima-panama";
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404).end("not found");
    return;
  }

  let relative = pathname.slice(basePath.length).replace(/^\/+/, "");
  if (!relative || pathname.endsWith("/")) relative = path.join(relative, "index.html");
  const filePath = path.resolve(outDir, relative);
  if (filePath !== outDir && !filePath.startsWith(`${outDir}${path.sep}`)) {
    response.writeHead(403).end("forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, { "content-type": mime[path.extname(filePath)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const failedLocalRequests = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("requestfailed", (request) => {
  if (request.url().startsWith(origin)) failedLocalRequests.push(request.url());
});

try {
  const home = await page.goto(`${origin}${basePath}/`);
  if (home?.status() !== 200) throw new Error(`home returned ${home?.status()}`);
  await page.getByRole("heading", { name: /cuando el clima cambia/i }).waitFor();

  const background = await page.locator("#inicio").evaluate((element) => getComputedStyle(element).backgroundImage);
  if (!background.includes(`${basePath}/images/panama-energy-hero.png`)) throw new Error("hero image is missing the repository base path");

  const image = await page.request.get(`${origin}${basePath}/images/panama-energy-hero.png`);
  const data = await page.request.get(`${origin}${basePath}/data/dashboard.json`);
  if (image.status() !== 200 || data.status() !== 200) throw new Error("a static public asset did not load");

  await page.locator("#station-select").selectOption("Santiago");
  await page.locator(".sim-controls select").nth(1).selectOption("3");
  const simulatorValue = await page.locator(".sim-result > strong").innerText();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("link", { name: "Sensibilidad" }).click();
  const hasMobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  await mkdir(path.resolve(here, "../test-results"), { recursive: true });
  await page.screenshot({ path: path.resolve(here, "../test-results/export-movil.png"), fullPage: true });
  if (hasMobileOverflow || errors.length || failedLocalRequests.length) {
    throw new Error(JSON.stringify({ hasMobileOverflow, errors, failedLocalRequests }));
  }

  console.log(JSON.stringify({ home: home.status(), image: image.status(), data: data.status(), simulatorValue, hasMobileOverflow, pageErrors: errors.length, failedLocalRequests: failedLocalRequests.length }));
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}
