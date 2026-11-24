import { readFile, mkdir, writeFile } from "node:fs/promises";
const data = JSON.parse(
  await readFile(
    new URL("../public/data/dashboard.json", import.meta.url),
    "utf8",
  ),
);
const target = new URL("../public/images/data/", import.meta.url);
await mkdir(target, { recursive: true });
// limitamos la precision de coordenadas graficas y conservamos los valores cientificos
const px = (value) => String(Number(value.toFixed(2)));
const svg = (width, height, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`;
const rows = data.demandaDiaria,
  low = Math.min(...rows.map((r) => r.demanda_mwh)),
  high = Math.max(...rows.map((r) => r.demanda_mwh));
const points = rows
  .map(
    (r, i) =>
      `${px((i / (rows.length - 1)) * 700)},${px(250 - ((r.demanda_mwh - low) / (high - low)) * 200)}`,
  )
  .join(" ");
await writeFile(
  new URL("demanda-diaria.svg", target),
  svg(
    700,
    280,
    `<path d="M0 50H700M0 150H700M0 250H700" stroke="white" opacity=".2"/><polyline points="${points}" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>`,
  ),
);
const hours = data.perfilHorario,
  max = Math.max(...hours.map((r) => r.demanda_mwh));
const point = (hour, value) => {
  const a = (hour / hours.length) * Math.PI * 2 - Math.PI / 2;
  return `${px(180 + ((Math.cos(a) * value) / max) * 140)},${px(180 + ((Math.sin(a) * value) / max) * 140)}`;
};
const grid =
  [0.25, 0.5, 0.75, 1]
    .map((r) => `<circle cx="180" cy="180" r="${140 * r}"/>`)
    .join("") +
  hours
    .map((r) => {
      const [x, y] = point(r.hora, max).split(",");
      return `<path d="M180 180L${x} ${y}"/>`;
    })
    .join("");
const clock = hours.map((r) => point(r.hora, r.demanda_mwh)).join(" ");
await writeFile(
  new URL("perfil-horario.svg", target),
  svg(
    360,
    360,
    `<g fill="none" stroke="white" opacity=".2">${grid}</g><polygon points="${clock}" fill="white" opacity=".1"/><polygon points="${clock}" fill="none" stroke="white" stroke-width="2"/>`,
  ),
);
const monthly = data.demandaMensual,
  years = [...new Set(monthly.map((r) => r.mes.slice(0, 4)))];
const mn = Math.min(...monthly.map((r) => r.demanda_mwh)),
  mx = Math.max(...monthly.map((r) => r.demanda_mwh));
for (const [width, start, end, name] of [
  [360, 60, 345, "compact"],
  [720, 80, 680, "wide"],
]) {
  const body = years
    .map((year, i) => {
      const items = monthly.filter((r) => r.mes.startsWith(year)),
        base = 75 + i * 75;
      const x = (r) =>
        start + ((Number(r.mes.slice(5)) - 1) / 11) * (end - start);
      const curve = items
        .map(
          (r, j) =>
            `${j ? "L" : "M"}${px(x(r))} ${px(base - ((r.demanda_mwh - mn) / (mx - mn)) * 48)}`,
        )
        .join(" ");
      return `<path d="M${start} ${base}H${end}" stroke="white" opacity=".35"/><path d="${curve}L${px(x(items.at(-1)))} ${base}L${start} ${base}Z" fill="white" opacity=".16"/><path d="${curve}" fill="none" stroke="white" stroke-width="3"/>`;
    })
    .join("");
  await writeFile(
    new URL(`demanda-mensual-${name}.svg`, target),
    svg(width, years.length * 75 + 30, body),
  );
}
console.log("generamos los svg desde dashboard.json");
