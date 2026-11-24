import TemporalPanel from "../temporal-panel";
import Correlations from "../data/correlations";
import { dashboard as data } from "../../lib/data";
import SectionHeading from "../section-heading";
const repo = "https://github.com/charrixxz23/enerclima-panama";
export default function Investigacion() {
  return (
    <TemporalPanel id="investigacion">
      <SectionHeading
        index="06"
        label="Investigación"
        title="Una pregunta ambiental."
        description="Compartimos una lectura histórica reproducible para conversar sobre eficiencia y planificación energética en Panamá."
      />
      <div className="research-question">
        <h3>¿Cómo se asocia el clima regional con la demanda nacional?</h3>
        <p>
          Las temperaturas elevadas pueden aumentar la necesidad de
          refrigeración. La demanda también responde a los horarios, el
          calendario, la actividad y las características del sistema eléctrico.
        </p>
        <p>
          Analizamos asociaciones y estimaciones condicionadas al modelo. No
          estimamos consumo individual de ciudades ni calculamos emisiones.
        </p>
      </div>
      <Correlations rows={data.correlaciones} />
      <div className="citations">
        <h3>Citamos este trabajo</h3>
        <p>
          <b>APA.</b> Muñoz, A., Valdés, A., Smith, R., y Bellamy, A. (
          {new Date(data.generado).getUTCFullYear()}).{" "}
          <i>EnerClima Panamá: observatorio energético y ambiental</i> (versión{" "}
          {data.version}) [Conjunto de datos y aplicación]. Universidad
          Tecnológica de Panamá. <a href={repo}>Repositorio y versiones</a>.
        </p>
        <p>
          <b>IEEE.</b> A. Muñoz, A. Valdés, R. Smith y A. Bellamy, “EnerClima
          Panamá: observatorio energético y ambiental,” Universidad Tecnológica
          de Panamá, versión {data.version}. [En línea].{" "}
          <a href={repo}>Código y datos del análisis</a>.
        </p>
        <p className="source-note">
          Versión de análisis: {data.version}. Generado:{" "}
          <time dateTime={data.generado}>{data.generado}</time>.{" "}
          <a href={`${repo}/commits/main/`}>
            Consultamos el historial de cambios
          </a>
          .
        </p>
      </div>
      <div className="reference-list">
        <h3>Fuentes y lecturas</h3>
        <a href="https://ieee-pes-data-sharing.org/datasets/detail/e40ed690-2469-4c83-bfc2-ed868fe6df50">
          IEEE PES · conjunto de datos de carga de Panamá
        </a>
        <a href="https://power.larc.nasa.gov/docs/services/api/temporal/hourly/">
          NASA POWER · catálogo meteorológico
        </a>
        <a href="https://gmao.gsfc.nasa.gov/media/gmao_products/IqPeIBhIWLGrweILfVPj9Vmdoc/MERRA_File_Specification.pdf">
          NASA GMAO · especificación de variables MERRA
        </a>
        <a href="https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-12/">
          IPCC · América Central y del Sur
        </a>
        <a href="https://www.iea.org/reports/the-future-of-cooling/">
          Agencia Internacional de Energía · The Future of Cooling
        </a>
        <a href="https://www.cnd.com.pa/index.php/estadisticas">
          ETESA / CND · estadísticas del mercado eléctrico
        </a>
      </div>
    </TemporalPanel>
  );
}
