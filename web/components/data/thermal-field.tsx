import Image from "next/image";
import summary from "../../public/data/thermal-summary.json";
import art from "../../public/data/thermal-art.json";
import { asset } from "../../lib/dashboard";
import { fmtFechaCorta } from "../../lib/format";
import { temperatureColor } from "../../lib/thermal";
import Cifra from "../cifra";
import ThermalTable from "../thermal-table";
export default function ThermalField() {
  const q = summary.cuantiles.Tocumen;
  return (
    <figure className="thermal-field data-piece">
      <div className="field-heading">
        <h2>Leemos juntas dos señales.</h2>
        <span>Demanda nacional / temperatura de Tocumen</span>
      </div>
      <div className="field-plot">
        <div className="field-hours" aria-label="Hora registrada">
          {[0, 6, 12, 18, 23].map((hour) => (
            <span
              key={hour}
              className="cifra"
              style={{ top: `${((hour + 0.5) / 24) * 100}%` }}
            >
              {hour} h
            </span>
          ))}
        </div>
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={asset("images/thermal-field-mobile.avif")}
            type="image/avif"
            width={art.mobile.width}
            height={art.mobile.height}
          />
          <source
            media="(max-width: 767px)"
            srcSet={asset("images/thermal-field-mobile.webp")}
            type="image/webp"
            width={art.mobile.width}
            height={art.mobile.height}
          />
          <source
            srcSet={asset("images/thermal-field.avif")}
            type="image/avif"
          />
          <Image
            unoptimized
            src={asset("images/thermal-field.webp")}
            width={art.width}
            height={art.height}
            alt="Comparamos la superficie gris de demanda nacional con los perfiles temporales de temperatura de Tocumen, entre 2015 y 2020."
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="field-dates">
        <span>{fmtFechaCorta(summary.fuente.inicio)}</span>
        <span>{fmtFechaCorta(summary.fuente.fin)}</span>
      </div>
      <div className="field-legends">
        <div>
          <p className="kicker">Superficie · demanda</p>
          <div className="demand-key" aria-hidden="true" />
          <p>
            <Cifra tipo="demanda" value={summary.cuantiles.demanda.p1} /> a{" "}
            <Cifra
              tipo="demanda"
              value={summary.cuantiles.demanda.p99}
              unidad="MWh"
            />
          </p>
          <small>Escala p1–p99 del registro horario.</small>
        </div>
        <div>
          <p className="kicker">Perfiles temporales · temperatura</p>
          <ul className="temperature-key">
            {(["p1", "p50", "p95", "p99"] as const).map((key) => (
              <li key={key}>
                <i
                  style={{
                    backgroundColor: temperatureColor(
                      q[key],
                      q,
                      summary.colores_temperatura,
                    ),
                  }}
                />
                <span>
                  {key.toUpperCase()}{" "}
                  <Cifra tipo="temperatura" value={q[key]} unidad="°C" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption>
        Comparamos medias por bloques de cuatro días y hora registrada.
        Oscurecemos la demanda y superponemos perfiles temporales de
        temperatura; destacamos P95 con un trazo más grueso. Exigimos al menos{" "}
        <Cifra tipo="conteo" value={summary.agregacion.minimo_observaciones} />{" "}
        observaciones por variable y marcamos{" "}
        <Cifra tipo="conteo" value={summary.agregacion.celdas_vacias} /> celdas
        vacías con rayado. Describimos coincidencias; no demostramos causalidad.
      </figcaption>
      <ThermalTable />
    </figure>
  );
}
