import { ArrowRight, ArrowDownRight } from "lucide-react";
export default function Inicio() { const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""; return (<><section className="hero" id="inicio" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,35,43,.9) 0%, rgba(10,35,43,.68) 48%, rgba(10,35,43,.12) 100%), url('${basePath}/images/panama-energy-hero.png')` }}>
        <div className="hero-content">
          <p className="eyebrow light"><span></span> OBSERVATORIO ENERGÉTICO Y AMBIENTAL</p>
          <h1>Cuando el clima cambia, <em>la demanda también.</em></h1>
          <p className="hero-copy">Exploramos cómo las condiciones microclimáticas de tres regiones de Panamá se relacionan con la demanda eléctrica nacional.</p>
          <div className="hero-actions">
            <a className="button button-amber" href="#observatorio">Explorar resultados <ArrowRight size={17} /></a>
            <a className="hero-link" href="#metodologia">Conocer el estudio <ArrowDownRight size={17} /></a>
          </div>
          <p className="hero-period">DATOS HISTÓRICOS · ENERO 2015 A JUNIO 2020</p>
        </div>
        <div className="hero-note"><span>01 / 03</span><b>Demanda nacional</b><small>Clima observado en Tocumen, Santiago y David</small></div>
        <span className="image-disclaimer">Imagen ilustrativa generada con IA; no es un registro documental</span>
      </section>

      <section className="intro-band">
        <p>Estudiamos un sistema eléctrico nacional y tres contextos climáticos regionales. Cada señal aporta una perspectiva distinta sobre la demanda.</p>
        <a href="#investigacion">Sobre nuestra investigación <ArrowRight size={16} /></a>
      </section>

      </>); }