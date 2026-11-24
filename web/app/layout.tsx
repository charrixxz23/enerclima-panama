import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "EnerClima Panamá | Observatorio energético y ambiental",
  description: "Exploramos la relación entre demanda eléctrica nacional y condiciones microclimáticas de Panamá con datos históricos de 2015 a 2020.",
  applicationName: "EnerClima Panamá",
  openGraph: {
    title: "EnerClima Panamá",
    description: "Inteligencia energética para un futuro sostenible.",
    type: "website",
    locale: "es_PA",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
