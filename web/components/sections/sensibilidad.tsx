import {dashboard as data} from "../../lib/data";
import SectionHeading from "../section-heading";
import SensitivityExplorer from "../sensitivity-explorer";
export default function Sensibilidad(){return <section id="sensibilidad" className="atlas-section"><SectionHeading index="05" label="Sensibilidad" title="Cambiamos una condición. Leemos el modelo." description="Aplicamos perturbaciones a observaciones del periodo de prueba para estudiar la respuesta estimada."/><p className="caveat prominent">{data.limitaciones[3]} Random Forest produce cambios escalonados; no representa una respuesta física continua.</p><SensitivityExplorer rows={data.sensibilidad}/></section>;}
