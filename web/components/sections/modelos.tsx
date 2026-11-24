import { dashboard as data } from "../../lib/data";
import { number } from "../../lib/dashboard";
export default function Modelos() {
const model = data.modelo.find(row => row.modelo === data.modeloSeleccionado);
return (<section className="section models-section" id="modelos">
        <div className="section-heading"><div><p className="eyebrow">04 — MODELOS PREDICTIVOS</p><h2>El contexto histórico<br /><em>ayuda a anticipar.</em></h2></div><p className="section-deck">Evaluamos una referencia semanal y regresiones en un corte cronológico. Los datos climáticos corresponden a la misma hora estimada.</p></div>
        <div className="model-lead"><div><span>MODELO SELECCIONADO EN VALIDACIÓN</span><h3>Random Forest</h3><p>Lo seleccionamos por obtener el menor RMSE en validación. El modelo usa calendario, meteorología observada y rezagos de demanda.</p></div><div className="model-score"><strong>{model ? `${number(model.mape_pct, 2)}%` : "—"}</strong><span>MAPE EN PRUEBA</span></div></div>
        <div className="model-table-wrap"><table className="model-table"><thead><tr><th>Modelo</th><th>MAE</th><th>RMSE</th><th>MAPE</th><th>R²</th></tr></thead><tbody>{data.modelo.map((row) => <tr key={row.modelo} className={row.modelo === data.modeloSeleccionado ? "selected-model" : ""}><th>{row.modelo.replaceAll("_", " ")}{row.modelo === data.modeloSeleccionado && <span>Seleccionado</span>}</th><td>{number(row.mae, 1)} MWh</td><td>{number(row.rmse, 1)} MWh</td><td>{number(row.mape_pct, 2)}%</td><td>{number(row.r2, 3)}</td></tr>)}</tbody></table></div>
        <div className="model-notes"><p><b>MAE</b> error absoluto medio. <b>RMSE</b> penaliza más los errores grandes. <b>MAPE</b> expresa el error relativo. <b>R²</b> resume la variación explicada.</p><p>La prueba estima el siguiente intervalo con observaciones previas disponibles. El clima de la hora objetivo es observado, por lo que no validamos un pronóstico operativo con clima futuro.</p></div>
        <div className="benchmark-note"><span>REFERENCIA SEMANAL DEL CND</span><p>En 14 semanas oficiales (2,352 horas), el archivo de predespacho registró MAE {number(data.predespacho.mae, 1)} MWh y MAPE {number(data.predespacho.mape_pct, 2)}%. Reportamos esta referencia por separado porque cubre un horizonte de una semana.</p></div>
      </section>);
}
