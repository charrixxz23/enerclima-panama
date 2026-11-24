"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import data from "../public/data/dashboard.json";

const markerIcon = L.divIcon({
  className: "station-marker",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function MapView() {
  return (
    <MapContainer center={[8.65, -81.2]} zoom={6} scrollWheelZoom={false} className="map-view" aria-label="Mapa de las ciudades de Tocumen, Santiago y David">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.estaciones.map((station) => (
        <Marker key={station.nombre} position={[station.latitud, station.longitud]} icon={markerIcon}>
          <Popup>{station.nombre}. Referencia aeroportuaria, no coordenada de la celda meteorológica.</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
