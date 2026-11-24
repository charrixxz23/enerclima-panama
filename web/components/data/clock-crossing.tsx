import { dashboard as data } from "../../lib/data";
import Cifra from "../cifra";
import DemandClock from "./demand-clock";
export default function ClockCrossing() {
  const peak = data.perfilHorario.reduce((a, b) =>
    a.demanda_mwh > b.demanda_mwh ? a : b,
  );
  return (
    <div className="clock-crossing" data-bleed="clock">
      <div className="clock-context">
        <p className="kicker">De una escala a otra</p>
        <p>
          Vemos el máximo del perfil medio a las{" "}
          <Cifra tipo="conteo" value={peak.hora} unidad="h" />:{" "}
          <Cifra tipo="demanda" value={peak.demanda_mwh} unidad="MWh" />.
          Conservamos el radio desde cero; no equiparamos esta media con el
          máximo horario del registro.
        </p>
      </div>
      <DemandClock rows={data.perfilHorario} />
    </div>
  );
}
