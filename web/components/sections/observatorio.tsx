import DemandClock from "../data/demand-clock";
import MonthlyHorizon from "../data/monthly-horizon";
import { dashboard as data } from "../../lib/data";
import { number, dateLabel } from "../../lib/dashboard";
import SectionHeading from "../section-heading";
import DataTable from "../data-table";
import LazyChart from "../lazy-chart";
export default function Observatorio() {
  return (
    <section id="observatorio" className="atlas-section">
      <SectionHeading
        index="01"
        label="Observatorio energético"
        title="El pulso de la red."
        description="Reunimos demanda nacional y meteorología horaria para reconocer patrones y cambios en el tiempo."
      />
      <dl className="data-ledger">
        <div>
          <dt>Registros horarios</dt>
          <dd>{number(data.resumen.filas)}</dd>
          <dd className="ledger-note">
            <small>
              {dateLabel(data.periodo[0])} — {dateLabel(data.periodo[1])}
            </small>
          </dd>
        </div>
        <div>
          <dt>Demanda media · MWh</dt>
          <dd>{number(data.resumen.media)}</dd>
          <dd className="ledger-note">
            <small>Por intervalo horario</small>
          </dd>
        </div>
        <div>
          <dt>Demanda máxima · MWh</dt>
          <dd>{number(data.resumen.maxima)}</dd>
          <dd className="ledger-note">
            <small>Máximo del periodo observado</small>
          </dd>
        </div>
      </dl>
      <div className="editorial-grid">
        <div className="margin-note">
          <h3>Una historia, muchas escalas</h3>
          <p>
            Observamos la media semanal nacional. Leemos sus variaciones junto
            al clima de tres puntos del país.
          </p>
          <p className="caveat">
            <b>Revisamos el mínimo</b>
            <br />
            Conservamos {number(data.resumen.minima)} MWh en la serie. Un
            registro completo también puede contener valores que requieren
            revisión.
          </p>
        </div>
        <figure className="data-piece">
          <LazyChart source="demandaSemanal" dataKey="demanda_mwh" />
          <figcaption>
            La media semanal muestra variaciones en la demanda nacional durante
            el periodo histórico. La unidad es MWh por intervalo horario.
          </figcaption>
          <DataTable
            source="demandaSemanal"
            summary="Consultamos los datos semanales"
            caption="Demanda media semanal"
            headers={["Fecha", "MWh"]}
          />
        </figure>
      </div>
      <div className="signature-grid">
        <DemandClock rows={data.perfilHorario} />
        <MonthlyHorizon rows={data.demandaMensual} />
      </div>
      <p className="source-note">
        Fuente: CND de Panamá y NASA Earthdata, integrados en Short-term
        electricity load forecasting (Panama).
      </p>
    </section>
  );
}
