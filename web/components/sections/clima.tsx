"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Compass, Thermometer, ChevronDown, CloudSun } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { stations } from "../../lib/dashboard";
const MapView = dynamic(() => import("../map-view"), { ssr: false });
import { dashboard as data } from "../../lib/data";
import { number, dateLabel } from "../../lib/dashboard";
export default function Clima() {
const [station, setStation] = useState("Tocumen");
const selectedStation = stations.find((item) => item.name === station);
const tempKey = selectedStation?.temp ?? "T2M_toc";
const association = data.asociaciones.find((row) => row.estacion === station);
const regionalRows = useMemo(() => data.temperaturaRegional.map((row) => ({ ...row, fecha: dateLabel(row.datetime) })), []);

return (<section className="section climate-section" id="clima">
        <div className="section-heading">
          <div><p className="eyebrow">02 — CLIMA REGIONAL</p><h2>Tres lugares.<br /><em>Un sistema nacional.</em></h2></div>
          <p className="section-deck">Comparamos temperaturas observadas en Tocumen, Santiago y David con la demanda eléctrica del país.</p>
        </div>
        <div className="climate-grid">
          <div className="map-panel"><div className="panel-title"><div><p className="eyebrow">PUNTOS DE REFERENCIA</p><h3>Panamá, de este a oeste</h3></div><Compass size={20} /></div><MapView /><div className="map-key">{stations.map((item) => <span key={item.key}><i style={{ background: item.color }}></i>{item.name}, {item.region}</span>)}</div><small className="map-note">Coordenadas aeroportuarias de referencia: <a href="https://www.aoml.noaa.gov/hrd/HFP2010/HFP2010_part2.pdf" target="_blank" rel="noreferrer">NOAA/AOML</a>. No representan las celdas meteorológicas. Mapa © OpenStreetMap.</small></div>
          <div className="climate-chart-panel"><div className="panel-title"><div><p className="eyebrow">TEMPERATURA A 2 M</p><h3>Señales microclimáticas</h3></div><Thermometer size={20} /></div><div className="select-wrap"><label htmlFor="station-select">Estación destacada</label><div><select id="station-select" value={station} onChange={(event) => setStation(event.target.value)}>{stations.map((item) => <option key={item.key}>{item.name}</option>)}</select><ChevronDown size={16} /></div></div><ResponsiveContainer width="100%" height={236}><LineChart data={regionalRows} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}><CartesianGrid stroke="#e7ece9" vertical={false} /><XAxis dataKey="fecha" tickLine={false} axisLine={false} minTickGap={36} /><YAxis tickFormatter={(value) => `${value}°`} tickLine={false} axisLine={false} width={54} domain={[20, 40]} /><Tooltip labelFormatter={(value) => String(value)} formatter={(value, name) => [`${number(Number(value), 1)} °C`, stations.find((item) => item.temp === name)?.name ?? String(name)]} /><Line type="monotone" dataKey={tempKey} name={tempKey} stroke={selectedStation?.color ?? "#165c48"} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} /></LineChart></ResponsiveContainer><div className="climate-fact"><CloudSun size={18} /><span>La temperatura de {station} se asocia con la demanda nacional en un análisis que controla patrones de hora, calendario y año.</span></div></div>
        </div>
        <div className="association-row"><div><span>ASOCIACIÓN AJUSTADA</span><strong>{association ? `${number(association.coeficiente_mwh_por_c, 2)} MWh/°C` : "—"}</strong><small>IC 95%: {association ? `${number(association.ic95_inferior, 1)} a ${number(association.ic95_superior, 1)}` : "—"}</small></div><p>Estimación con errores HAC y controles temporales. La asociación describe una relación estadística; no demuestra causalidad ni consumo regional.</p></div>
      </section>);
}
