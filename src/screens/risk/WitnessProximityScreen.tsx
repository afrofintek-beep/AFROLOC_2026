import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { destinationPoint } from "../../lib/geo";

const SUBJECT = { lat: -8.899, lng: 13.205 };
const RADIUS_M = 1000;

const WITNESSES = [
  { id: "w1", name: "Tomás Munga", distM: 120, bearing: 60 },
  { id: "w2", name: "Joana Pereira", distM: 240, bearing: 150 },
  { id: "w3", name: "Manuel Lopes", distM: 1400, bearing: 300 },
].map((w) => ({ ...w, ...destinationPoint(SUBJECT.lat, SUBJECT.lng, w.distM, w.bearing), within: w.distM <= RADIUS_M }));

function dot(within: boolean) {
  const c = within ? "#2F7A57" : "#D14B3A";
  return L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${c};border:3px solid #F8F5F0;box-shadow:0 3px 7px -2px rgba(28,24,21,.6)"></div>`,
  });
}
const subjectIcon = L.divIcon({
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#D4A853;border:4px solid #F8F5F0;box-shadow:0 0 0 1px #D4A853"></div>`,
});

function Fit() {
  const map = useMap();
  useEffect(() => {
    const b = L.latLngBounds(WITNESSES.map((w) => [w.lat, w.lng] as [number, number]));
    b.extend([SUBJECT.lat, SUBJECT.lng]);
    map.fitBounds(b, { padding: [36, 36] });
    setTimeout(() => map.invalidateSize(), 50);
  }, [map]);
  return null;
}

function fmt(m: number) {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;
}

export function WitnessProximityScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Proximidade</span>
        <span style={{ font: "700 11px 'Space Mono'", color: "#B0831F" }}>raio 1 km</span>
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ height: 220, borderRadius: 18, overflow: "hidden", background: "#E9E0D1" }}>
          <MapContainer center={[SUBJECT.lat, SUBJECT.lng]} zoom={14} zoomControl={false} attributionControl={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
            <Circle center={[SUBJECT.lat, SUBJECT.lng]} radius={RADIUS_M} pathOptions={{ color: "#D4A853", weight: 1.5, fillColor: "#D4A853", fillOpacity: 0.1 }} />
            <Marker position={[SUBJECT.lat, SUBJECT.lng]} icon={subjectIcon} />
            {WITNESSES.map((w) => (
              <Marker key={w.id} position={[w.lat, w.lng]} icon={dot(w.within)} />
            ))}
            <Fit />
          </MapContainer>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {WITNESSES.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", flex: "none", background: w.within ? "#2F7A57" : "#D14B3A" }} />
              <span style={{ flex: 1, font: "700 14px Inter", color: "#1A1814" }}>{w.name}</span>
              <span style={{ font: "600 13px 'Space Mono'", color: "#8A8073" }}>{fmt(w.distM)}</span>
              <span style={{ font: "700 15px Inter", color: w.within ? "#2F7A57" : "#D14B3A", width: 18, textAlign: "center" }}>{w.within ? "✓" : "✕"}</span>
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Testemunhas têm de estar a menos de <strong style={{ color: "#1A1814" }}>1 km</strong>. As fora do raio são rejeitadas automaticamente.
        </p>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #EAE3D7",
  background: "#FFFDF9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;
