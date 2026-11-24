import AtlasMark from "./atlas-mark";
export default function SectionHeading({
  index,
  label,
  title,
  description,
}: {
  index: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <header className="atlas-section-heading">
      <div className="section-index">
        <span>{index}</span>
        <AtlasMark />
      </div>
      <div>
        <p className="kicker">{label}</p>
        <h2>{title}</h2>
      </div>
      <p className="section-description">{description}</p>
    </header>
  );
}
