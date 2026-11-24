"use client";
import { useState } from "react";
import { asset, number, type Dashboard } from "../lib/dashboard";
import { readDashboard } from "../lib/client-data";
type Source =
  | "demandaDiaria"
  | "demandaSemanal"
  | "temperaturaRegional"
  | "perfilHorario"
  | "demandaMensual"
  | "correlaciones"
  | "calidad"
  | "estaciones";
type ValueKey = "demanda_mwh" | "T2M_toc" | "T2M_san" | "T2M_dav";
function tableRows(data: Dashboard, source: Source, key: ValueKey): string[][] {
  switch (source) {
    case "demandaDiaria":
    case "demandaSemanal":
      return data[source].map((r) => [
        r.datetime.split("T")[0],
        number(r.demanda_mwh),
      ]);
    case "temperaturaRegional":
      return data.temperaturaRegional.map((r) => [
        r.datetime.split("T")[0],
        number(r[key === "demanda_mwh" ? "T2M_toc" : key]),
      ]);
    case "perfilHorario":
      return data.perfilHorario.map((r) => [
        `${r.hora} h`,
        number(r.demanda_mwh),
      ]);
    case "demandaMensual":
      return data.demandaMensual.map((r) => [r.mes, number(r.demanda_mwh)]);
    case "correlaciones":
      return Object.entries(data.correlaciones).map(([k, v]) => [k, number(v)]);
    case "estaciones":
      return data.estaciones.map((r) => [
        r.nombre,
        number(r.latitud),
        number(r.longitud),
      ]);
    case "calidad":
      return Object.entries(data.calidad).map(([k, v]) => [
        k,
        typeof v === "number"
          ? number(v)
          : typeof v === "string"
            ? v
            : JSON.stringify(v),
      ]);
  }
}
export default function DataTable({
  summary,
  caption,
  headers,
  source,
  valueKey = "demanda_mwh",
}: {
  summary: string;
  caption: string;
  headers: string[];
  source: Source;
  valueKey?: ValueKey;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Dashboard | null>(null);
  const [failed, setFailed] = useState(false);
  const rows = open && data ? tableRows(data, source, valueKey) : [];
  return (
    <details
      onToggle={async (event) => {
        const opened = event.currentTarget.open;
        setOpen(opened);
        if (opened && !data) {
          try {
            setFailed(false);
            setData(await readDashboard());
          } catch {
            setFailed(true);
          }
        }
      }}
    >
      <summary>{summary}</summary>
      <div className="table-scroll">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={i}>{cell}</td>
                    ),
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length}>
                  {failed ? (
                    <a href={asset("data/dashboard.json")}>
                      Consultamos el archivo de datos
                    </a>
                  ) : open ? (
                    "Cargamos los registros del archivo local…"
                  ) : (
                    "Abrimos la tabla para consultar todos los registros."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <noscript>
        <a href={asset("data/dashboard.json")}>
          Consultamos el archivo completo de datos
        </a>
      </noscript>
    </details>
  );
}
