import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fmtTemp, fmtFechaLarga, fmtConteo } from "../lib/format.ts";
const base = new URL("../public/", import.meta.url);
const raw = await readFile(new URL("data/dashboard.json", base));
const data = JSON.parse(raw);
const output = new URL("images/profiles/", base);
const tables = new URL("data/profiles/", base);
await mkdir(output, { recursive: true });
await mkdir(tables, { recursive: true });
const all = data.temperaturaRegional;
const keys = ["T2M_toc", "T2M_san", "T2M_dav"];
const lo = Math.min(...all.flatMap((row) => keys.map((key) => row[key])));
const hi = Math.max(...all.flatMap((row) => keys.map((key) => row[key])));
const config = [
  ["observatorio", "Tocumen", "T2M_toc", "completo"],
  ["clima", "Santiago", "T2M_san", "completo"],
  ["eventos", "David", "T2M_dav", "completo"],
  ["modelos", "Santiago", "T2M_san", "validacion"],
  ["sensibilidad", "Tocumen", "T2M_toc", "prueba"],
  ["investigacion", "David", "T2M_dav", "entrenamiento"],
  ["metodologia", "Santiago", "T2M_san", "entrenamiento"],
  ["equipo", "David", "T2M_dav", "prueba"],
];
const stamp = (value) => Date.parse(value.slice(0, 10));
const px = (value) => Number(value.toFixed(3));
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function curve(points) {
  const delta = points
    .slice(1)
    .map((p, i) => (p.y - points[i].y) / (p.x - points[i].x));
  const slope = points.map((_, i) =>
    i === 0
      ? delta[0]
      : i === points.length - 1
        ? delta.at(-1)
        : delta[i - 1] * delta[i] <= 0
          ? 0
          : 2 / (1 / delta[i - 1] + 1 / delta[i]),
  );
  for (let i = 0; i < delta.length; i++) {
    if (delta[i] === 0) {
      slope[i] = 0;
      slope[i + 1] = 0;
      continue;
    }
    const length = Math.hypot(slope[i] / delta[i], slope[i + 1] / delta[i]);
    if (length > 3) {
      slope[i] *= 3 / length;
      slope[i + 1] *= 3 / length;
    }
  }
  return (
    `M${px(points[0].x)} ${px(points[0].y)}` +
    points
      .slice(1)
      .map((p, j) => {
        const previous = points[j],
          step = (p.x - previous.x) / 3;
        return `C${px(previous.x + step)} ${px(previous.y + slope[j] * step)} ${px(p.x - step)} ${px(p.y - slope[j + 1] * step)} ${px(p.x)} ${px(p.y)}`;
      })
      .join("")
  );
}
const profiles = {};
for (const [id, station, key, period] of config) {
  const from = period === "completo" ? "" : data.particion[`inicio_${period}`];
  const until = period === "completo" ? "" : data.particion[`fin_${period}`];
  const rows = all.filter(
    (row) =>
      (!from || row.datetime >= from) && (!until || row.datetime <= until),
  );
  const start = stamp(rows[0].datetime),
    duration = stamp(rows.at(-1).datetime) - start;
  const points = rows.map((row) => ({
    x: ((stamp(row.datetime) - start) / duration) * 1200,
    y: 30 + ((hi - row[key]) / (hi - lo)) * 110,
  }));
  const path = curve(points),
    bottomPath = curve(points.map((p) => ({ ...p, y: 180 - p.y })));
  const svg = (body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 180" preserveAspectRatio="none">${body}</svg>`;
  const mask = (d) =>
    svg(
      `<defs><clipPath id="edge"><path d="${d}"/></clipPath></defs><path d="M0 0H1200V180H0Z" fill="white" clip-path="url(#edge)"/>`,
    );
  await writeFile(
    new URL(`${id}-top.svg`, output),
    mask(`${path}L1200 180H0Z`),
  );
  await writeFile(
    new URL(`${id}-bottom.svg`, output),
    mask(`${bottomPath}L1200 0H0Z`),
  );
  await writeFile(
    new URL(`${id}-stroke.svg`, output),
    svg(`<path d="${path}" stroke="white" stroke-width="1.4" fill="none"/>`),
  );
  const minimum = rows.reduce((a, b) => (a[key] < b[key] ? a : b));
  const maximum = rows.reduce((a, b) => (a[key] > b[key] ? a : b));
  profiles[id] = {
    station,
    key,
    period,
    from,
    until,
    n: rows.length,
    first: rows[0].datetime,
    last: rows.at(-1).datetime,
    min: minimum[key],
    max: maximum[key],
    maskTop: `images/profiles/${id}-top.svg`,
    maskBottom: `images/profiles/${id}-bottom.svg`,
    stroke: `images/profiles/${id}-stroke.svg`,
    table: `data/profiles/${id}.html`,
  };
  const exact = (value, formatted) =>
    `<span class="cifra" data-exact="${value}" title="${value}">${formatted}</span>`;
  const periodLabel =
    period === "completo"
      ? "registro completo"
      : period === "validacion"
        ? "validación"
        : period;
  profiles[id].header =
    `<div class="profile-stroke" aria-hidden="true"></div><div class="profile-caption"><figcaption>Leemos el perfil temporal de ${station} · ${exact(rows.length, fmtConteo(rows.length))} medias semanales, una cada dos semanas · ${periodLabel}. Recorremos ${exact(minimum[key], fmtTemp(minimum[key]))} a ${exact(maximum[key], fmtTemp(maximum[key]) + "\u00a0°C")}.</figcaption><details class="profile-details"><summary>Consultamos la tabla del perfil</summary><template><iframe src="__BASE_PATH__/${profiles[id].table}" loading="lazy" title="Tabla del perfil temporal de ${station}, ${id}"></iframe></template><p><a href="__BASE_PATH__/${profiles[id].table}" target="_blank" rel="noreferrer">Abrimos la tabla completa</a> · <a href="__BASE_PATH__/data/dashboard.json">Consultamos el JSON</a></p></details></div>`;
  const body = rows
    .map(
      (row) =>
        `<tr><th scope="row"><time datetime="${esc(row.datetime)}" title="${esc(row.datetime)}">${esc(fmtFechaLarga(row.datetime))}</time></th><td class="number" data-exact="${row[key]}" title="${row[key]}">${fmtTemp(row[key])}\u00a0°C</td></tr>`,
    )
    .join("");
  await writeFile(
    new URL(`${id}.html`, tables),
    `<!doctype html><html lang="es-PA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Perfil temporal de ${station}</title><style>@font-face{font-family:source;src:url('../../fonts/source-sans-3-400-latin.woff2')} :root{color-scheme:light}body{margin:0;padding:12px;background:#f7f3ea;color:#152421;font:16px/1.5 source,Arial,sans-serif}table{width:100%;border-collapse:collapse}caption{text-align:left;font-weight:bold;margin-bottom:12px}th,td{padding:8px;text-align:left;border-bottom:1px solid #cfc7b9}time{overflow-wrap:anywhere}td{font-variant-numeric:tabular-nums;white-space:nowrap}a{color:inherit}a:focus-visible{outline:3px solid #152421}</style></head><body><table><caption>Consultamos ${rows.length} medias semanales de ${station}, muestreadas cada dos semanas; periodo ${period === "validacion" ? "validación" : period}.</caption><thead><tr><th scope="col">Fecha de referencia</th><th scope="col">Temperatura</th></tr></thead><tbody>${body}</tbody></table><p>Conservamos los valores completos en los atributos y en <a href="../dashboard.json">dashboard.json</a>.</p></body></html>`,
  );
}
await writeFile(
  new URL("data/temporal-profiles.json", base),
  JSON.stringify({
    sourceSha256: createHash("sha256").update(raw).digest("hex"),
    domain: { min: lo, max: hi },
    profiles,
  }) + "\n",
);
console.log(
  `generamos ${config.length} perfiles temporales y sus tablas estaticas`,
);
