import type { MetadataRoute } from "next";
import { asset } from "../lib/dashboard";
export const dynamic = "force-static";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EnerClima Panamá",
    short_name: "EnerClima",
    description: "Exploramos el atlas de demanda y clima de Panamá",
    lang: "es-PA",
    start_url: asset(""),
    scope: asset(""),
    display: "standalone",
    background_color: "#faf7f1",
    theme_color: "#183a3a",
    icons: [
      { src: asset("favicon.svg"), sizes: "any", type: "image/svg+xml" },
      {
        src: asset("apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
