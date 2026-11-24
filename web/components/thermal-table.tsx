"use client";
import { useState } from "react";
import { asset } from "../lib/dashboard";
import { fmtFechaLarga, fmtConteo } from "../lib/format";
import Cifra from "./cifra";
type Cell = [number | null, number, number | null, number];
interface Field {
  celdas: Cell[];
  metadata: { agregacion: { origen: string; columnas: number } };
}
export default function ThermalTable() {
  const [field, setField] = useState<Field | null>(null);
  const [block, setBlock] = useState(0);
  const [failed, setFailed] = useState(false);
  const day = (index: number) => {
    const start = new Date(field!.metadata.agregacion.origen + "Z");
    start.setUTCDate(start.getUTCDate() + index * 4);
    return start.toISOString();
  };
  return (
    <details
      className="thermal-table"
      onToggle={async (event) => {
        if (event.currentTarget.open && !field) {
          try {
            setFailed(false);
            const response = await fetch(asset("data/thermal-field.json"));
            if (!response.ok) throw new Error("agregado ausente");
            setField((await response.json()) as Field);
          } catch {
            setFailed(true);
          }
        }
      }}
    >
      <summary>Consultamos las celdas y sus conteos</summary>
      {field ? (
        <label className="field-block">
          Bloque de cuatro días desde
          <select
            value={block}
            onChange={(event) => setBlock(Number(event.target.value))}
          >
            {Array.from(
              { length: field.metadata.agregacion.columnas },
              (_, index) => (
                <option key={index} value={index}>
                  {fmtFechaLarga(day(index))}
                </option>
              ),
            )}
          </select>
        </label>
      ) : null}
      <div className="table-scroll">
        <table>
          <caption>
            Medias por bloque y hora registrada; mostramos vacía cuando n es
            menor que tres.
          </caption>
          <thead>
            <tr>
              {[
                "Hora",
                "Demanda, MWh",
                "n demanda",
                "Tocumen, °C",
                "n temperatura",
              ].map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {field ? (
              field.celdas
                .slice(block * 24, (block + 1) * 24)
                .map((cell, hour) => (
                  <tr key={hour}>
                    <th scope="row" className="cifra">
                      {fmtConteo(hour)} h
                    </th>
                    <td>
                      {cell[0] === null ? (
                        "Vacía"
                      ) : (
                        <Cifra tipo="demanda" value={cell[0]} />
                      )}
                    </td>
                    <td>
                      <Cifra tipo="conteo" value={cell[1]} />
                    </td>
                    <td>
                      {cell[2] === null ? (
                        "Vacía"
                      ) : (
                        <Cifra tipo="temperatura" value={cell[2]} />
                      )}
                    </td>
                    <td>
                      <Cifra tipo="conteo" value={cell[3]} />
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5}>
                  {failed
                    ? "No pudimos cargar el agregado; ofrecemos el enlace completo."
                    : "Abrimos la tabla para consultar las celdas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <a href={asset("data/thermal-field.json")}>
        Consultamos el agregado completo en JSON
      </a>
    </details>
  );
}
