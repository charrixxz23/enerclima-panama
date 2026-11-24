import Cifra from "../cifra";
import Fecha from "../fecha";
import { asset } from "../../lib/dashboard";
import QualityLedger from "../data/quality-ledger";
import { dashboard as data } from "../../lib/data";

import SectionHeading from "../section-heading";
export default function Metodologia() {
  const p = data.particion;
  return (
    <section id="metodologia" className="atlas-section">
      <SectionHeading
        index="07"
        label="Metodología"
        title="Datos claros. Lectura responsable."
        description="Revisamos la calidad, separamos por tiempo y comparamos errores, asociaciones y escenarios."
      />
      <QualityLedger quality={data.calidad} limitations={data.limitaciones} />
      <p className="caveat rounding-policy">
        Presentamos las cifras con la precisión definida para cada magnitud;
        usamos hasta cuatro cifras significativas como criterio general y
        conservamos los valores completos en{" "}
        <a href={asset("data/dashboard.json")}>dashboard.json</a> y en los
        atributos de cada cifra.
      </p>
      <div className="partition">
        <h3>Separamos por tiempo</h3>
        <dl>
          {[
            [
              "Entrenamiento",
              p.train_filas,
              p.inicio_entrenamiento,
              p.fin_entrenamiento,
            ],
            [
              "Validación",
              p.validacion_filas,
              p.inicio_validacion,
              p.fin_validacion,
            ],
            ["Prueba", p.prueba_filas, p.inicio_prueba, p.fin_prueba],
          ].map(([name, count, start, end]) => (
            <div key={String(name)}>
              <dt>{name}</dt>
              <dd>
                <Cifra tipo="conteo" value={Number(count)} /> observaciones
              </dd>
              <dd className="ledger-note">
                <small>
                  <Fecha value={String(start)} />
                  <br />
                  <Fecha value={String(end)} />
                </small>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <aside className="limitations" aria-labelledby="limitations-title">
        <p className="kicker">Alcance del estudio</p>
        <h3 id="limitations-title">
          Leemos estas limitaciones antes de interpretar
        </h3>
        <ol>
          {data.limitaciones.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
      </aside>
    </section>
  );
}
