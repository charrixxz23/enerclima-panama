import type { CSSProperties, ReactNode } from "react";
import manifest from "../public/data/temporal-profiles.json";
import { asset } from "../lib/dashboard";
import Cifra from "./cifra";
export default function TemporalPanel({
  id,
  className = "",
  children,
}: {
  id: keyof typeof manifest.profiles;
  className?: string;
  children: ReactNode;
}) {
  const profile = manifest.profiles[id];
  return (
    <section
      id={id}
      className={`atlas-section temporal-panel ${className}`}
      data-profile-series={profile.key}
      style={
        {
          "--profile-top": `url("${asset(profile.maskTop)}")`,
          "--profile-bottom": `url("${asset(profile.maskBottom)}")`,
          "--profile-stroke": `url("${asset(profile.stroke)}")`,
        } as CSSProperties
      }
    >
      <figure className="temporal-profile" data-profile-count={profile.n}>
        <div className="profile-stroke" aria-hidden="true" />
        <div className="profile-caption">
          <figcaption>
            Leemos el perfil temporal de {profile.station} ·{" "}
            <Cifra tipo="conteo" value={profile.n} /> medias semanales, una cada
            dos semanas ·{" "}
            {profile.period === "completo"
              ? "registro completo"
              : profile.period === "validacion"
                ? "validación"
                : profile.period}
            . Recorremos <Cifra tipo="temperatura" value={profile.min} /> a{" "}
            <Cifra tipo="temperatura" value={profile.max} unidad="°C" />.
          </figcaption>
          <details className="profile-details">
            <summary>Consultamos la tabla del perfil</summary>
            <iframe
              src={asset(profile.table)}
              loading="lazy"
              title={`Tabla del perfil temporal de ${profile.station}, ${id}`}
            />
            <p>
              <a href={asset(profile.table)} target="_blank" rel="noreferrer">
                Abrimos la tabla completa
              </a>{" "}
              · <a href={asset("data/dashboard.json")}>Consultamos el JSON</a>
            </p>
          </details>
        </div>
      </figure>
      <div className="temporal-content">{children}</div>
    </section>
  );
}
