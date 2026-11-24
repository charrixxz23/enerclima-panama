"use client";
import { useState } from "react";
import {
  number,
  stations,
  type RegionalPoint,
  type Association,
} from "../lib/dashboard";
import DataTable from "./data-table";
import LazyChart from "./lazy-chart";
export default function ClimateExplorer({
  rows,
  associations,
}: {
  rows: RegionalPoint[];
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
        <LazyChart rows={rows} dataKey={key} thermal />
        <figcaption>
          Seguimos la temperatura a dos metros en {station}; comparamos
          observaciones históricas, sin atribuir el consumo nacional a esta
          ciudad.
        </figcaption>
        <DataTable
          summary="Consultamos las temperaturas"
          caption="Temperatura a dos metros"
          headers={["Fecha", "°C"]}
          rows={rows.map((r) => [r.datetime.split("T")[0], number(r[key])])}
        />
      </figure>
      {a ? (
        <div className="association">
          <p className="kicker">Asociación ajustada · {a.estacion}</p>
          <p>
            <strong>{number(a.coeficiente_mwh_por_c)} MWh/°C</strong>
          </p>
          <p>
            IC 95%: {number(a.ic95_inferior)} a {number(a.ic95_superior)}.
          </p>
          <p>
            {a.covarianza}; controles: {a.controles}.
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
