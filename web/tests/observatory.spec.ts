import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import data from "../public/data/dashboard.json";
const evidence = path.resolve(process.cwd(), "../evidencias/rediseno");
const home = process.env.PLAYWRIGHT_BASE_URL
  ? new URL(process.env.PLAYWRIGHT_BASE_URL).pathname
  : "/";
const ids = [
  "inicio",
  "observatorio",
  "clima",
  "eventos",
  "modelos",
  "sensibilidad",
  "investigacion",
  "metodologia",
  "equipo",
];
test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true });
});
test("conservamos anclajes y resultados exactos del JSON", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(home);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /El clima y la energía,\s*en el mismo mapa\./,
  );
  expect(
    await page.locator("section[id]").evaluateAll((es) => es.map((e) => e.id)),
  ).toEqual(ids);
  for (const id of ids)
    await expect(page.locator(`nav a[href="#${id}"]`)).toHaveCount(1);
  await expect(page.locator("#observatorio")).toContainText(
    String(data.resumen.minima),
  );
  for (const r of data.modelo)
    for (const value of [r.mae, r.rmse, r.mape_pct, r.r2])
      await expect(page.locator("#modelos")).toContainText(String(value));
  for (const r of data.eventos)
    await expect(page.locator("#eventos")).toContainText(
      String(r.percentil_95_c),
    );
  for (const l of data.limitaciones)
    await expect(page.locator(".limitations")).toContainText(l);
  expect(errors).toEqual([]);
});
test("contrastamos los doce escenarios con los resultados originales", async ({
  page,
}) => {
  await page.goto(home);
  for (const r of data.sensibilidad) {
    await page.locator("#sensitivity-station").selectOption(r.estacion);
    await page
      .locator("#sensitivity-increment")
      .selectOption(String(r.incremento_c));
    await expect(page.locator(".sim-result > strong")).toHaveText(
      `${r.cambio_estimado_mwh > 0 ? "+" : ""}${String(r.cambio_estimado_mwh)} MWh`,
    );
    await expect(page.locator(".sim-result")).toContainText(
      String(r.cambio_estimado_pct),
    );
  }
});
test("contrastamos coeficientes e intervalos en las tres estaciones", async ({
  page,
}) => {
  await page.goto(home);
  for (const r of data.asociaciones) {
    await page.locator("#station-select").selectOption(r.estacion);
    await expect(page.locator(".association")).toContainText(
      String(r.coeficiente_mwh_por_c),
    );
    await expect(page.locator(".association")).toContainText(
      String(r.ic95_inferior),
    );
    await expect(page.locator(".association")).toContainText(
      String(r.ic95_superior),
    );
  }
});
test("navegamos a todas las anclas desde el índice móvil", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(home);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ids) {
    await page
      .getByRole("button", { name: "Índice: abrir navegación" })
      .click();
    await page.locator(`nav a[href="#${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(
      page.locator(`#${id} ${id === "inicio" ? "h1" : "h2"}`),
    ).toBeVisible();
  }
});
test("verificamos las seis anchuras y conservamos capturas", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto(home);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
      `overflow a ${width}`,
    ).toBe(false);
    await page.screenshot({
      path: path.join(evidence, `atlas-${width}.png`),
      fullPage: true,
    });
  }
});
test("cada figura ofrece una lectura y una tabla accesible", async ({
  page,
}) => {
  await page.goto(home);
  const figures = page.locator("figure");
  expect(await figures.count()).toBeGreaterThanOrEqual(6);
  for (const f of await figures.all()) {
    await expect(f.locator("figcaption")).not.toBeEmpty();
    await expect(f.locator("table")).toHaveCount(1);
    await expect(f.locator("caption")).not.toBeEmpty();
  }
  await page.locator("#inicio summary").click();
  await expect(page.locator("#inicio tbody tr")).toHaveCount(
    data.demandaDiaria.length,
  );
  await expect(page.locator("#inicio tbody tr").last()).toContainText(
    data.demandaDiaria[data.demandaDiaria.length - 1].datetime.split("T")[0],
  );
  await expect(page.locator(".correlation-cell")).toHaveCount(
    Object.keys(data.correlaciones).length,
  );
  await page.locator(".correlation-cell").last().focus();
  await expect(
    page.locator(".correlation-cell").last().locator(".correlation-explain"),
  ).toBeVisible();
  await expect(page.locator(".quality-ledger")).toContainText(
    String(data.calidad.forecast_cobertura_pct),
  );
});

test("respetamos el tema del sistema y persistimos la preferencia", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto(home);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const toggle = page.locator(".theme-toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({
    path: path.join(evidence, "atlas-oscuro.png"),
    fullPage: true,
  });
  expect(
    await page
      .locator(".draw-line")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
});
test("cargamos graficos y mapa al entrar sin recursos externos", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (r) => {
    if (
      ["image", "font", "script", "stylesheet", "fetch", "xhr"].includes(
        r.resourceType(),
      ) &&
      new URL(r.url()).origin !==
        new URL(process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000")
          .origin
    )
      remote.push(r.url());
  });
  await page.goto(home);
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  await page.locator("#clima").scrollIntoViewIfNeeded();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.locator("#station-select").scrollIntoViewIfNeeded();
  await expect(page.locator("#clima .recharts-surface")).toBeVisible();
  expect(remote).toEqual([]);
});

test("verificamos metadatos estaticos y el limite de imagenes", async ({
  page,
}) => {
  await page.goto(home);
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(schema["@graph"].map((r: { "@type": string }) => r["@type"])).toEqual([
    "Dataset",
    "ScholarlyArticle",
  ]);
  expect(schema["@graph"][0].version).toBe(data.version);
  expect(schema["@graph"][0].temporalCoverage).toBe(data.periodo.join("/"));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /images\/og-atlas\.png$/,
  );
  const manifestURL = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  expect(manifestURL).toBeTruthy();
  const manifest = await page.request.get(manifestURL!);
  expect(manifest.status()).toBe(200);
  const body = await manifest.json();
  expect(body.start_url).toBe(home);
  const { readdir, stat } = await import("node:fs/promises");
  const visit = async (dir: string): Promise<void> => {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) await visit(file);
      else if (/\.(png|webp|avif|svg|ico)$/i.test(file))
        expect((await stat(file)).size, file).toBeLessThanOrEqual(250 * 1024);
    }
  };
  await visit(path.resolve("public"));
});
