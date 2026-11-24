"use client";
import Cifra from "./cifra";
import { fmtTemp } from "../lib/format";
import SensitivityPlot from "./data/sensitivity-plot";
import { useState } from "react";
import { type Sensitivity } from "../lib/dashboard";
export default function SensitivityExplorer({ rows }: { rows: Sensitivity[] }) {
  const [station, setStation] = useState(rows[0].estacion);
  const [increment, setIncrement] = useState(rows[0].incremento_c);
  const row = rows.find(
    (r) => r.estacion === station && r.incremento_c === increment,
  );
  return (
    <div className="sensitivity-grid">
      <div>
        <div className="sim-controls">
          <label htmlFor="sensitivity-station">
            Estación
            <select
              id="sensitivity-station"
              value={station}
              onChange={(e) => setStation(e.target.value)}
            >
              {Array.from(new Set(rows.map((r) => r.estacion))).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label htmlFor="sensitivity-increment">
            Escenario
            <select
              id="sensitivity-increment"
              value={increment}
              onChange={(e) => setIncrement(Number(e.target.value))}
            >
              {Array.from(new Set(rows.map((r) => r.incremento_c))).map((i) => (
                <option
                  key={i}
                  value={i}
                  data-exact={String(i)}
                  title={String(i)}
                >
                  {fmtTemp(i, { signo: true })}
                  {"\u00a0°C"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="source-note">
          Modificamos la temperatura y mantenemos las demás variables fijas.
          Restringimos cada escenario al rango observado de entrenamiento.
        </p>
        <SensitivityPlot rows={rows} increment={increment} station={station} />
      </div>
      {row ? (
        <output className="sim-result" aria-live="polite">
          <span>Cambio medio estimado · {row.estacion}</span>
          <strong>
            <Cifra
              tipo="demanda"
              signo
              value={row.cambio_estimado_mwh}
              unidad="MWh"
            />
          </strong>
          <p>
            <Cifra tipo="porcentaje" value={row.cambio_estimado_pct} /> respecto
            a la demanda de referencia.
          </p>
          <dl>
            <div>
              <dt>Demanda base del modelo</dt>
              <dd>
                <Cifra
                  tipo="demanda"
                  value={row.demanda_base_modelo_mwh}
                  unidad="MWh"
                />
              </dd>
            </div>
            <div>
              <dt>Referencias válidas</dt>
              <dd>
                <Cifra tipo="conteo" value={row.referencias_validas} />
              </dd>
            </div>
            {row.limite_p99_c !== null ? (
              <div>
                <dt>Límite P99</dt>
                <dd>
                  <Cifra
                    tipo="temperatura"
                    value={row.limite_p99_c}
                    unidad="°C"
                  />
                </dd>
              </div>
            ) : null}
          </dl>
        </output>
      ) : (
        <p>No encontramos un escenario válido.</p>
      )}
    </div>
  );
}
