import QualityLedger from "../data/quality-ledger";
import { dashboard as data } from "../../lib/data";
import { number } from "../../lib/dashboard";
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
              <dd>{number(Number(count))} observaciones</dd>
              <dd className="ledger-note">
                <small>
                  {String(start).replace("T", " ")}
                  <br />
                  {String(end).replace("T", " ")}
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
