import AtlasMark from "./atlas-mark";
import {dashboard as data} from "../lib/data";
export default function Footer(){return <footer className="atlas-footer"><div><AtlasMark/><span>EnerClima Panamá</span></div><p>Leemos la energía desde el territorio.<br /><small>Proyecto académico · datos históricos · versión {data.version}</small></p><a href="#inicio">Volvemos al inicio</a></footer>;}
