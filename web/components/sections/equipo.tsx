import TemporalPanel from "../temporal-panel";
import SectionHeading from "../section-heading";
export default function Equipo() {
  return (
    <TemporalPanel id="equipo">
      <SectionHeading
        index="08"
        label="Equipo"
        title="Investigamos en equipo."
        description="Presentamos nuestro proyecto académico de Ingeniería Ambiental en la Universidad Tecnológica de Panamá."
      />
      <div className="team-byline">
        <p>
          Facultad de Ingeniería de Sistemas Computacionales
          <br />
          Ingeniería Ambiental · Grupo 1SF132
          <br />
          Profesora: Vivian Valenzuela
        </p>
        <ul>
          <li>Alejandro Muñoz</li>
          <li>Angie Valdés</li>
          <li>Richard Smith</li>
          <li>Abisai Bellamy</li>
        </ul>
      </div>
    </TemporalPanel>
  );
}
