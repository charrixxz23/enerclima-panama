export const panamaPath =
  "M20 65 L60 45 95 35 120 60 145 80 170 95 196 90 220 72 255 70 285 48 315 42 345 52 362 78 389 89 416 117 445 137 470 168 480 190 462 207 442 182 416 167 392 139 363 119 341 100 318 97 295 104 275 112 255 104 235 119 239 151 224 178 205 190 185 181 169 153 141 142 111 147 85 146 65 156 43 136 25 115 Z";
export default function AtlasMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 510 230"
      fill="none"
      aria-hidden="true"
    >
      <path d={panamaPath} fill="currentColor" />
    </svg>
  );
}
