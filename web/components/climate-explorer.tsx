"use client";
import Cifra from "./cifra";
import { fmtPExacto } from "../lib/format";
import { useState } from "react";
import { stations, type Association } from "../lib/dashboard";
import DataTable from "./data-table";
import LazyChart from "./lazy-chart";
export default function ClimateExplorer({
  associations,
}: {
  associations: Association[];
}) {
  const [station, setStation] = useState("Tocumen");
  const key = stations.find((s) => s.name === station)?.temp ?? "T2M_toc";
  const a = associations.find((a) => a.estacion === station);
  return (
    <div>
      <label className="control-label" htmlFor="station-select">
        Estación destacada
      </label>
      <select
        id="station-select"
        value={station}
        onChange={(e) => setStation(e.target.value)}
      >
        {stations.map((s) => (
          <option key={s.key}>{s.name}</option>
        ))}
      </select>
      <figure className="data-piece">
        <LazyChart source="temperaturaRegional" dataKey={key} thermal />
        <figcaption>
          Seguimos la temperatura a dos metros en {station}; comparamos
          observaciones históricas, sin atribuir el consumo nacional a esta
          ciudad.
        </figcaption>
        <DataTable
          source="temperaturaRegional"
          summary="Consultamos las temperaturas"
          caption="Temperatura a dos metros"
          headers={["Fecha", "°C"]}
          valueKey={key}
        />
      </figure>
      {a ? (
        <div className="association">
          <p className="kicker">Asociación ajustada · {a.estacion}</p>
          <p>
            <strong>
              <Cifra
                tipo="coeficiente"
                value={a.coeficiente_mwh_por_c}
                unidad="MWh/°C"
              />
            </strong>
          </p>
          <p>
            IC 95%: <Cifra tipo="intervalo" value={a.ic95_inferior} /> a{" "}
            <Cifra tipo="intervalo" value={a.ic95_superior} />.
          </p>
          <p>
            {a.covarianza}; controles: {a.controles}.
          </p>
          <p>
            <Cifra tipo="p" value={a.p_valor} />
          </p>
          <p className="source-note exact-p-note">
            Conservamos el valor completo de p en esta nota:{" "}
            <span data-exact={String(a.p_valor)}>{fmtPExacto(a.p_valor)}</span>.
          </p>
          <p className="caveat">
            Describimos una asociación estadística. No demostramos causalidad ni
            estimamos consumo regional.
          </p>
        </div>
      ) : null}
    </div>
  );
}
