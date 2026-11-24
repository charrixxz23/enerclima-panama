import { readFile, writeFile, mkdir } from "node:fs/promises";
import { renderThermalField } from "./thermal-renderer.mjs";
const base = new URL("../public/", import.meta.url);
const { metadata: m, celdas } = JSON.parse(
  await readFile(new URL("data/thermal-field.json", base), "utf8"),
);
const destination = new URL("images/", base);
await mkdir(destination, { recursive: true });
const reports = {};
for (const variant of [
  { key: "desktop", name: "thermal-field", sx: 3, sy: 18 },
  { key: "mobile", name: "thermal-field-mobile", sx: 1, sy: 14 },
  { key: "wide", name: "thermal-field-wide", sx: 6, sy: 36, scale: 2 },
]) {
  const { width, height, field } = await renderThermalField(celdas, m, variant);
  const avif = await field.clone().avif({ quality: 48, effort: 6 }).toBuffer();
  const webp = await field
    .clone()
    .webp({ quality: variant.key === "wide" ? 68 : 72, effort: 6 })
    .toBuffer();
  await writeFile(new URL(`${variant.name}.avif`, destination), avif);
  await writeFile(new URL(`${variant.name}.webp`, destination), webp);
  reports[variant.key] = {
    name: variant.name,
    width,
    height,
    avif: avif.length,
    webp: webp.length,
  };
}
const report = {
  ...reports.desktop,
  mobile: reports.mobile,
  wide: reports.wide,
  bytesPerVisitorMax: Math.max(
    ...Object.values(reports).flatMap((r) => [r.avif, r.webp]),
  ),
  limitePorVisitante: 120000,
  vacias: m.agregacion.celdas_vacias,
};
if (report.bytesPerVisitorMax > report.limitePorVisitante)
  throw new Error(
    `hero excede presupuesto por visitante: ${JSON.stringify(report)}`,
  );
await writeFile(
  new URL("data/thermal-art.json", base),
  JSON.stringify(report) + "\n",
);
console.log(`presupuesto hero por visitante: ${JSON.stringify(report)}`);
