import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { blend, temperatureColor } from "../lib/thermal.ts";

const base = new URL("../public/", import.meta.url);
const { metadata: m, celdas: cells } = JSON.parse(
  await readFile(new URL("data/thermal-field.json", base), "utf8"),
);
const columns = m.agregacion.columnas;
const hex = (color) =>
  [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
const paper = hex("#f7f3ea");
const destination = new URL("images/", base);
await mkdir(destination, { recursive: true });
const reports = [];
for (const variant of [
  { name: "thermal-field", sx: 3, sy: 18 },
  { name: "thermal-field-mobile", sx: 1, sy: 14 },
]) {
  const { sx, sy } = variant;
  const width = columns * sx,
    height = 24 * sy;
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[Math.floor(x / sx) * 24 + Math.floor(y / sy)];
      const fraction =
        cell[0] === null || cell[2] === null
          ? null
          : (cell[0] - m.cuantiles.demanda.p1) /
            (m.cuantiles.demanda.p99 - m.cuantiles.demanda.p1);
      const rgb =
        fraction === null
          ? (x + y) % 8 < 2
            ? hex("#b8b1a5")
            : paper
          : hex(blend(...m.colores_demanda, fraction));
      pixels.set(rgb, (y * width + x) * 3);
    }
  }
  const domain = m.cuantiles.Tocumen;
  const paths = [];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ];
  for (const level of [domain.p1, domain.p50, domain.p95, domain.p99]) {
    const segments = [];
    for (let x = 0; x < columns - 1; x++) {
      for (let y = 0; y < 23; y++) {
        const points = [
          [x, y],
          [x + 1, y],
          [x + 1, y + 1],
          [x, y + 1],
        ];
        const values = points.map(([i, j]) =>
          cells[i * 24 + j][0] === null ? null : cells[i * 24 + j][2],
        );
        if (values.some((v) => v === null)) continue;
        const hits = [];
        for (const [a, b] of edges) {
          if (values[a] < level === values[b] < level) continue;
          const t = (level - values[a]) / (values[b] - values[a]);
          hits.push([
            (points[a][0] + (points[b][0] - points[a][0]) * t + 0.5) * sx,
            (points[a][1] + (points[b][1] - points[a][1]) * t + 0.5) * sy,
          ]);
        }
        const add = (a, b) =>
          segments.push(
            `M${a.map((v) => v.toFixed(1)).join(",")}L${b.map((v) => v.toFixed(1)).join(",")}`,
          );
        if (hits.length === 2) add(...hits);
        if (hits.length === 4) {
          const center = values.reduce((sum, v) => sum + v, 0) / 4;
          if (center < level === values[0] < level) {
            add(hits[0], hits[1]);
            add(hits[2], hits[3]);
          } else {
            add(hits[0], hits[3]);
            add(hits[1], hits[2]);
          }
        }
      }
    }
    const d = segments.join("");
    const color = temperatureColor(level, domain, m.colores_temperatura);
    paths.push(
      `<path d="${d}" stroke="#f7f3ea" stroke-width="3.4"/><path d="${d}" stroke="${color}" stroke-width="${level === domain.p95 ? 1.9 : 1.1}"/>`,
    );
  }
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="none" stroke-linecap="round">${paths.join("")}</svg>`,
  );
  const field = sharp(pixels, {
    raw: { width, height, channels: 3 },
  }).composite([{ input: overlay }]);
  const avif = await field.clone().avif({ quality: 48, effort: 6 }).toBuffer();
  const webp = await field.clone().webp({ quality: 72, effort: 6 }).toBuffer();
  await writeFile(new URL(`${variant.name}.avif`, destination), avif);
  await writeFile(new URL(`${variant.name}.webp`, destination), webp);
  reports.push({ width, height, avif: avif.length, webp: webp.length });
}
const report = {
  ...reports[0],
  mobile: reports[1],
  total: reports.reduce((sum, row) => sum + row.avif + row.webp, 0),
  limite: 120000,
  vacias: m.agregacion.celdas_vacias,
};
if (report.total > report.limite)
  throw new Error(`campo excede presupuesto: ${JSON.stringify(report)}`);
await writeFile(
  new URL("data/thermal-art.json", base),
  JSON.stringify(report) + "\n",
);
console.log(`presupuesto hero: ${JSON.stringify(report)}`);
