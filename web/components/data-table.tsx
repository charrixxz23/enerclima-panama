"use client";
import { useState } from "react";
import { asset } from "../lib/dashboard";
export default function DataTable({
  summary,
  caption,
  headers,
  rows,
}: {
  summary: string;
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}>
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
            {open ? (
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
                  Abrimos la tabla para consultar todos los registros.
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
