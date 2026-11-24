import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const output = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../evidencias/rediseno",
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    colorScheme: "light",
  });
  await page.goto(
    process.env.PLAYWRIGHT_BASE_URL ||
      "http://127.0.0.1:3001/enerclima-panama/",
  );
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content:
      "section[id] { content-visibility: visible !important; contain-intrinsic-size: none !important; }",
  });
  await page.screenshot({ path: path.join(output, "portada-final.png") });
  await page
    .locator("#sensibilidad")
    .screenshot({ path: path.join(output, "simulador-final.png") });
  await page.locator(".theme-toggle").click();
  await page
    .locator("#inicio")
    .screenshot({ path: path.join(output, "portada-oscura-final.png") });
  console.log("capturas finales guardadas");
} finally {
  await browser.close();
}
