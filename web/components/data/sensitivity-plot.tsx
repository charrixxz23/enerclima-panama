"use client";
import Cifra from "../cifra";
import { fmtTemp } from "../../lib/format";
import type { CSSProperties } from "react";
import { type Sensitivity } from "../../lib/dashboard";
export default function SensitivityPlot({
  rows,
  increment,
  station,
}: {
  rows: Sensitivity[];
  increment: number;
  station: string;
}) {
  const shown = rows.filter((r) => r.incremento_c === increment);
  const max = Math.max(...rows.map((r) => r.cambio_estimado_mwh));
  const x = (i: number) => 30 + (i / (shown.length - 1)) * 440;
  const y = (v: number) => 210 - (v / max) * 180;
  const d = shown
    .map((r, i) => `${i ? "L" : "M"}${x(i)} ${y(r.cambio_estimado_mwh)}`)
    .join(" ");
  const selected = shown.findIndex((r) => r.estacion === station);
  return (
    <figure className="sensitivity-plot data-piece">
      <h3>Comparamos el mismo incremento</h3>
      <svg
        viewBox="0 0 500 265"
        role="img"
        aria-label={`Cambios estimados con ${fmtTemp(increment, { signo: true })} grados en cada estación`}
      >
        <path d="M30 210H470" className="grid-line" />
        <path d={d} style={{ d: `path("${d}")` }} className="scenario-path" />
        {shown.map((r, i) => (
          <g key={r.estacion}>
            <circle
              cx={x(i)}
              cy={y(r.cambio_estimado_mwh)}
              r="4"
              fill="var(--text)"
            />
            <text
              x={x(i)}
              y="243"
              textAnchor={
                i === 0 ? "start" : i === shown.length - 1 ? "end" : "middle"
              }
            >
              {r.estacion === "Tres estaciones" ? "Conjunta" : r.estacion}
            </text>
          </g>
        ))}
        {selected >= 0 ? (
          <circle
            className="scenario-marker"
            style={
              {
                cx: x(selected),
                cy: y(shown[selected].cambio_estimado_mwh),
              } as CSSProperties
            }
            r="9"
          />
        ) : null}
      </svg>
      <ol className="scenario-legend">
        {shown.map((r) => (
          <li key={r.estacion}>{r.estacion}</li>
        ))}
      </ol>
      <figcaption>
        Comparamos cambios estimados para{" "}
        <Cifra tipo="temperatura" signo value={increment} unidad="°C" />. Unimos
        escenarios discretos para facilitar la lectura; la línea no representa
        una respuesta física continua. Cada escenario usa sus propias
        referencias válidas.
      </figcaption>
      <details>
        <summary>Consultamos los escenarios comparados</summary>
        <div className="table-scroll">
          <table>
            <caption>Cambio medio condicionado al modelo</caption>
            <thead>
              <tr>
                <th scope="col">Estación</th>
                <th scope="col">MWh</th>
                <th scope="col">Referencias válidas</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.estacion}>
                  <th scope="row">{r.estacion}</th>
                  <td>
                    <Cifra tipo="demanda" value={r.cambio_estimado_mwh} />
                  </td>
                  <td>
                    <Cifra tipo="conteo" value={r.referencias_validas} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
