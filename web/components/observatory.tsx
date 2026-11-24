"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, CloudSun, Compass, Menu, Thermometer, Wind, X } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import data from "../public/data/dashboard.json";

const MapView = dynamic(() => import("./map-view"), { ssr: false, loading: () => <div className="map-loading">Cargamos el mapa regional…</div> });

const stations = [
  { key: "toc", name: "Tocumen", temp: "T2M_toc", color: "#165c48", region: "Panamá" },
  { key: "san", name: "Santiago", temp: "T2M_san", color: "#b5671d", region: "Veraguas" },
  { key: "dav", name: "David", temp: "T2M_dav", color: "#287a9b", region: "Chiriquí" },
] as const;

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

const number = (value: number, digits = 0) => new Intl.NumberFormat("es-PA", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
const dateLabel = (value: string) => new Intl.DateTimeFormat("es-PA", { month: "short", year: "2-digit" }).format(new Date(value));

export default function Observatory() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [station, setStation] = useState("Tocumen");
  const [increment, setIncrement] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedStation = stations.find((item) => item.name === station);
  const tempKey = selectedStation?.temp ?? "T2M_toc";
  const sensitivity = data.sensibilidad.find((row) => row.estacion === station && row.incremento_c === increment && row.tipo === "unica_estacion");
  const model = data.modelo.find((row) => row.modelo === data.modeloSeleccionado);
  const event = data.eventos.find((row) => row.estacion === station);
  const association = data.asociaciones.find((row) => row.estacion === station);
  const regionalRows = useMemo(() => data.temperaturaRegional.map((row) => ({ ...row, fecha: dateLabel(row.datetime) })), []);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="EnerClima Panamá, inicio">
          <span className="brand-mark"><Wind size={20} strokeWidth={2.1} /></span>
          <span>EnerClima <b>Panamá</b></span>
        </a>
        <button className="mobile-toggle" aria-label={mobileOpen ? "Cerrar navegación" : "Abrir navegación"} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
        <nav className={mobileOpen ? "main-nav open" : "main-nav"} aria-label="Navegación principal">
          {links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMobileOpen(false)}>{label}</a>)}
        </nav>
      </header>

      <section className="hero" id="inicio" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,35,43,.9) 0%, rgba(10,35,43,.68) 48%, rgba(10,35,43,.12) 100%), url('${basePath}/images/panama-energy-hero.png')` }}>
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

      <section className="section section-observatory" id="observatorio">
        <div className="section-heading">
          <div><p className="eyebrow">01 — OBSERVATORIO ENERGÉTICO</p><h2>Una serie histórica, <em>miles de horas.</em></h2></div>
          <p className="section-deck">Reunimos demanda nacional y variables meteorológicas horarias para reconocer patrones y cambios en el tiempo.</p>
        </div>
        <div className="metric-strip">
          <div><span>REGISTROS HORARIOS</span><strong>{number(data.resumen.filas)}</strong><small>sin nulos ni fechas duplicadas</small></div>
          <div><span>DEMANDA MEDIA</span><strong>{number(data.resumen.media, 1)} <i>MWh</i></strong><small>por intervalo horario</small></div>
          <div><span>DEMANDA MÍNIMA</span><strong>{number(data.resumen.minima, 1)} <i>MWh</i></strong><small>valor bajo para revisión</small></div>
          <div><span>DEMANDA MÁXIMA</span><strong>{number(data.resumen.maxima, 1)} <i>MWh</i></strong><small>valor observado en el periodo</small></div>
          <div><span>PERIODO ANALIZADO</span><strong>2015–2020</strong><small>enero de 2015 a junio de 2020</small></div>
        </div>
        <div className="chart-layout">
          <div className="chart-copy"><p className="eyebrow">DEMANDA NACIONAL</p><h3>El pulso de la red</h3><p>Representamos la media semanal. La demanda corresponde al total nacional y la ficha del dataset indica MWh por intervalo horario.</p><div className="chart-legend"><span className="legend-dot demand"></span> Demanda eléctrica nacional</div></div>
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.demandaSemanal} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}><CartesianGrid stroke="#e7ece9" vertical={false} /><XAxis dataKey="datetime" tickFormatter={dateLabel} tickLine={false} axisLine={false} minTickGap={38} /><YAxis tickFormatter={(value) => number(value)} tickLine={false} axisLine={false} width={55} /><Tooltip labelFormatter={(value) => new Intl.DateTimeFormat("es-PA", { dateStyle: "long" }).format(new Date(String(value)))} formatter={(value) => [`${number(Number(value), 1)} MWh`, "Media semanal"]} /><Line type="monotone" dataKey="demanda_mwh" stroke="#165c48" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} /></LineChart></ResponsiveContainer></div>
        </div>
        <p className="source-line">Fuente: CND de Panamá y NASA Earthdata, integrados en el conjunto Short-term electricity load forecasting (Panama).</p>
      </section>

      <section className="section climate-section" id="clima">
        <div className="section-heading">
          <div><p className="eyebrow">02 — CLIMA REGIONAL</p><h2>Tres lugares.<br /><em>Un sistema nacional.</em></h2></div>
          <p className="section-deck">Comparamos temperaturas observadas en Tocumen, Santiago y David con la demanda eléctrica del país.</p>
        </div>
        <div className="climate-grid">
          <div className="map-panel"><div className="panel-title"><div><p className="eyebrow">PUNTOS DE REFERENCIA</p><h3>Panamá, de este a oeste</h3></div><Compass size={20} /></div><MapView /><div className="map-key">{stations.map((item) => <span key={item.key}><i style={{ background: item.color }}></i>{item.name}, {item.region}</span>)}</div><small className="map-note">Coordenadas aeroportuarias de referencia: <a href="https://www.aoml.noaa.gov/hrd/HFP2010/HFP2010_part2.pdf" target="_blank" rel="noreferrer">NOAA/AOML</a>. No representan las celdas meteorológicas. Mapa © OpenStreetMap.</small></div>
          <div className="climate-chart-panel"><div className="panel-title"><div><p className="eyebrow">TEMPERATURA A 2 M</p><h3>Señales microclimáticas</h3></div><Thermometer size={20} /></div><div className="select-wrap"><label htmlFor="station-select">Estación destacada</label><div><select id="station-select" value={station} onChange={(event) => setStation(event.target.value)}>{stations.map((item) => <option key={item.key}>{item.name}</option>)}</select><ChevronDown size={16} /></div></div><ResponsiveContainer width="100%" height={236}><LineChart data={regionalRows} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}><CartesianGrid stroke="#e7ece9" vertical={false} /><XAxis dataKey="fecha" tickLine={false} axisLine={false} minTickGap={36} /><YAxis tickFormatter={(value) => `${value}°`} tickLine={false} axisLine={false} width={54} domain={[20, 40]} /><Tooltip labelFormatter={(value) => String(value)} formatter={(value, name) => [`${number(Number(value), 1)} °C`, stations.find((item) => item.temp === name)?.name ?? String(name)]} /><Line type="monotone" dataKey={tempKey} name={tempKey} stroke={selectedStation?.color ?? "#165c48"} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} /></LineChart></ResponsiveContainer><div className="climate-fact"><CloudSun size={18} /><span>La temperatura de {station} se asocia con la demanda nacional en un análisis que controla patrones de hora, calendario y año.</span></div></div>
        </div>
        <div className="association-row"><div><span>ASOCIACIÓN AJUSTADA</span><strong>{association ? `${number(association.coeficiente_mwh_por_c, 2)} MWh/°C` : "—"}</strong><small>IC 95%: {association ? `${number(association.ic95_inferior, 1)} a ${number(association.ic95_superior, 1)}` : "—"}</small></div><p>Estimación con errores HAC y controles temporales. La asociación describe una relación estadística; no demuestra causalidad ni consumo regional.</p></div>
      </section>

      <section className="section heat-section" id="eventos">
        <div className="section-heading light-heading"><div><p className="eyebrow">03 — EVENTOS DE TEMPERATURA ELEVADA</p><h2>Horas que superan<br /><em>el percentil 95.</em></h2></div><p className="section-deck">Usamos el percentil 95 de cada estación en el periodo completo para el análisis descriptivo. Identificamos episodios estadísticos, no olas de calor oficiales.</p></div>
        <div className="heat-content"><div className="heat-figure"><span className="heat-label">{station.toUpperCase()} · UMBRAL DESCRIPTIVO</span><strong>{event ? `${number(event.percentil_95_c, 1)} °C` : "—"}</strong><div className="heat-rule"><span></span></div><p>Horas sobre el umbral: <b>{event ? number(event.horas_sobre_umbral) : "—"}</b></p><p>Días con horas elevadas: <b>{event ? number(event.dias_con_horas_elevadas) : "—"}</b></p></div><div className="heat-copy"><p>En {station}, la demanda nacional promedio durante las horas sobre el umbral fue de <b>{event ? `${number(event.demanda_media_eventos_mwh, 1)} MWh` : "—"}</b>. En el resto de las horas fue de <b>{event ? `${number(event.demanda_media_resto_mwh, 1)} MWh` : "—"}</b>.</p><div className="heat-difference"><span>DIFERENCIA DESCRIPTIVA</span><strong>{event ? `+${number(event.diferencia_media_mwh, 1)} MWh` : "—"}</strong><small>sin ajuste por hora, calendario ni estacionalidad</small></div><p className="caution">Esta comparación por sí sola no atribuye el cambio a la temperatura. La hora, la actividad y la estación del año también modifican la demanda.</p></div></div>
        <div className="threshold-table">{data.eventos.map((row) => <div key={row.estacion}><span>{row.estacion}</span><strong>{number(row.percentil_95_c, 1)} °C</strong><small>{number(row.horas_sobre_umbral)} horas</small></div>)}</div>
      </section>

      <section className="section models-section" id="modelos">
        <div className="section-heading"><div><p className="eyebrow">04 — MODELOS PREDICTIVOS</p><h2>El contexto histórico<br /><em>ayuda a anticipar.</em></h2></div><p className="section-deck">Evaluamos una referencia semanal y regresiones en un corte cronológico. Los datos climáticos corresponden a la misma hora estimada.</p></div>
        <div className="model-lead"><div><span>MODELO SELECCIONADO EN VALIDACIÓN</span><h3>Random Forest</h3><p>Lo seleccionamos por obtener el menor RMSE en validación. El modelo usa calendario, meteorología observada y rezagos de demanda.</p></div><div className="model-score"><strong>{model ? `${number(model.mape_pct, 2)}%` : "—"}</strong><span>MAPE EN PRUEBA</span></div></div>
        <div className="model-table-wrap"><table className="model-table"><thead><tr><th>Modelo</th><th>MAE</th><th>RMSE</th><th>MAPE</th><th>R²</th></tr></thead><tbody>{data.modelo.map((row) => <tr key={row.modelo} className={row.modelo === data.modeloSeleccionado ? "selected-model" : ""}><th>{row.modelo.replaceAll("_", " ")}{row.modelo === data.modeloSeleccionado && <span>Seleccionado</span>}</th><td>{number(row.mae, 1)} MWh</td><td>{number(row.rmse, 1)} MWh</td><td>{number(row.mape_pct, 2)}%</td><td>{number(row.r2, 3)}</td></tr>)}</tbody></table></div>
        <div className="model-notes"><p><b>MAE</b> error absoluto medio. <b>RMSE</b> penaliza más los errores grandes. <b>MAPE</b> expresa el error relativo. <b>R²</b> resume la variación explicada.</p><p>La prueba estima el siguiente intervalo con observaciones previas disponibles. El clima de la hora objetivo es observado, por lo que no validamos un pronóstico operativo con clima futuro.</p></div>
        <div className="benchmark-note"><span>REFERENCIA SEMANAL DEL CND</span><p>En 14 semanas oficiales (2,352 horas), el archivo de predespacho registró MAE {number(data.predespacho.mae, 1)} MWh y MAPE {number(data.predespacho.mape_pct, 2)}%. Reportamos esta referencia por separado porque cubre un horizonte de una semana.</p></div>
      </section>

      <section className="sensitivity-section" id="sensibilidad">
        <div className="sensitivity-inner"><div><p className="eyebrow light">05 — SIMULADOR DE SENSIBILIDAD</p><h2>¿Qué estima el modelo<br />si la temperatura <em>sube?</em></h2><p className="sensitivity-copy">Aplicamos un cambio aislado a la temperatura en observaciones del periodo de prueba. Mantenemos los demás datos fijos y usamos solo casos dentro del percentil 99 observado.</p><div className="sim-controls"><label>Estación<select value={station} onChange={(event) => setStation(event.target.value)}>{stations.map((item) => <option key={item.key}>{item.name}</option>)}<option>Tres estaciones</option></select></label><label>Escenario<select value={increment} onChange={(event) => setIncrement(Number(event.target.value))}><option value={1}>+1 °C</option><option value={2}>+2 °C</option><option value={3}>+3 °C</option></select></label></div></div><div className="sim-result"><span>CAMBIO MEDIO ESTIMADO</span><strong>{sensitivity ? `${sensitivity.cambio_estimado_mwh >= 0 ? "+" : ""}${number(sensitivity.cambio_estimado_mwh, 2)} MWh` : "Sin escenarios válidos"}</strong><p>{sensitivity ? `${number(sensitivity.cambio_estimado_pct, 3)}% respecto a la demanda de referencia, en ${number(sensitivity.referencias_validas)} observaciones.` : "Elegimos otra combinación de estación e incremento."}</p><div className="sim-baseline"><span>Demanda de referencia del modelo</span><b>{sensitivity ? `${number(sensitivity.demanda_base_modelo_mwh, 1)} MWh` : "—"}</b></div><div className="sim-baseline"><span>Resultado para {station}</span><b>{sensitivity ? `${number(sensitivity.demanda_base_modelo_mwh + sensitivity.cambio_estimado_mwh, 1)} MWh` : "—"}</b></div></div></div>
        <div className="sensitivity-warning"><ArrowUpRight size={16} /><p>Estos valores describen el comportamiento del modelo ante perturbaciones. No son efectos causales, proyecciones climáticas ni pronósticos oficiales. Random Forest produce cambios escalonados, por lo que un escenario no representa una respuesta física continua.</p></div>
      </section>

      <section className="section research-section" id="investigacion">
        <div className="section-heading"><div><p className="eyebrow">06 — INVESTIGACIÓN</p><h2>Una pregunta <em>ambiental.</em></h2></div><p className="section-deck">Analizamos una relación posible entre calor y demanda nacional para aportar información al diálogo sobre eficiencia y planificación energética en Panamá.</p></div>
        <div className="research-grid"><article><BookOpen size={21} /><h3>El problema</h3><p>Las temperaturas elevadas pueden aumentar la necesidad de refrigeración. La demanda también responde a horarios, calendario, actividad económica y características del sistema eléctrico.</p></article><article><Thermometer size={21} /><h3>La pregunta</h3><p>¿Cómo se asocian las temperaturas de tres regiones con la demanda eléctrica nacional y cuánto cambia la estimación al perturbar la temperatura dentro de rangos observados?</p></article><article><Wind size={21} /><h3>El aporte</h3><p>Compartimos una lectura histórica reproducible de indicadores energéticos y meteorológicos. No estimamos el consumo individual de ciudades ni calculamos emisiones.</p></article></div>
        <div className="finding-band"><span>HALLAZGO AJUSTADO</span><strong>La asociación estimada cambia según la estación, incluso después de controlar patrones temporales.</strong><a href="#clima">Ver coeficientes y límites <ArrowRight size={16} /></a></div>
        <div className="reference-links"><p className="eyebrow">LECTURAS Y FUENTES</p><a href="https://ieee-pes-data-sharing.org/datasets/detail/e40ed690-2469-4c83-bfc2-ed868fe6df50" target="_blank" rel="noreferrer">IEEE PES · conjunto de datos de carga de Panamá <ArrowRight size={14} /></a><a href="https://power.larc.nasa.gov/docs/services/api/temporal/hourly/" target="_blank" rel="noreferrer">NASA POWER · catálogo meteorológico <ArrowRight size={14} /></a><a href="https://gmao.gsfc.nasa.gov/media/gmao_products/IqPeIBhIWLGrweILfVPj9Vmdoc/MERRA_File_Specification.pdf" target="_blank" rel="noreferrer">NASA GMAO · especificación de variables MERRA <ArrowRight size={14} /></a><a href="https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-12/" target="_blank" rel="noreferrer">IPCC · capítulo de América Central y del Sur <ArrowRight size={14} /></a><a href="https://www.iea.org/reports/the-future-of-cooling/" target="_blank" rel="noreferrer">Agencia Internacional de Energía · The Future of Cooling <ArrowRight size={14} /></a><a href="https://www.cnd.com.pa/index.php/estadisticas" target="_blank" rel="noreferrer">ETESA / CND · estadísticas del mercado eléctrico <ArrowRight size={14} /></a></div>
      </section>

      <section className="method-section" id="metodologia"><div className="method-inner"><div><p className="eyebrow light">07 — METODOLOGÍA</p><h2>Datos claros.<br /><em>Lectura responsable.</em></h2><p>Trabajamos con un registro horario integrado de demanda nacional y clima de tres puntos de referencia. La ficha del paquete contiene errores de etiquetas meteorológicas que identificamos y documentamos.</p></div><div className="method-steps"><div><span>01</span><p><b>Revisamos la calidad</b>Comprobamos fechas, nulos, duplicados, rangos y códigos de calendario.</p></div><div><span>02</span><p><b>Separamos por tiempo</b>Entrenamos con las primeras 70% de observaciones; usamos 15% para validar y dejamos 15% al final como prueba.</p></div><div><span>03</span><p><b>Comparamos y explicamos</b>Medimos errores, asociación con HAC y escenarios con valores dentro del rango del periodo.</p></div></div></div><div className="method-caveat"><p><b>Limitaciones que mantenemos visibles</b></p><ul>{data.limitaciones.map((item) => <li key={item}>{item}</li>)}</ul></div></section>

      <section className="team-section" id="equipo"><div><p className="eyebrow">08 — EQUIPO</p><h2>Trabajo académico<br /><em>en equipo.</em></h2><p>Universidad Tecnológica de Panamá<br />Facultad de Ingeniería de Sistemas Computacionales<br />Ingeniería Ambiental · Grupo 1SF132 · 2026</p><p>Profesora: Vivian Valenzuela</p></div><div className="team-names"><span>Alejandro Muñoz</span><span>Angie Valdés</span><span>Richard Smith</span><span>Abisai Bellamy</span></div></section>

      <footer className="site-footer"><a className="brand" href="#inicio"><span className="brand-mark"><Wind size={18} /></span><span>EnerClima <b>Panamá</b></span></a><p>Inteligencia energética para un futuro sostenible.</p><div><span>Universidad Tecnológica de Panamá</span><span>Proyecto académico · datos históricos</span></div><small>Resultados generados el {new Intl.DateTimeFormat("es-PA", { dateStyle: "long", timeZone: "UTC" }).format(new Date(data.generado))} · análisis v{data.version}</small></footer>
    </main>
  );
}
