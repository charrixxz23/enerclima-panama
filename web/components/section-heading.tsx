import { panamaPath } from "./atlas-mark";
import { escapeHtml } from "../lib/html";
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
  const markup = `<div class="section-index"><span>${escapeHtml(index)}</span><svg viewBox="0 0 510 230" fill="none" aria-hidden="true"><path d="${panamaPath}" fill="currentColor"/></svg></div><div><p class="kicker">${escapeHtml(label)}</p><h2>${escapeHtml(title)}</h2></div><p class="section-description">${escapeHtml(description)}</p>`;
  return (
    <header
      className="atlas-section-heading"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
