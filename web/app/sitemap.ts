import type { MetadataRoute } from "next";
import { dashboard } from "../lib/data";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://charrixxz23.github.io/enerclima-panama/",
      lastModified: dashboard.generado,
    },
  ];
}
