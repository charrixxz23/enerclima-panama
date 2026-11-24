"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { DemandPoint, RegionalPoint } from "../lib/dashboard";
const Chart = dynamic(() => import("./charts/series-chart"), {
  ssr: false,
  loading: () => (
    <p className="chart-placeholder">
      Cargamos la serie. Podemos consultar la tabla de datos.
    </p>
  ),
});
export default function LazyChart({
  rows,
  dataKey,
  thermal = false,
}: {
  rows: DemandPoint[] | RegionalPoint[];
  dataKey: string;
  thermal?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="chart-frame">
      {visible ? (
        <Chart rows={rows} dataKey={dataKey} thermal={thermal} />
      ) : (
        <p className="chart-placeholder">
          Consultamos la serie y su tabla de datos.
        </p>
      )}
    </div>
  );
}
