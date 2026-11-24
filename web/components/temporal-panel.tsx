import type { CSSProperties, ReactNode } from "react";
import manifest from "../public/data/temporal-profiles.json";
import { asset } from "../lib/dashboard";
export default function TemporalPanel({
  id,
  className = "",
  children,
}: {
  id: keyof typeof manifest.profiles;
  className?: string;
  children: ReactNode;
}) {
  const profile = manifest.profiles[id];
  return (
    <section
      id={id}
      className={`atlas-section temporal-panel ${className}`}
      data-profile-series={profile.key}
      style={
        {
          "--profile-top": `url("${asset(profile.maskTop)}")`,
          "--profile-bottom": `url("${asset(profile.maskBottom)}")`,
          "--profile-stroke": `url("${asset(profile.stroke)}")`,
        } as CSSProperties
      }
    >
      <figure
        className="temporal-profile"
        data-profile-count={profile.n}
        dangerouslySetInnerHTML={{
          __html: profile.header.replaceAll(
            "__BASE_PATH__",
            process.env.NEXT_PUBLIC_BASE_PATH || "",
          ),
        }}
      />
      <div className="temporal-content">{children}</div>
    </section>
  );
}
