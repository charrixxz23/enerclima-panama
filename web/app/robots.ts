import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`,
    },
    sitemap: "https://charrixxz23.github.io/enerclima-panama/sitemap.xml",
  };
}
