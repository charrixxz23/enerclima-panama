import {
  fmtDemanda,
  fmtTemp,
  fmtCoef,
  fmtIC,
  fmtPct,
  fmtR2,
  fmtError,
  fmtConteo,
  fmtCorrelacion,
  fmtP,
  fmtCoordenada,
  fmtMagnitud,
} from "../lib/format";
const formats = {
  demanda: fmtDemanda,
  temperatura: fmtTemp,
  coeficiente: fmtCoef,
  intervalo: fmtIC,
  porcentaje: fmtPct,
  r2: fmtR2,
  error: fmtError,
  conteo: fmtConteo,
  correlacion: fmtCorrelacion,
  p: fmtP,
  coordenada: fmtCoordenada,
  magnitud: fmtMagnitud,
};
export default function Cifra({
  value,
  tipo,
  unidad,
  hero = false,
  signo = false,
}: {
  value: number;
  tipo: keyof typeof formats;
  unidad?: string;
  hero?: boolean;
  signo?: boolean;
}) {
  const text = formats[tipo](value, { hero, signo });
  return (
    <span className="cifra" data-exact={String(value)} title={String(value)}>
      {text}
      {unidad && Number.isFinite(value) ? `\u00a0${unidad}` : ""}
    </span>
  );
}
