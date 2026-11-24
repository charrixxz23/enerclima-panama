import DataTable from "../data-table";
import { number, type Quality } from "../../lib/dashboard";
export default function QualityLedger({
  quality: q,
  limitations,
}: {
  quality: Quality;
  limitations: string[];
}) {
  const highlights: [[string, number], ...Array<[string, number]>] = [
    ["Registros", q.filas],
    ["Horas faltantes", q.horas_faltantes],
    ["Fechas duplicadas", q.fechas_duplicadas],
    ["Valores nulos", q.valores_nulos],
  ];
  return (
    <div className="quality-ledger">
      <h3>Hacemos visible la calidad</h3>
      <dl className="data-ledger">
        {highlights.map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{number(value)}</dd>
          </div>
        ))}
      </dl>
      <p>
        Cobertura de fechas del archivo de pronóstico en el conjunto:{" "}
        <strong>{number(q.forecast_cobertura_pct)}%</strong>.
      </p>
      <p className="caveat">
        <b>Valor para revisión.</b> Conservamos el mínimo de{" "}
        {number(q.demanda_resumen.min)} MWh; la ausencia de huecos y nulos no
        garantiza la validez de cada observación.
      </p>
      <p className="caveat">
        <b>Discrepancia QV2M.</b> {limitations[2]}
      </p>
      <DataTable
        source="calidad"
        summary="Consultamos la auditoría completa"
        caption="Campos originales de calidad, sin redondeos"
        headers={["Campo", "Valor"]}
      />
    </div>
  );
}
