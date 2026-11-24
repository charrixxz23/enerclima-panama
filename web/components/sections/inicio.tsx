import Cifra from "../cifra";
import profiles from "../../public/data/temporal-profiles.json";
import { asset } from "../../lib/dashboard";
import ThermalField from "../data/thermal-field";
import { dashboard as data } from "../../lib/data";
import { fmtFechaCorta } from "../../lib/format";
export default function Inicio() {
  const toc = data.eventos.find((row) => row.estacion === "Tocumen")!;
  const association = data.asociaciones.find(
    (row) => row.estacion === "Tocumen",
  )!;
  const model =
    data.modelo.find((row) => row.modelo === "Random Forest") ?? data.modelo[0];
  return (
    <section id="inicio" className="atlas-hero proposal-hero">
      <div
        className="hero-continuation"
        aria-hidden="true"
        style={{
          maskImage: `url("${asset(profiles.profiles.observatorio.stroke)}")`,
        }}
      />
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
          <p className="kicker">Panamá · lecturas de un sistema</p>
          <h1>
            <span className="proposal-hero-line">Cuando el clima cambia,</span>
            <br />
            la demanda <em>también.</em>
          </h1>
          <p className="hero-description">
            Exploramos la relación entre el clima de tres regiones y la demanda
            eléctrica nacional. Leemos sus patrones históricos, sus diferencias
            y sus límites.
          </p>
        </div>
      </div>
      <ThermalField />
      <aside
        className="proposal-field-note"
        aria-label="Lectura del campo de datos"
      >
        <span className="kicker">Leyendo el campo</span>
        <p>
          Cada columna resume cuatro días; cada fila, una hora del día. El
          relieve muestra demanda nacional media.
        </p>
        <ul>
          <li>
            <i className="proposal-dot proposal-dot-demand" /> Superficie:
            demanda
          </li>
          <li>
            <i className="proposal-dot proposal-dot-temperature" /> Perfiles:
            temperatura
          </li>
        </ul>
      </aside>
      <div className="proposal-metrics" aria-label="Cifras principales">
        <div>
          <span>Demanda media</span>
          <strong>
            <Cifra
              tipo="demanda"
              hero
              unidad="MWh"
              value={data.resumen.media}
            />
          </strong>
        </div>
        <div>
          <span>Asociación ajustada</span>
          <strong>
            <Cifra
              tipo="coeficiente"
              value={association.coeficiente_mwh_por_c}
              unidad="MWh/°C"
            />
          </strong>
        </div>
        <div>
          <span>Horas sobre P95</span>
          <strong>
            <Cifra tipo="conteo" value={toc.horas_sobre_umbral} unidad="h" />
          </strong>
          <small>en 542 días distintos</small>
        </div>
        <div>
          <span>Error del modelo</span>
          <strong>
            <Cifra tipo="porcentaje" value={model.mape_pct} />
          </strong>
          <small>MAPE, Random Forest</small>
        </div>
      </div>
      <div className="hero-bottom proposal-hero-bottom">
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
