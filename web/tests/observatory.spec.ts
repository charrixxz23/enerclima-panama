import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import data from "../public/data/dashboard.json";
import field from "../public/data/thermal-field.json";
import {
  fmtDemanda,
  fmtTemp,
  fmtCoef,
  fmtIC,
  fmtPct,
  fmtR2,
  fmtError,
} from "../lib/format";
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
  await expect(
    page.locator(`#observatorio [data-exact="${data.resumen.minima}"]`),
  ).toHaveText("85,2\u00a0MWh");
  await expect(
    page.locator(`#observatorio [data-exact="${data.resumen.media}"]`),
  ).toHaveText("1.183\u00a0MWh");
  await expect(
    page.locator(`#observatorio [data-exact="${data.resumen.filas}"]`),
  ).toHaveText("48.048");
  for (const r of data.modelo) {
    for (const [value, expected] of [
      [r.mae, fmtError(r.mae)],
      [r.rmse, fmtError(r.rmse)],
      [r.mape_pct, fmtPct(r.mape_pct)],
      [r.r2, fmtR2(r.r2)],
    ] as const) {
      const cell = page.locator(`.model-comparison [data-exact="${value}"]`);
      await expect(cell).toHaveText(expected);
      await expect(cell).toHaveAttribute("title", String(value));
    }
  }
  for (const r of data.eventos)
    await expect(
      page.locator(`#eventos .event-ledger [data-exact="${r.percentil_95_c}"]`),
    ).toHaveText(`${fmtTemp(r.percentil_95_c)}\u00a0°C`);
  await expect(page.locator("#metodologia .rounding-policy")).toContainText(
    "cuatro cifras significativas",
  );
  await expect(
    page.locator(
      `#metodologia [data-exact="${data.particion.inicio_entrenamiento}"]`,
    ),
  ).toHaveText("10 de enero de 2015");
  for (const l of data.limitaciones)
    await expect(page.locator(".limitations")).toContainText(l);
  expect(errors).toEqual([]);
});
test("contrastamos los doce escenarios con los resultados originales", async ({
  page,
}) => {
  await page.goto(home);
  await page.locator("#sensibilidad").scrollIntoViewIfNeeded();
  for (const r of data.sensibilidad) {
    await page.locator("#sensitivity-station").selectOption(r.estacion);
    await page
      .locator("#sensitivity-increment")
      .selectOption(String(r.incremento_c));
    await expect(page.locator(".sim-result > strong")).toHaveText(
      `${fmtDemanda(r.cambio_estimado_mwh, { signo: true })}\u00a0MWh`,
    );
    await expect(
      page.locator(".sim-result > strong [data-exact]"),
    ).toHaveAttribute("data-exact", String(r.cambio_estimado_mwh));
    await expect(
      page.locator(`.sim-result [data-exact="${r.cambio_estimado_pct}"]`),
    ).toHaveText(fmtPct(r.cambio_estimado_pct));
  }
});
test("contrastamos coeficientes e intervalos en las tres estaciones", async ({
  page,
}) => {
  await page.goto(home);
  await page.locator("#clima").scrollIntoViewIfNeeded();
  for (const r of data.asociaciones) {
    await page.locator("#station-select").selectOption(r.estacion);
    await expect(
      page.locator(`.association [data-exact="${r.coeficiente_mwh_por_c}"]`),
    ).toHaveText(`${fmtCoef(r.coeficiente_mwh_por_c)}\u00a0MWh/°C`);
    await expect(
      page.locator(`.association [data-exact="${r.ic95_inferior}"]`),
    ).toHaveText(fmtIC(r.ic95_inferior));
    await expect(
      page.locator(`.association [data-exact="${r.ic95_superior}"]`),
    ).toHaveText(fmtIC(r.ic95_superior));
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
test("verificamos las siete anchuras y conservamos capturas", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  for (const width of [360, 390, 768, 1024, 1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto(home);
    await expect(page.locator("h1")).toBeVisible();
    const ratio = await page
      .locator(".field-plot img")
      .evaluate(async (element) => {
        const image = element as HTMLImageElement;
        await image.decode();
        const box = image.getBoundingClientRect();
        return {
          displayed: box.width / box.height,
          intrinsic: image.naturalWidth / image.naturalHeight,
          source: image.currentSrc,
        };
      });
    expect(Math.abs(ratio.displayed / ratio.intrinsic - 1)).toBeLessThan(0.01);
    expect(ratio.source.includes("thermal-field-mobile")).toBe(width < 768);
    expect(ratio.source.includes("thermal-field-wide")).toBe(width >= 1600);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
      `overflow a ${width}`,
    ).toBe(false);
    for (const id of ids) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        ),
        `overflow en ${id} a ${width}`,
      ).toBe(false);
    }
    if (width <= 768) {
      for (const selector of [
        "h1",
        ".hero-description",
        ".field-plot",
        ".field-legends",
        ".thermal-field figcaption",
      ]) {
        const box = await page.locator(selector).boundingBox();
        expect(
          box!.x,
          `${selector} izquierdo a ${width}`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          box!.x + box!.width,
          `${selector} derecho a ${width}`,
        ).toBeLessThanOrEqual(width);
      }
    }
    await page.locator("#inicio").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(evidence, `atlas-${width}.png`),
      fullPage: true,
      style:
        ".atlas-section { content-visibility: visible !important; contain-intrinsic-size: none !important; }",
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
    if ((await f.getAttribute("class"))?.includes("temporal-profile")) {
      await f.scrollIntoViewIfNeeded();
      await f.locator("summary").click();
      const frame = f.frameLocator("iframe");
      await expect(frame.locator("table")).toHaveCount(1);
      await expect(frame.locator("tbody tr")).toHaveCount(
        Number(await f.getAttribute("data-profile-count")),
      );
      await expect(frame.locator("caption")).not.toBeEmpty();
      await expect(frame.locator("script")).toHaveCount(0);
      await f.locator("summary").click();
    } else {
      await expect(f.locator("table")).toHaveCount(1);
      await expect(f.locator("caption")).not.toBeEmpty();
    }
  }
  await page.locator("#inicio summary").click();
  await expect(page.locator("#inicio tbody tr")).toHaveCount(24);
  await expect(page.locator("#inicio tbody tr").last()).toContainText("23 h");
  await expect(page.locator(".correlation-cell")).toHaveCount(
    Object.keys(data.correlaciones).length,
  );
  await page.locator(".correlation-cell").last().focus();
  await expect(
    page.locator(".correlation-cell").last().locator(".correlation-explain"),
  ).toBeVisible();
  await expect(
    page.locator(
      `.quality-ledger [data-exact="${data.calidad.forecast_cobertura_pct}"]`,
    ),
  ).toHaveText("97,9%");
  await expect(
    page.locator(
      `.correlation-cell [data-exact="${data.correlaciones.QV2M_toc}"]`,
    ),
  ).toHaveText("−0,02");
});

test("mantenemos un solo tema claro con preferencias oscuras anteriores", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.addInitScript(() =>
    localStorage.setItem("enerclima-theme-v1", "dark"),
  );
  await page.goto(home);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".theme-toggle")).toHaveCount(0);
  expect(
    await page
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe("rgb(247, 243, 234)");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
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
  const scriptBodies: Promise<string>[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "script")
      scriptBodies.push(response.text().catch(() => ""));
  });
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
  await page.waitForLoadState("networkidle");
  const initial = (await Promise.all(scriptBodies)).join("\n");
  expect(initial.includes("recharts-wrapper")).toBe(false);
  expect(initial.includes("leaflet-pane")).toBe(false);
  await page.locator("#clima").scrollIntoViewIfNeeded();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.locator("#station-select").scrollIntoViewIfNeeded();
  await expect(page.locator("#clima .recharts-surface")).toBeVisible();
  const entered = (await Promise.all(scriptBodies)).join("\n");
  expect(entered.includes("recharts-wrapper")).toBe(true);
  expect(entered.includes("leaflet-pane")).toBe(true);
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

test("conservamos el valor completo y los espacios duros en pantalla", async ({
  page,
}) => {
  await page.goto(home);
  await page.locator("#sensibilidad").scrollIntoViewIfNeeded();
  await expect(page.locator(".sim-result > strong")).toHaveText(
    "+0,44\u00a0MWh",
  );
  await expect(page.locator(".sim-result > strong .cifra")).toHaveAttribute(
    "data-exact",
    String(data.sensibilidad[0].cambio_estimado_mwh),
  );
  await expect(
    page.locator(
      `.sim-result [data-exact="${data.sensibilidad[0].cambio_estimado_pct}"]`,
    ),
  ).toHaveText("0,037%");
  expect(await page.locator(".sim-result > strong").textContent()).toContain(
    "\u00a0MWh",
  );
  const widths = await page
    .locator(".sim-result > strong .cifra")
    .evaluate(async (element) => {
      await document.fonts.ready;
      const style = getComputedStyle(element);
      const probe = document.createElement("span");
      Object.assign(probe.style, {
        position: "absolute",
        visibility: "hidden",
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontVariantNumeric: "tabular-nums lining-nums",
        fontFeatureSettings: style.fontFeatureSettings,
      });
      document.body.append(probe);
      const sizes = Array.from({ length: 10 }, (_, i) => {
        probe.textContent = String(i);
        return probe.getBoundingClientRect().width;
      });
      probe.remove();
      return sizes;
    });
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.02);
  await page.locator("#clima").scrollIntoViewIfNeeded();
  await expect(page.locator(".association")).toContainText(
    "IC 95%: 18,33 a 27,11",
  );
  await expect(page.locator(".association")).toContainText("p < 0,001");
  await expect(page.locator(".exact-p-note")).toContainText(
    String(data.asociaciones[0].p_valor),
  );
  await page.locator("#inicio summary").click();
  const row = page.locator("#inicio tbody tr").first();
  await expect(row.locator("td").first()).toHaveText(
    fmtDemanda(field.celdas[0][0]!),
  );
  await expect(row.locator("td").first().locator(".cifra")).toHaveAttribute(
    "data-exact",
    String(field.celdas[0][0]),
  );
});

test("cargamos el agregado solo al abrir la tabla y marcamos los huecos", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(home);
  await expect(page.locator(".field-plot img")).toBeVisible();
  expect(
    await page
      .locator(".field-plot img")
      .evaluate((element) => (element as HTMLImageElement).naturalWidth),
  ).toBe(1503);
  expect(requests.some((url) => url.endsWith("/thermal-field.json"))).toBe(
    false,
  );
  await page.locator("#inicio summary").click();
  await expect(page.locator("#inicio tbody tr")).toHaveCount(24);
  await page.locator(".field-block select").selectOption("500");
  await expect(page.locator("#inicio tbody tr").nth(1)).toContainText("Vacía");
  await expect(
    page.locator("#inicio tbody tr").nth(1).locator("td").nth(1),
  ).toHaveText("2");
  expect(
    requests.filter((url) => url.endsWith("/thermal-field.json")),
  ).toHaveLength(1);
  expect(await page.locator("#inicio rect").count()).toBeLessThan(10);
});

test("descargamos una sola imagen del campo por visitante", async ({
  page,
}) => {
  for (const width of [390, 1440, 2560]) {
    const selected: string[] = [];
    const listener = (response: import("@playwright/test").Response) => {
      if (
        response.request().resourceType() === "image" &&
        /\/thermal-field(?:-mobile|-wide)?\.(avif|webp)$/.test(response.url())
      )
        selected.push(response.url());
    };
    await page.goto("about:blank");
    await page.setViewportSize({ width, height: 1000 });
    page.on("response", listener);
    await page.goto(home);
    const source = await page
      .locator(".field-plot img")
      .evaluate(async (element) => {
        const image = element as HTMLImageElement;
        await image.decode();
        return image.currentSrc;
      });
    await page.waitForLoadState("networkidle");
    expect(selected).toEqual([source]);
    const resource = await page.request.get(source);
    expect((await resource.body()).length).toBeLessThanOrEqual(120000);
    page.off("response", listener);
  }
});

test("entrelazamos tres elementos y diferimos las tablas de los perfiles", async ({
  page,
}) => {
  const tables: string[] = [];
  page.on("request", (request) => {
    if (/\/data\/profiles\/.*\.html$/.test(request.url()))
      tables.push(request.url());
  });
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto(home);
  await page.waitForLoadState("networkidle");
  expect(tables).toEqual([]);
  const ids = [
    "observatorio",
    "clima",
    "eventos",
    "modelos",
    "sensibilidad",
    "investigacion",
    "metodologia",
    "equipo",
  ];
  for (const id of ids) {
    await expect(
      page.locator(`#${id} .profile-details iframe`),
    ).toHaveAttribute("loading", "lazy");
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  }
  await page.locator(".clock-context").scrollIntoViewIfNeeded();
  await expect(page.locator(".clock-context")).toContainText("1.384,9");
  await expect(page.getByRole("img", { name: "Reloj radial de demanda media por hora" })).toBeVisible();
  expect(
    await page.locator("main").evaluate((e) => getComputedStyle(e).overflowY),
  ).toBe("visible");
  const header = await page.locator(".atlas-header").boundingBox();
  const continuation = await page.locator(".hero-continuation").boundingBox();
  expect(continuation!.y).toBeLessThan(header!.y + header!.height);
  const inner = await page.locator("#eventos .temporal-content").boundingBox();
  for (const selector of [
    ".thermal-field",
    ".clock-crossing",
    ".thermal-margin",
  ]) {
    const box = await page.locator(selector).boundingBox();
    expect(
      box!.x < inner!.x || box!.x + box!.width > inner!.x + inner!.width,
      selector,
    ).toBe(true);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1920);
  }
  await expect(page.locator("#horas-tocumen")).toHaveAttribute(
    "aria-describedby",
    "annotation-p95",
  );
  expect(
    await page
      .locator("#eventos .temporal-content")
      .evaluate((e) => getComputedStyle(e).paddingTop),
  ).toBe("48px");
  expect(
    await page
      .locator("#metodologia .temporal-content")
      .evaluate((e) => getComputedStyle(e).paddingTop),
  ).toBe("128px");
});
