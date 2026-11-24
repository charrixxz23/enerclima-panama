import Cifra from "../cifra";
import ThermalField from "../data/thermal-field";
import { dashboard as data } from "../../lib/data";
import { fmtFechaCorta } from "../../lib/format";
export default function Inicio() {
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
        </div>
      </div>
      <ThermalField />
      <div className="hero-bottom">
        <a className="text-link" href="#observatorio">
          Abrimos el atlas
        </a>
        <p className="hero-footnote">
          Trabajamos con <Cifra tipo="conteo" value={data.resumen.filas} />{" "}
          registros horarios.
          <br />
          Estudiamos asociaciones; no demostramos causalidad.
        </p>

        <a href="#metodologia">Leemos las limitaciones del estudio</a>
      </div>
    </section>
  );
}
