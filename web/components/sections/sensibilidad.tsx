"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { stations } from "../../lib/dashboard";
import { dashboard as data } from "../../lib/data";
import { number } from "../../lib/dashboard";
export default function Sensibilidad() {
const [station, setStation] = useState("Tocumen"); const [increment, setIncrement] = useState(1);
const sensitivity = data.sensibilidad.find(row => row.estacion === station && row.incremento_c === increment);

return (<section className="sensitivity-section" id="sensibilidad">
        <div className="sensitivity-inner"><div><p className="eyebrow light">05 — SIMULADOR DE SENSIBILIDAD</p><h2>¿Qué estima el modelo<br />si la temperatura <em>sube?</em></h2><p className="sensitivity-copy">Aplicamos un cambio aislado a la temperatura en observaciones del periodo de prueba. Mantenemos los demás datos fijos y usamos solo casos dentro del percentil 99 observado.</p><div className="sim-controls"><label>Estación<select value={station} onChange={(event) => setStation(event.target.value)}>{stations.map((item) => <option key={item.key}>{item.name}</option>)}<option>Tres estaciones</option></select></label><label>Escenario<select value={increment} onChange={(event) => setIncrement(Number(event.target.value))}><option value={1}>+1 °C</option><option value={2}>+2 °C</option><option value={3}>+3 °C</option></select></label></div></div><div className="sim-result"><span>CAMBIO MEDIO ESTIMADO</span><strong>{sensitivity ? `${sensitivity.cambio_estimado_mwh >= 0 ? "+" : ""}${number(sensitivity.cambio_estimado_mwh, 2)} MWh` : "Sin escenarios válidos"}</strong><p>{sensitivity ? `${number(sensitivity.cambio_estimado_pct, 3)}% respecto a la demanda de referencia, en ${number(sensitivity.referencias_validas)} observaciones.` : "Elegimos otra combinación de estación e incremento."}</p><div className="sim-baseline"><span>Demanda de referencia del modelo</span><b>{sensitivity ? `${number(sensitivity.demanda_base_modelo_mwh, 1)} MWh` : "—"}</b></div><div className="sim-baseline"><span>Resultado para {station}</span><b>{sensitivity ? `${number(sensitivity.demanda_base_modelo_mwh + sensitivity.cambio_estimado_mwh, 1)} MWh` : "—"}</b></div></div></div>
        <div className="sensitivity-warning"><ArrowUpRight size={16} /><p>Estos valores describen el comportamiento del modelo ante perturbaciones. No son efectos causales, proyecciones climáticas ni pronósticos oficiales. Random Forest produce cambios escalonados, por lo que un escenario no representa una respuesta física continua.</p></div>
      </section>);
}
