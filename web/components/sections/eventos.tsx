import TemporalPanel from "../temporal-panel";
import Cifra from "../cifra";
import { dashboard as data } from "../../lib/data";
import { thermalColor } from "../../lib/dashboard";
import SectionHeading from "../section-heading";
export default function Eventos() {
  const toc = data.eventos.find((row) => row.estacion === "Tocumen")!;
  return (
    <TemporalPanel id="eventos">
      <SectionHeading
        index="03"
        label="Eventos térmicos"
        title="Leemos las horas de mayor temperatura."
        description="Usamos el percentil 95 de cada estación en el periodo completo como umbral descriptivo."
      />
      <p className="caveat prominent">
        Identificamos episodios estadísticos, no olas de calor oficiales. La
        comparación no ajusta por hora, calendario ni estacionalidad y no
        atribuye los cambios a la temperatura.
      </p>
      <div className="event-annotations">
        <aside
          id="annotation-p95"
          className="thermal-margin"
          data-bleed="p95-note"
          data-target="horas-tocumen"
        >
          <strong className="annotation-value">
            <Cifra tipo="conteo" value={toc.horas_sobre_umbral} unidad="h" />
          </strong>
          <p>
            Observamos horas sobre{" "}
            <Cifra tipo="temperatura" value={toc.percentil_95_c} unidad="°C" />{" "}
            en Tocumen.
          </p>
          <svg
            className="annotation-leader"
            viewBox="0 0 96 112"
            aria-hidden="true"
          >
            <path d="M0 10Q78 2 65 58T56 100" />
            <circle cx="56" cy="100" r="3" />
          </svg>
        </aside>
        <div className="event-ledger">
          {data.eventos.map((r) => (
            <article key={r.estacion}>
              <h3>{r.estacion}</h3>
              <p className="thermal-value">
                <span>Umbral P95</span>
                <strong
                  style={{
                    color: thermalColor(r.percentil_95_c, r.estacion),
                  }}
                >
                  <Cifra
                    tipo="temperatura"
                    value={r.percentil_95_c}
                    unidad="°C"
                  />
                </strong>
              </p>
              <dl>
                <div>
                  <dt>Horas sobre el umbral</dt>
                  <dd
                    id={r.estacion === "Tocumen" ? "horas-tocumen" : undefined}
                    aria-describedby={
                      r.estacion === "Tocumen" ? "annotation-p95" : undefined
                    }
                  >
                    <Cifra tipo="conteo" value={r.horas_sobre_umbral} />
                  </dd>
                </div>
                <div>
                  <dt>Días con horas elevadas</dt>
                  <dd>
                    <Cifra tipo="conteo" value={r.dias_con_horas_elevadas} />
                  </dd>
                </div>
                <div>
                  <dt>Demanda media en eventos</dt>
                  <dd>
                    <Cifra
                      tipo="demanda"
                      value={r.demanda_media_eventos_mwh}
                      unidad="MWh"
                    />
                  </dd>
                </div>
                <div>
                  <dt>Demanda media en el resto</dt>
                  <dd>
                    <Cifra
                      tipo="demanda"
                      value={r.demanda_media_resto_mwh}
                      unidad="MWh"
                    />
                  </dd>
                </div>
                <div>
                  <dt>Diferencia descriptiva</dt>
                  <dd>
                    <Cifra
                      tipo="demanda"
                      signo
                      value={r.diferencia_media_mwh}
                      unidad="MWh"
                    />
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </TemporalPanel>
  );
}
