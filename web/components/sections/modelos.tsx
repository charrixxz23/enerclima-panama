import Cifra from "../cifra";
import Fecha from "../fecha";
import { dashboard as data } from "../../lib/data";

import SectionHeading from "../section-heading";
export default function Modelos() {
  return (
    <section id="modelos" className="atlas-section">
      <SectionHeading
        index="04"
        label="Modelos"
        title="El contexto histórico aporta información."
        description="Evaluamos referencias y regresiones con un corte cronológico. Seleccionamos el modelo por el menor RMSE de validación."
      />
      <p className="caveat prominent">
        {data.limitaciones[0]} Usamos rezagos disponibles y clima observado de
        la hora objetivo.
      </p>
      <div className="table-scroll model-comparison">
        <table>
          <caption>
            Resultados en prueba · modelo seleccionado:{" "}
            {data.modeloSeleccionado.replaceAll("_", " ")}
          </caption>
          <thead>
            <tr>
              <th scope="col">Modelo</th>
              <th scope="col">MAE · MWh</th>
              <th scope="col">RMSE · MWh</th>
              <th scope="col">MAPE · %</th>
              <th scope="col">R²</th>
            </tr>
          </thead>
          <tbody>
            {data.modelo.map((r) => (
              <tr
                key={r.modelo}
                className={
                  r.modelo === data.modeloSeleccionado ? "selected-model" : ""
                }
              >
                <th scope="row">
                  {r.modelo.replaceAll("_", " ")}
                  {r.modelo === data.modeloSeleccionado ? (
                    <small>Seleccionado en validación</small>
                  ) : null}
                </th>
                <td>
                  <Cifra tipo="error" value={r.mae} />
                </td>
                <td>
                  <Cifra tipo="error" value={r.rmse} />
                </td>
                <td>
                  <Cifra tipo="porcentaje" value={r.mape_pct} />
                </td>
                <td>
                  <Cifra tipo="r2" value={r.r2} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="notes-grid">
        <p>
          MAE: error absoluto medio. RMSE: penaliza más los errores grandes.
          MAPE: error relativo. R²: variación explicada.
        </p>
        <p>
          Periodo de prueba: <Fecha value={data.particion.inicio_prueba} /> —{" "}
          <Fecha value={data.particion.fin_prueba} />. Conservamos{" "}
          <Cifra tipo="conteo" value={data.particion.prueba_filas} />{" "}
          observaciones.
        </p>
      </div>
      <aside className="benchmark">
        <h3>Una referencia con otro horizonte</h3>
        <p>
          Reportamos el predespacho semanal por separado: cubre{" "}
          <Cifra tipo="conteo" value={data.predespacho.semanas_oficiales} />{" "}
          semanas y{" "}
          <Cifra tipo="conteo" value={data.predespacho.filas_comparadas} />{" "}
          horas. Su horizonte es de{" "}
          <Cifra
            tipo="conteo"
            value={data.predespacho.horizonte_horas_por_semana}
          />{" "}
          horas por semana.
        </p>
        <dl className="data-ledger">
          <div>
            <dt>MAE · MWh</dt>
            <dd>
              <Cifra tipo="error" value={data.predespacho.mae} />
            </dd>
          </div>
          <div>
            <dt>RMSE · MWh</dt>
            <dd>
              <Cifra tipo="error" value={data.predespacho.rmse} />
            </dd>
          </div>
          <div>
            <dt>MAPE · %</dt>
            <dd>
              <Cifra tipo="porcentaje" value={data.predespacho.mape_pct} />
            </dd>
          </div>
          <div>
            <dt>R²</dt>
            <dd>
              <Cifra tipo="r2" value={data.predespacho.r2} />
            </dd>
          </div>
        </dl>
        <p className="source-note">
          {data.predespacho.comparabilidad}. No equiparamos su horizonte con la
          evaluación rodante del modelo.
        </p>
      </aside>
    </section>
  );
}
