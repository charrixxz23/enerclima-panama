import DataArt from "../data-art";
import DataTable from "../data-table";
import type { HourPoint } from "../../lib/dashboard";
export default function DemandClock({ rows }: { rows: HourPoint[] }) {
  return (
    <figure className="clock-figure data-piece">
      <h3>Un día en la demanda nacional</h3>
      <div className="clock-plate">
        <DataArt
          name="perfil-horario"
          label="Reloj radial de demanda media por hora"
          ratio="1"
        />
        {rows
          .filter((_, i) => i % 6 === 0)
          .map((r) => (
            <span
              className="clock-hour"
              key={r.hora}
              style={{
                left: `${50 + Math.sin((r.hora / rows.length) * Math.PI * 2) * 45}%`,
                top: `${50 - Math.cos((r.hora / rows.length) * Math.PI * 2) * 45}%`,
              }}
            >
              {r.hora} h
            </span>
          ))}
      </div>
      <figcaption>
        Recorremos la media de cada hora del día en sentido horario. El radio es
        proporcional a la demanda; el centro representa el origen de la escala.
      </figcaption>
      <DataTable
        source="perfilHorario"
        summary="Consultamos el perfil horario"
        caption="Demanda media por hora"
        headers={["Hora", "MWh"]}
      />
    </figure>
  );
}
