import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
const output = new URL(
  "../../evidencias/rediseno/revision-campo/",
  import.meta.url,
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 2560, height: 1600 },
    reducedMotion: "reduce",
  });
  for (const name of [
    "actual",
    "ancho",
    "contraste",
    "superficie-actual",
    "superficie-contraste",
  ]) {
    await page.unrouteAll();
    await page.route("**/images/thermal-field*.avif", (route) =>
      route.fulfill({
        path: fileURLToPath(new URL(`${name}.avif`, output)),
        contentType: "image/avif",
      }),
    );
    await page.goto("https://charrixxz23.github.io/enerclima-panama/");
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content:
        ".atlas-hero { width: calc(100% - 32px) !important; max-width: none !important; } .thermal-field { width: 100% !important; }",
    });
    await page.locator(".field-plot img").evaluate((image) => image.decode());
    const shot = fileURLToPath(new URL(`2560-${name}.png`, output));
    await page.locator(".field-plot").screenshot({ path: shot });
    if (name === "actual" || name === "ancho")
      await page.screenshot({
        path: fileURLToPath(new URL(`2560-${name}-viewport.png`, output)),
      });
    const info = await sharp(shot).metadata();
    await sharp(shot)
      .extract({ left: 730, top: 230, width: 600, height: 220 })
      .toFile(fileURLToPath(new URL(`detalle-${name}.png`, output)));
    console.log(name, info.width, info.height);
  }
} finally {
  await browser.close();
}
