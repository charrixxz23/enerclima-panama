import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const evidencePath = path.resolve(process.cwd(), "../evidencias/web");
const homePath = process.env.PLAYWRIGHT_BASE_URL ? new URL(process.env.PLAYWRIGHT_BASE_URL).pathname : "/";

test.beforeAll(async () => {
  await mkdir(evidencePath, { recursive: true });
});

test("renderiza resultados reales y secciones principales", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(homePath);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /el clima y la energía/i })).toBeVisible();
  await expect(page.locator("#observatorio")).toContainText("48,048");
  await expect(page.locator("#observatorio")).toContainText("85.19250000000002 MWh");
  await expect(page.locator("#clima .map-note a")).toHaveAttribute("href", /aoml\.noaa\.gov/);
  await expect(page.locator("#modelos")).toContainText("27.722937184313444");
  await expect(page.locator("#sensibilidad")).toContainText("+0.4392553074213805 MWh");
  const ids = await page.locator("section[id]").evaluateAll((nodes) => nodes.map((node) => node.id));
  for (const id of ids) await expect(page.locator(`a[href="#${id}"]`).first()).toHaveCount(1);
  for (const [section, name] of [["inicio", "portada"], ["observatorio", "observatorio"], ["clima", "clima"], ["eventos", "eventos"], ["modelos", "modelos"]]) {
    await page.locator(`#${section}`).screenshot({ path: path.join(evidencePath, `${name}-1440.png`) });
  }
  await page.screenshot({ path: path.join(evidencePath, "inicio-1440.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("los filtros cambian los datos destacados y el escenario", async ({ page }) => {
  await page.goto(homePath);
  await page.locator("#station-select").selectOption("Santiago");
  await expect(page.locator("#clima")).toContainText("Santiago");
  await page.locator("#station-select").selectOption("Tocumen");
  const initial = await page.locator(".sim-result > strong").innerText();
  const selects = page.locator(".sim-controls select");
  await selects.nth(1).selectOption("3");
  await expect(page.locator(".sim-result > strong")).not.toHaveText(initial);
  await page.locator("#sensibilidad").screenshot({ path: path.join(evidencePath, "simulador-1440.png") });
});

test("la navegación móvil se abre y lleva a la sección seleccionada", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(homePath);
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("link", { name: "Sensibilidad" }).click();
  await expect(page).toHaveURL(/#sensibilidad$/);
  await expect(page.locator("#sensibilidad h2")).toBeVisible();
  await page.screenshot({ path: path.join(evidencePath, "movil-390.png"), fullPage: true });
});

test("captura las vistas responsivas requeridas", async ({ page }) => {
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
    await page.goto(homePath);
    await expect(page.locator("h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `overflow horizontal a ${width}px`).toBe(false);
    await page.screenshot({ path: path.join(evidencePath, `viewport-${width}.png`), fullPage: true });
  }
});
