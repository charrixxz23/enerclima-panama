import Cifra from "../cifra";
import DataTable from "../data-table";

import type { CSSProperties } from "react";
export default function Correlations({
  rows,
}: {
  rows: Record<string, number>;
}) {
  const explain = (key: string, value: number) =>
    key === "nat_demand"
      ? "Comparamos la demanda consigo misma; esta es la correlación de identidad."
      : value > 0
        ? "El signo positivo indica que esta variable y la demanda tienden a aumentar juntas en su orden relativo. No demuestra causalidad."
        : value < 0
          ? "El signo negativo indica una relación inversa en el orden relativo de esta variable y la demanda. No demuestra causalidad."
          : "No observamos asociación monótona en este coeficiente.";
  return (
    <figure className="correlation-panel data-piece">
      <h3>Relaciones con la demanda</h3>
      <p className="source-note">
        Leemos coeficientes de Spearman frente a nat_demand. Cada celda se
        compara con la demanda nacional.
      </p>
      <div className="correlation-grid">
        {Object.entries(rows).map(([key, value]) => (
          <div
            className="correlation-cell"
            key={key}
            tabIndex={0}
            aria-describedby={`correlation-${key}`}
            style={
              { "--strength": `${Math.abs(value) * 100}%` } as CSSProperties
            }
          >
            <span>{key}</span>
            <strong>
              <Cifra tipo="correlacion" value={value} />
            </strong>
            <span className="correlation-bar" aria-hidden="true" />
            <p id={`correlation-${key}`} className="correlation-explain">
              {explain(key, value)}
            </p>
          </div>
        ))}
      </div>
      <figcaption>
        El signo indica la dirección de la asociación. La longitud de cada marca
        representa su magnitud absoluta. No presentamos una matriz de todas las
        parejas de variables.
      </figcaption>
      <DataTable
        source="correlaciones"
        summary="Consultamos la tabla de correlaciones"
        caption="Spearman frente a demanda nacional"
        headers={["Variable", "Coeficiente"]}
      />
    </figure>
  );
}
