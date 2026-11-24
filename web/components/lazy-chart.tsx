"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { DemandPoint, RegionalPoint } from "../lib/dashboard";
import { readDashboard } from "../lib/client-data";
const Chart = dynamic(() => import("./charts/series-chart"), {
  ssr: false,
  loading: () => (
    <p className="chart-placeholder">
      Cargamos la serie. Podemos consultar la tabla de datos.
    </p>
  ),
});
export default function LazyChart({
  source,
  dataKey,
  thermal = false,
}: {
  source: "demandaSemanal" | "temperaturaRegional";
  dataKey: string;
  thermal?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<DemandPoint[] | RegionalPoint[] | null>(
    null,
  );
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        readDashboard()
          .then((d) => {
            if (active) setRows(d[source]);
          })
          .catch(() => {
            if (active) setFailed(true);
          });
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [source]);
  return (
    <div ref={ref} className="chart-frame">
      {rows ? (
        <Chart rows={rows} dataKey={dataKey} thermal={thermal} />
      ) : (
        <p className="chart-placeholder">
          {failed
            ? "Podemos consultar el archivo de datos desde la tabla."
            : "Consultamos la serie y su tabla de datos."}
        </p>
      )}
    </div>
  );
}
