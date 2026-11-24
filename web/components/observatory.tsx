import Navigation from "./navigation";
import Footer from "./footer";
import Inicio from "./sections/inicio";
import Observatorio from "./sections/observatorio";
import Clima from "./sections/clima";
import Eventos from "./sections/eventos";
import Modelos from "./sections/modelos";
import Sensibilidad from "./sections/sensibilidad";
import Investigacion from "./sections/investigacion";
import Metodologia from "./sections/metodologia";
import Equipo from "./sections/equipo";
export default function Observatory() { return (<><Navigation /><main><Inicio /><Observatorio /><Clima /><Eventos /><Modelos /><Sensibilidad /><Investigacion /><Metodologia /><Equipo /></main><Footer /></>); }
