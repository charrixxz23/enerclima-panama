import DataArt from "../data-art";
import DataTable from "../data-table";
import type { MonthlyPoint } from "../../lib/dashboard";
export default function MonthlyHorizon({ rows }: { rows: MonthlyPoint[] }) {
  const years = Array.from(new Set(rows.map((r) => r.mes.slice(0, 4))));
  const height = years.length * 75 + 30;
  return (
    <figure className="monthly-horizon data-piece">
      <div className="plate-heading">
        <h3>Los años, en relieve</h3>
        <span>Demanda media mensual</span>
      </div>
      {["compact", "wide"].map((mode) => (
        <div className={`ridge-plate ridge-${mode}`} key={mode}>
          <DataArt
            name={`demanda-mensual-${mode}`}
            label="Relieves anuales de demanda mensual"
            ratio={`${mode === "compact" ? 360 : 720} / ${height}`}
          />
          {years.map((year, i) => (
            <span
              className="ridge-year"
              key={year}
              style={{ top: `${((75 + i * 75 - 15) / height) * 100}%` }}
            >
              {year}
            </span>
          ))}
        </div>
      ))}
      <figcaption>
        Comparamos la forma de cada año con una escala de amplitud compartida.
        El relieve parte del mínimo mensual observado; los años incompletos
        conservan sus meses disponibles.
      </figcaption>
      <DataTable
        source="demandaMensual"
        summary="Consultamos los datos mensuales"
        caption="Demanda media mensual, MWh por intervalo"
        headers={["Mes", "MWh"]}
      />
    </figure>
  );
}
