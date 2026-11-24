import { number, type HourPoint } from "../../lib/dashboard";
export default function DemandClock({ rows }: { rows: HourPoint[] }) {
  const max = Math.max(...rows.map((r) => r.demanda_mwh));
  const point = (hour: number, value: number) => {
    const a = (hour / rows.length) * Math.PI * 2 - Math.PI / 2;
    const radius = (value / max) * 140;
    return `${180 + Math.cos(a) * radius},${180 + Math.sin(a) * radius}`;
  };
  return (
    <figure className="clock-figure data-piece">
      <h3>Un día en la demanda nacional</h3>
      <svg
        viewBox="0 0 360 360"
        role="img"
        aria-label="Reloj radial de demanda media por hora"
      >
        <g className="clock-grid">
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle key={r} cx="180" cy="180" r={r * 140} />
          ))}
          {rows.map((r) => (
            <line
              key={r.hora}
              x1="180"
              y1="180"
              x2={point(r.hora, max).split(",")[0]}
              y2={point(r.hora, max).split(",")[1]}
            />
          ))}
        </g>
        <polygon
          points={rows.map((r) => point(r.hora, r.demanda_mwh)).join(" ")}
          className="clock-area"
        />
        <polyline
          points={[...rows, rows[0]]
            .map((r) => point(r.hora, r.demanda_mwh))
            .join(" ")}
          className="series-line draw-line"
          pathLength="1"
        />
        {rows
          .filter((_, i) => i % 6 === 0)
          .map((r) => {
            const [x, y] = point(r.hora, max * 1.15).split(",");
            return (
              <text
                key={r.hora}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {r.hora} h
              </text>
            );
          })}
      </svg>
      <figcaption>
        Recorremos la media de cada hora del día en sentido horario. El radio es
        proporcional a la demanda; el centro representa el origen de la escala.
      </figcaption>
      <details>
        <summary>Consultamos el perfil horario</summary>
        <div className="table-scroll">
          <table>
            <caption>Demanda media por hora</caption>
            <thead>
              <tr>
                <th scope="col">Hora</th>
                <th scope="col">MWh</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.hora}>
                  <th scope="row">{r.hora} h</th>
                  <td>{number(r.demanda_mwh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
