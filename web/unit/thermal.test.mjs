import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { temperatureColor } from "../lib/thermal.ts";
const read = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../public/data/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const field = read("thermal-field");
const { metadata: m, celdas: cells } = field;
test("conservamos conteos completos y ocultamos las celdas insuficientes", () => {
  assert.equal(cells.length, 501 * 24);
  assert.equal(
    cells.reduce((sum, cell) => sum + cell[1], 0),
    48048,
  );
  assert.equal(
    cells.reduce((sum, cell) => sum + cell[3], 0),
    48048,
  );
  assert.equal(cells.filter((cell) => cell[0] === null).length, 23);
  for (const cell of cells) {
    assert.ok(cell[1] <= 4 && cell[3] <= 4);
    assert.equal(cell[0] === null, cell[1] < 3);
    assert.equal(cell[2] === null, cell[3] < 3);
  }
  assert.deepEqual(read("thermal-summary"), m);
});
test("anclamos la rampa a p1 p95 p99 y conservamos el umbral oficial del analisis", () => {
  const q = m.cuantiles.Tocumen;
  const dashboard = read("dashboard");
  assert.equal(q.p95, dashboard.eventos[0].percentil_95_c);
  assert.equal(q.p99, dashboard.sensibilidad[0].limite_p99_c);
  for (const [key, i] of [
    ["p1", 0],
    ["p95", 1],
    ["p99", 2],
  ])
    assert.equal(
      temperatureColor(q[key], q, m.colores_temperatura),
      m.colores_temperatura[i],
    );
  assert.equal(
    temperatureColor(-100, q, m.colores_temperatura),
    m.colores_temperatura[0],
  );
  assert.equal(
    temperatureColor(100, q, m.colores_temperatura),
    m.colores_temperatura[2],
  );
});
test("mantenemos contraste de las tres anclas contra el papel", () => {
  const luminance = (hex) =>
    [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  for (const color of m.colores_temperatura)
    assert.ok((luminance("#f7f3ea") + 0.05) / (luminance(color) + 0.05) >= 4.5);
});
test("cerramos el presupuesto por visitante en cada variante y formato", () => {
  for (const file of [
    "images/panama-energy-hero.png",
    "images/panama-energy-hero.webp",
    "images/panama-energy-hero.avif",
    "previews/portada.png",
  ])
    assert.equal(
      existsSync(new URL(`../public/${file}`, import.meta.url)),
      false,
      file,
    );
  const a = read("thermal-art");
  const sizes = [a, a.mobile, a.wide].flatMap((variant) =>
    ["avif", "webp"].map((ext) => {
      const bytes = readFileSync(
        new URL(`../public/images/${variant.name}.${ext}`, import.meta.url),
      ).length;
      assert.equal(bytes, variant[ext]);
      assert.ok(bytes <= a.limitePorVisitante);
      return bytes;
    }),
  );
  assert.equal(a.bytesPerVisitorMax, Math.max(...sizes));
});

test("distinguimos los extremos de demanda sin cambiar la rampa termica", () => {
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  assert.ok(
    (lum(m.colores_demanda[0]) + 0.05) / (lum(m.colores_demanda[1]) + 0.05) >=
      3,
  );
  assert.deepEqual(m.colores_temperatura, ["#21656b", "#776b5b", "#b43e2e"]);
});
