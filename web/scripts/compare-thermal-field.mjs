import { readFile, writeFile, mkdir } from "node:fs/promises";
import { renderThermalField } from "./thermal-renderer.mjs";
const base = new URL("../public/", import.meta.url);
const output = new URL(
  "../../evidencias/rediseno/revision-campo/",
  import.meta.url,
);
await mkdir(output, { recursive: true });
const { metadata: m, celdas } = JSON.parse(
  await readFile(new URL("data/thermal-field.json", base), "utf8"),
);
for (const [name, colors, withoutTemperature] of [
  ["actual", ["#eee8dd", "#a8a295"], false],
  ["ancho", ["#eee8dd", "#a8a295"], false],
  ["contraste", ["#eee8dd", "#817b70"], false],
  ["superficie-actual", ["#eee8dd", "#a8a295"], true],
  ["superficie-contraste", ["#eee8dd", "#817b70"], true],
]) {
  const { field } = await renderThermalField(
    celdas,
    m,
    name === "actual" ? { sx: 3, sy: 18 } : { sx: 6, sy: 36, scale: 2 },
    { demandColors: colors, withoutTemperature },
  );
  const bytes = await field.avif({ quality: 48, effort: 6 }).toBuffer();
  await writeFile(new URL(`${name}.avif`, output), bytes);
  console.log(name, bytes.length);
}
