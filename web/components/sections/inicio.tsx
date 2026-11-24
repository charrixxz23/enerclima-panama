import Cifra from "../cifra";
import DataArt from "../data-art";
import DataTable from "../data-table";
import { dashboard as data } from "../../lib/data";
import { fmtFechaCorta } from "../../lib/format";
import AtlasMark from "../atlas-mark";
export default function Inicio() {
  const rows = data.demandaDiaria;
  return (
    <section id="inicio" className="atlas-hero">
      <div className="hero-meta">
        <span>Atlas de demanda y clima</span>
        <span>
          <time
            dateTime={data.periodo[0]}
            data-exact={data.periodo[0]}
            title={data.periodo[0]}
          >
            {fmtFechaCorta(data.periodo[0])}
          </time>{" "}
          —{" "}
          <time
            dateTime={data.periodo[1]}
            data-exact={data.periodo[1]}
            title={data.periodo[1]}
          >
            {fmtFechaCorta(data.periodo[1])}
          </time>
        </span>
      </div>
      <div className="atlas-hero-grid">
        <div>
          <p className="kicker">Panamá · Lecturas de un sistema</p>
          <h1>
            El clima y la energía,
            <br />
            <em>en el mismo mapa.</em>
          </h1>
          <p className="hero-description">
            Exploramos la relación entre el clima de tres regiones y la demanda
            eléctrica nacional. Leemos sus patrones históricos, sus diferencias
            y sus límites.
          </p>
          <a className="text-link" href="#observatorio">
            Abrimos el atlas
          </a>
          <p className="hero-footnote">
            Trabajamos con <Cifra tipo="conteo" value={data.resumen.filas} />{" "}
            registros horarios.
            <br />
            Estudiamos asociaciones; no demostramos causalidad.
          </p>
        </div>
        <figure className="hero-plate data-piece">
          <div className="plate-heading">
            <span>Territorio y demanda</span>
            <span>Registro histórico</span>
          </div>
          <AtlasMark className="hero-map" />
          <div className="hero-station-list">
            {data.estaciones.map((s) => (
              <span key={s.nombre}>{s.nombre}</span>
            ))}
          </div>
          <DataArt
            name="demanda-diaria"
            label="Serie de demanda diaria nacional"
            ratio="700 / 280"
            className="hero-series"
          />
          <div className="plate-heading">
            <time
              dateTime={rows[0].datetime}
              data-exact={rows[0].datetime}
              title={rows[0].datetime}
            >
              {fmtFechaCorta(rows[0].datetime)}
            </time>
            <time
              dateTime={rows[rows.length - 1].datetime}
              data-exact={rows[rows.length - 1].datetime}
              title={rows[rows.length - 1].datetime}
            >
              {fmtFechaCorta(rows[rows.length - 1].datetime)}
            </time>
          </div>
          <figcaption>
            Leemos la media diaria nacional sobre un esquema de Panamá. La
            silueta es diagramática; el trazo procede de la serie histórica.
          </figcaption>
          <DataTable
            source="demandaDiaria"
            summary="Consultamos los datos diarios"
            caption="Demanda media diaria, MWh por intervalo horario"
            headers={["Fecha", "MWh"]}
          />
        </figure>
      </div>
      <div className="hero-bottom">
        <span>Demanda nacional · Clima regional</span>
        <a href="#metodologia">Leemos las limitaciones del estudio</a>
      </div>
    </section>
  );
}
