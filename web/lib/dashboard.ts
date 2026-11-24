export interface DemandPoint { datetime: string; demanda_mwh: number }
export interface MonthlyPoint { mes: string; demanda_mwh: number }
export interface HourPoint { hora: number; demanda_mwh: number }
export interface RegionalPoint { datetime: string; T2M_toc: number; T2M_san: number; T2M_dav: number }
export interface Station { nombre: string; temperatura: string; latitud: number; longitud: number; nota: string }
export interface Model { modelo: string; mae: number; rmse: number; mape_pct: number; r2: number }
export interface Sensitivity { estacion: string; incremento_c: number; referencias_validas: number; limite_p99_c: number | null; demanda_base_modelo_mwh: number; cambio_estimado_mwh: number; cambio_estimado_pct: number; tipo: string }
export interface ThermalEvent { estacion: string; percentil_95_c: number; horas_sobre_umbral: number; dias_con_horas_elevadas: number; demanda_media_eventos_mwh: number; demanda_media_resto_mwh: number; diferencia_media_mwh: number }
export interface Association { estacion: string; variable: string; coeficiente_mwh_por_c: number; error_estandar_hac: number; ic95_inferior: number; ic95_superior: number; p_valor: number; n: number; covarianza: string; controles: string }
export interface TemperatureMetric extends Omit<Model, "modelo"> { estacion: string; grupo: string; umbral_c_entrenamiento: number; filas: number }
export interface Partition { train_filas: number; validacion_filas: number; prueba_filas: number; inicio_prueba: string; fin_prueba: string; inicio_entrenamiento: string; fin_entrenamiento: string; inicio_validacion: string; fin_validacion: string; modelo_seleccionado: string; modelo_climatico_sensibilidad: string }
export interface Quality {
  filas: number; columnas: number; nombres_columnas: string[]; fecha_inicio: string; fecha_fin: string; frecuencia_moda: string; intervalos_no_horarios: number; horas_esperadas: number; horas_faltantes: number; fechas_duplicadas: number; filas_duplicadas: number; valores_nulos: number; valores_infinitos: number; forecast_filas: number; forecast_fechas_en_dataset: number; forecast_cobertura_pct: number; indicadores: Record<string, number[]>; demanda_resumen: Record<string, number>; rangos_observados: Record<string, number[]>; fuera_de_limites_cribado_amplio: number; auditoria_generada: string; version_analisis: string;
}
export interface Dashboard {
  version: string; generado: string; periodo: string[]; unidad: string;
  resumen: { filas: number; media: number; mediana: number; maxima: number; minima: number };
  modelo: Model[]; modeloSeleccionado: string; particion: Partition; sensibilidad: Sensitivity[]; eventos: ThermalEvent[]; asociaciones: Association[]; temperaturaMetricas: TemperatureMetric[];
  predespacho: Model & { filas_comparadas: number; semanas_oficiales: number; horizonte_horas_por_semana: number; comparabilidad: string; comparar_con_modelo_rodante: boolean };
  limitaciones: string[]; demandaSemanal: DemandPoint[]; demandaDiaria: DemandPoint[]; demandaMensual: MonthlyPoint[]; perfilHorario: HourPoint[]; temperaturaRegional: RegionalPoint[]; estaciones: Station[]; correlaciones: Record<string, number>; calidad: Quality;
}

export function parseDashboard(input: unknown): Dashboard {
  if (!input || typeof input !== "object") throw new Error("datos ausentes");
  const d = input as Dashboard;
  for (const key of ["demandaSemanal", "demandaDiaria", "demandaMensual", "perfilHorario", "modelo", "sensibilidad", "limitaciones"] as const) {
    if (!Array.isArray(d[key]) || !d[key].length) throw new Error(`serie ausente: ${key}`);
  }
  function finite(value: unknown): void {
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error("valor no finito");
    if (value && typeof value === "object") Object.values(value).forEach(finite);
  }
  finite(d);
  if (!d.modelo.some(row => row.modelo === d.modeloSeleccionado)) throw new Error("modelo seleccionado ausente");
  return d;
}

export function number(value: number, legacyDigits?: number): string {
  void legacyDigits;
  const raw = String(value);
  if (/[eE]/.test(raw)) return raw;
  const [integer, fraction] = raw.split(".");
  return new Intl.NumberFormat("es-PA", { maximumFractionDigits: 0 }).format(Number(integer)) + (fraction ? `.${fraction}` : "");
}
export const signed = (value: number) => `${value > 0 ? "+" : ""}${number(value)}`;
export function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("es-PA", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/${path.replace(/^\//, "")}`;
export const stations = [
  { key: "toc", name: "Tocumen", temp: "T2M_toc", color: "var(--warm)", region: "Panamá" },
  { key: "san", name: "Santiago", temp: "T2M_san", color: "var(--hot)", region: "Veraguas" },
  { key: "dav", name: "David", temp: "T2M_dav", color: "var(--cool)", region: "Chiriquí" },
] as const;
