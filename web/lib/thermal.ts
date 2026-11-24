export interface Domain {
  p1: number;
  p95: number;
  p99: number;
}
export function blend(a: string, b: string, fraction: number): string {
  const t = Math.max(0, Math.min(1, fraction));
  const rgb = [1, 3, 5].map((i) =>
    Math.round(
      parseInt(a.slice(i, i + 2), 16) * (1 - t) +
        parseInt(b.slice(i, i + 2), 16) * t,
    ),
  );
  return `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
export function temperatureColor(
  value: number,
  domain: Domain,
  colors: readonly string[],
): string {
  return value <= domain.p95
    ? blend(
        colors[0],
        colors[1],
        (value - domain.p1) / (domain.p95 - domain.p1),
      )
    : blend(
        colors[1],
        colors[2],
        (value - domain.p95) / (domain.p99 - domain.p95),
      );
}
