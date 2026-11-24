"use client";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import { useTheme } from "./theme-toggle";
import L from "leaflet";
import {
  asset,
  number,
  thermalColor,
  type Station,
  type ThermalEvent,
} from "../lib/dashboard";
export default function MapView({
  stations,
  events,
}: {
  stations: Station[];
  events: ThermalEvent[];
}) {
  const theme = useTheme();
  return (
    <MapContainer
      bounds={[
        [7, -83.2],
        [10, -77.1],
      ]}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="map-view"
    >
      <ZoomControl
        zoomInTitle="Acercamos el mapa"
        zoomOutTitle="Alejamos el mapa"
      />
      <ImageOverlay
        url={asset(`images/panama-atlas${theme === "dark" ? "-dark" : ""}.svg`)}
        bounds={[
          [7, -83.2],
          [10, -77.1],
        ]}
      />
      {stations.map((s) => {
        const t = events.find((e) => e.estacion === s.nombre);
        const temps = events.map((e) => e.percentil_95_c);
        const color = t ? thermalColor(t.percentil_95_c, temps) : "var(--text)";
        return (
          <Marker
            key={s.nombre}
            position={[s.latitud, s.longitud]}
            alt={s.nombre}
            icon={L.divIcon({
              className: "station-marker",
              html: `<span style="background:${color}"></span>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              {s.nombre}. {s.nota}. Umbral P95:{" "}
              {t ? number(t.percentil_95_c) : "—"} °C.
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
