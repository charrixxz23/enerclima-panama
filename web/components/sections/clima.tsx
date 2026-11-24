import TemporalPanel from "../temporal-panel";
import DataTable from "../data-table";
import { dashboard as data } from "../../lib/data";

import SectionHeading from "../section-heading";
import LazyMap from "../lazy-map";
import ClimateExplorer from "../climate-explorer";
export default function Clima() {
  return (
    <TemporalPanel id="clima">
      <SectionHeading
        index="02"
        label="Clima regional"
        title="Tres lugares. Un sistema nacional."
        description="Comparamos Tocumen, Santiago y David con la demanda eléctrica de todo Panamá."
      />
      <div className="two-plates">
        <figure>
          <LazyMap stations={data.estaciones} events={data.eventos} />
          <figcaption>
            Ubicamos referencias aeroportuarias sobre una silueta diagramática.
            No representan las celdas meteorológicas ni una cartografía oficial.
          </figcaption>
          <p className="map-note source-note">
            Coordenadas de referencia:{" "}
            <a href="https://www.aoml.noaa.gov/hrd/HFP2010/HFP2010_part2.pdf">
              NOAA/AOML
            </a>
            . Esquema propio sin servicios cartográficos externos.
          </p>
          <DataTable
            source="estaciones"
            summary="Consultamos las coordenadas"
            caption="Referencias aeroportuarias"
            headers={["Lugar", "Latitud", "Longitud"]}
          />
          <p className="source-note">
            Marcamos el P95 de cada estación con el color de inflexión. Anclamos
            cada escala a sus cuantiles horarios p1 y p99; no indicamos una
            alerta.
          </p>
        </figure>
        <ClimateExplorer associations={data.asociaciones} />
      </div>
    </TemporalPanel>
  );
}
