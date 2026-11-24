import { fmtFechaLarga } from "../lib/format";
export default function Fecha({ value }: { value: string }) {
  return (
    <time dateTime={value} data-exact={value} title={value}>
      {fmtFechaLarga(value)}
    </time>
  );
}
