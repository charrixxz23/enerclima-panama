import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { asset } from "../lib/dashboard";
import { dashboard as data } from "../lib/data";
import "./globals.css";
import "leaflet/dist/leaflet.css";
const display = localFont({
  src: [
    {
      path: "../public/fonts/fraunces-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: [
    {
      path: "../public/fonts/source-sans-3-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/source-sans-3-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/source-sans-3-700-latin.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});
const numbers = localFont({
  src: [
    {
      path: "../public/fonts/barlow-condensed-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/barlow-condensed-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-numbers",
  display: "swap",
  preload: false,
});
const site = "https://charrixxz23.github.io/enerclima-panama/";
const title = "EnerClima Panamá | Atlas de demanda y clima";
const description =
  "Exploramos las asociaciones históricas entre clima regional y demanda eléctrica nacional de Panamá, con datos, metodología y límites visibles.";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title,
  description,
  applicationName: "EnerClima Panamá",
  authors: [
    { name: "Alejandro Muñoz" },
    { name: "Angie Valdés" },
    { name: "Richard Smith" },
    { name: "Abisai Bellamy" },
  ],
  alternates: { canonical: site },
  manifest: asset("manifest.webmanifest"),
  icons: {
    icon: [
      { url: asset("favicon.svg"), type: "image/svg+xml" },
      { url: asset("favicon.ico"), sizes: "32x32" },
    ],
    apple: [{ url: asset("apple-touch-icon.png"), sizes: "180x180" }],
  },
  openGraph: {
    title,
    description,
    url: site,
    type: "website",
    locale: "es_PA",
    siteName: "EnerClima Panamá",
    images: [
      {
        url: new URL("images/og-atlas.png", site).href,
        width: 1200,
        height: 630,
        alt: "Atlas de demanda y clima de Panamá",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [new URL("images/og-atlas.png", site).href],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3ea",
  colorScheme: "light",
};
const authors = [
  "Alejandro Muñoz",
  "Angie Valdés",
  "Richard Smith",
  "Abisai Bellamy",
].map((name) => ({ "@type": "Person", name }));
const institution = {
  "@type": "CollegeOrUniversity",
  name: "Universidad Tecnológica de Panamá",
};
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      "@id": `${site}#dataset`,
      name: "EnerClima Panamá: datos agregados de demanda y clima",
      description,
      version: data.version,
      dateModified: data.generado,
      temporalCoverage: `${data.periodo[0]}/${data.periodo[1]}`,
      spatialCoverage: { "@type": "Place", name: "Panamá" },
      creator: authors,
      publisher: institution,
      url: site,
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: new URL("data/dashboard.json", site).href,
      },
      variableMeasured: [
        "Demanda nacional (MWh por intervalo horario)",
        "Temperatura a dos metros",
      ],
    },
    {
      "@type": "ScholarlyArticle",
      "@id": `${site}#article`,
      headline:
        "EnerClima Panamá: asociaciones entre clima regional y demanda eléctrica nacional",
      author: authors,
      publisher: institution,
      datePublished: data.generado,
      dateModified: data.generado,
      version: data.version,
      inLanguage: "es-PA",
      about: { "@id": `${site}#dataset` },
      url: site,
    },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-PA"
      className={`${display.variable} ${body.variable} ${numbers.variable}`}
      data-theme="light"
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
