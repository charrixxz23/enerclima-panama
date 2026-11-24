export interface Presentacion {
  hero?: boolean;
  signo?: boolean;
}
const cache = new Map<string, Intl.NumberFormat>();
function presentar(
  value: number,
  precision: Intl.NumberFormatOptions,
  options: Presentacion = {},
): string {
  if (!Number.isFinite(value)) return "—";
  const settings: Intl.NumberFormatOptions = {
    useGrouping: true,
    ...precision,
    signDisplay: options.signo ? "exceptZero" : "auto",
  };
  const key = JSON.stringify(settings);
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("es-PA", settings);
    cache.set(key, formatter);
  }
  return formatter
    .formatToParts(value === 0 ? 0 : value)
    .map((part) => {
      if (part.type === "group") return ".";
      if (part.type === "decimal") return ",";
      if (part.type === "minusSign") return "−";
      return part.value;
    })
    .join("");
}
function decimales(
  value: number,
  digits: number,
  options: Presentacion = {},
): string {
  return presentar(
    value,
    { minimumFractionDigits: digits, maximumFractionDigits: digits },
    options,
  );
}
export function fmtDemanda(value: number, options: Presentacion = {}): string {
  return decimales(
    value,
    options.hero ? 0 : Math.abs(value) < 1 ? 2 : 1,
    options,
  );
}
export function fmtTemp(value: number, options: Presentacion = {}): string {
  return decimales(value, 1, options);
}
export function fmtCoef(value: number, options: Presentacion = {}): string {
  return decimales(value, 2, options);
}
export function fmtIC(value: number, options: Presentacion = {}): string {
  return decimales(value, 2, options);
}
export function fmtPct(value: number, options: Presentacion = {}): string {
  if (!Number.isFinite(value)) return "—";
  const magnitude = Math.abs(value);
  const text =
    magnitude > 0 && magnitude < 0.1
      ? presentar(
          value,
          { minimumSignificantDigits: 2, maximumSignificantDigits: 2 },
          options,
        )
      : decimales(value, magnitude < 10 ? 2 : 1, options);
  return `${text}%`;
}
export function fmtR2(value: number, options: Presentacion = {}): string {
  return decimales(value, 3, options);
}
export function fmtError(value: number, options: Presentacion = {}): string {
  return decimales(value, 1, options);
}
export function fmtConteo(value: number, options: Presentacion = {}): string {
  return decimales(value, 0, options);
}
export function fmtCorrelacion(
  value: number,
  options: Presentacion = {},
): string {
  return decimales(value, 2, options);
}
export function fmtP(value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 1) return "—";
  return value < 0.001 ? "p < 0,001" : `p = ${decimales(value, 3)}`;
}
export function fmtPExacto(value: number): string {
  return Number.isFinite(value) ? String(value) : "—";
}
export function fmtMagnitud(value: number, options: Presentacion = {}): string {
  return presentar(value, { maximumSignificantDigits: 4 }, options);
}
export function fmtCoordenada(
  value: number,
  options: Presentacion = {},
): string {
  return presentar(value, { maximumSignificantDigits: 4 }, options);
}
function fecha(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}
const larga = new Intl.DateTimeFormat("es-PA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const corta = new Intl.DateTimeFormat("es-PA", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
export function fmtFechaLarga(value: string): string {
  const date = fecha(value);
  return Number.isNaN(date.getTime()) ? "—" : larga.format(date);
}
export function fmtFechaCorta(value: string): string {
  const date = fecha(value);
  return Number.isNaN(date.getTime()) ? "—" : corta.format(date);
}
export function fmtCalidad(campo: string, value: unknown): string {
  if (Array.isArray(value))
    return value
      .map((item) => fmtCalidad(campo, item))
      .join(
        value.length === 2 && value.every((item) => typeof item === "number")
          ? " a "
          : ", ",
      );
  if (value && typeof value === "object")
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${fmtCalidad(`${campo}.${key}`, item)}`)
      .join("; ");
  if (typeof value === "string")
    return /(?:fecha_|generada)/.test(campo) &&
      /^\d{4}-\d{2}-\d{2}T/.test(value)
      ? fmtFechaLarga(value)
      : value;
  if (typeof value !== "number") return value === null ? "—" : String(value);
  if (campo.endsWith(".count")) return fmtConteo(value);
  if (/demanda_resumen|nat_demand/.test(campo)) return fmtDemanda(value);
  if (/T2M_/.test(campo)) return fmtTemp(value);
  if (campo.endsWith("_pct")) return fmtPct(value);
  if (/rangos_observados/.test(campo)) return fmtMagnitud(value);
  return fmtConteo(value);
}
