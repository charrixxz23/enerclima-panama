import { asset } from "../lib/dashboard";
export default function DataArt({
  name,
  label,
  ratio,
  className = "",
}: {
  name: string;
  label: string;
  ratio: string;
  className?: string;
}) {
  const url = `url("${asset(`images/data/${name}.svg`)}")`;
  return (
    <div
      role="img"
      aria-label={label}
      className={`data-art draw-line ${className}`}
      style={{ maskImage: url, WebkitMaskImage: url, aspectRatio: ratio }}
    />
  );
}
