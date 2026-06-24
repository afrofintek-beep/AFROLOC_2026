import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Rectangle, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { QgsqGeoCell } from "../../lib/qgsq";

// Gold AFROLOC pin as an HTML divIcon (avoids Leaflet's broken default marker
// asset paths under bundlers).
const pinIcon = L.divIcon({
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  html: `<div style="width:26px;height:26px;border-radius:50%;background:#D4A853;border:4px solid #F8F5F0;box-shadow:0 6px 14px -4px rgba(212,168,83,.9)"></div>`,
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
    // Leaflet needs a nudge when its container was sized after mount.
    setTimeout(() => map.invalidateSize(), 50);
  }, [lat, lng, map]);
  return null;
}

/** Real slippy map centered on a GPS fix, with accuracy circle + QGSQ cell. */
export function LiveMap({
  lat,
  lng,
  accuracy,
  cell,
  height = 200,
  zoom = 18,
}: {
  lat: number;
  lng: number;
  accuracy: number;
  cell?: QgsqGeoCell;
  height?: number;
  zoom?: number;
}) {
  return (
    <div style={{ height, borderRadius: 24, overflow: "hidden", position: "relative" }}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", background: "#E9E0D1" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        {accuracy > 0 && (
          <Circle
            center={[lat, lng]}
            radius={accuracy}
            pathOptions={{ color: "#D4A853", weight: 1, fillColor: "#D4A853", fillOpacity: 0.12 }}
          />
        )}
        {cell && (
          <Rectangle
            bounds={[
              [cell.bounds[0], cell.bounds[1]],
              [cell.bounds[2], cell.bounds[3]],
            ]}
            pathOptions={{ color: "#E07B2C", weight: 2, fillColor: "#D4A853", fillOpacity: 0.25 }}
          />
        )}
        <Marker position={[lat, lng]} icon={pinIcon} />
        <Recenter lat={lat} lng={lng} />
      </MapContainer>
      <div
        style={{
          position: "absolute",
          right: 8,
          bottom: 6,
          zIndex: 400,
          font: "400 8px Inter",
          color: "#1A181488",
          background: "#F8F5F0aa",
          borderRadius: 5,
          padding: "1px 5px",
        }}
      >
        © OpenStreetMap
      </div>
    </div>
  );
}
