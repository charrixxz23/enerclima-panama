"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DemandPoint, RegionalPoint } from "../../lib/dashboard";
import { fmtFechaCorta, fmtFechaLarga, fmtConteo } from "../../lib/format";
import Cifra from "../cifra";
export default function SeriesChart({
  rows,
  dataKey,
  thermal,
}: {
  rows: DemandPoint[] | RegionalPoint[];
  dataKey: string;
  thermal: boolean;
}) {
  const chartRows: Array<DemandPoint | RegionalPoint> = rows;
  const values = chartRows.map((r) =>
    thermal
      ? (r as RegionalPoint)[dataKey as keyof Omit<RegionalPoint, "datetime">]
      : (r as DemandPoint).demanda_mwh,
  );
  const lo = Math.min(...values),
    hi = Math.max(...values);
  const ticks = [
    ...new Set(
      Array.from({ length: 5 }, (_, i) => Math.round(lo + ((hi - lo) * i) / 4)),
    ),
  ];
  const dates = [
    ...new Set(
      Array.from(
        { length: 5 },
        (_, i) =>
          chartRows[Math.round(((chartRows.length - 1) * i) / 4)].datetime,
      ),
    ),
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartRows}
        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
        accessibilityLayer
      >
        <CartesianGrid stroke="var(--rule)" vertical={false} />
        <XAxis
          dataKey="datetime"
          ticks={dates}
          tickCount={5}
          tickFormatter={fmtFechaCorta}
          minTickGap={45}
          tick={{ fill: "var(--secondary)", fontSize: 14 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[
            Math.min(lo, ticks[0]),
            Math.max(hi, ticks[ticks.length - 1]),
          ]}
          ticks={ticks}
          tickCount={5}
          tickFormatter={(value) => fmtConteo(Number(value))}
          tick={{ fill: "var(--secondary)", fontSize: 14 }}
          axisLine={false}
          tickLine={false}
          width={58}
        />
        <Tooltip
          labelFormatter={(v) => fmtFechaLarga(String(v))}
          formatter={(v) => [
            <Cifra
              key="valor"
              tipo={thermal ? "temperatura" : "demanda"}
              value={Number(v)}
              unidad={thermal ? "°C" : "MWh"}
            />,
            thermal ? "Temperatura" : "Demanda",
          ]}
          contentStyle={{
            background: "var(--paper)",
            color: "var(--text)",
            border: "1px solid var(--secondary)",
          }}
        />
        <Line
          dataKey={dataKey}
          stroke={thermal ? "var(--warm)" : "var(--text)"}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
