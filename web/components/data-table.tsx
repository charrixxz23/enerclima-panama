"use client";
import { useState } from "react";
import { asset, type Dashboard } from "../lib/dashboard";
import {
  fmtDemanda,
  fmtTemp,
  fmtConteo,
  fmtCorrelacion,
  fmtCoordenada,
  fmtCalidad,
  fmtFechaLarga,
} from "../lib/format";
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
interface Celda {
  texto: string;
  exacto?: string;
  numerica?: boolean;
}
const literal = (texto: string): Celda => ({ texto });
const cifra = (value: number, texto: string): Celda => ({
  texto,
  exacto: String(value),
  numerica: true,
});
const fecha = (value: string): Celda => ({
  texto: fmtFechaLarga(value),
  exacto: value,
});
function tableRows(data: Dashboard, source: Source, key: ValueKey): Celda[][] {
  switch (source) {
    case "demandaDiaria":
    case "demandaSemanal":
      return data[source].map((r) => [
        fecha(r.datetime),
        cifra(r.demanda_mwh, fmtDemanda(r.demanda_mwh)),
      ]);
    case "temperaturaRegional":
      return data.temperaturaRegional.map((r) => {
        const v = r[key === "demanda_mwh" ? "T2M_toc" : key];
        return [fecha(r.datetime), cifra(v, fmtTemp(v))];
      });
    case "perfilHorario":
      return data.perfilHorario.map((r) => [
        cifra(r.hora, `${fmtConteo(r.hora)}\u00a0h`),
        cifra(r.demanda_mwh, fmtDemanda(r.demanda_mwh)),
      ]);
    case "demandaMensual":
      return data.demandaMensual.map((r) => [
        literal(r.mes),
        cifra(r.demanda_mwh, fmtDemanda(r.demanda_mwh)),
      ]);
    case "correlaciones":
      return Object.entries(data.correlaciones).map(([k, v]) => [
        literal(k),
        cifra(v, fmtCorrelacion(v)),
      ]);
    case "estaciones":
      return data.estaciones.map((r) => [
        literal(r.nombre),
        cifra(r.latitud, fmtCoordenada(r.latitud)),
        cifra(r.longitud, fmtCoordenada(r.longitud)),
      ]);
    case "calidad":
      return Object.entries(data.calidad).map(([k, v]) => [
        literal(k),
        {
          texto: fmtCalidad(k, v),
          exacto: typeof v === "object" ? JSON.stringify(v) : String(v),
        },
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
                      <th
                        key={i}
                        scope="row"
                        className={cell.numerica ? "cifra" : undefined}
                        data-exact={cell.exacto}
                        title={cell.exacto}
                      >
                        {cell.texto}
                      </th>
                    ) : (
                      <td
                        key={i}
                        className={cell.numerica ? "cifra" : undefined}
                        data-exact={cell.exacto}
                        title={cell.exacto}
                      >
                        {cell.texto}
                      </td>
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
