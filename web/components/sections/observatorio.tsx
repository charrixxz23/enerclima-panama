"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { dashboard as data } from "../../lib/data";
import { number, dateLabel } from "../../lib/dashboard";
export default function Observatorio() {

return (<section className="section section-observatory" id="observatorio">
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
      </section>);
}

