import { panamaPath } from "./atlas-mark";
import { escapeHtml } from "../lib/html";
const links = [
  ["Inicio", "inicio"],
  ["Observatorio", "observatorio"],
  ["Clima regional", "clima"],
  ["Eventos térmicos", "eventos"],
  ["Modelos", "modelos"],
  ["Sensibilidad", "sensibilidad"],
  ["Investigación", "investigacion"],
  ["Metodología", "metodologia"],
  ["Equipo", "equipo"],
];
const markup = `<div class="masthead"><a class="atlas-brand" href="#inicio" aria-label="EnerClima Panamá, inicio"><svg viewBox="0 0 510 230" fill="none" aria-hidden="true"><path d="${panamaPath}" fill="currentColor"/></svg><span>EnerClima <b>Panamá</b></span></a><span class="edition">Universidad Tecnológica de Panamá<br/>Observatorio energético y ambiental</span><button class="nav-toggle" aria-label="Índice: abrir navegación" aria-expanded="false" aria-controls="atlas-nav">Índice</button></div><nav id="atlas-nav" class="atlas-nav" aria-label="Navegación principal">${links.map(([label, id], i) => `<a href="#${id}"><span aria-hidden="true">${i === 0 ? "—" : String(i).padStart(2, "0")}</span>${escapeHtml(label)}</a>`).join("")}</nav>`;
export default function Navigation() {
  return (
    <header
      className="atlas-header"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
