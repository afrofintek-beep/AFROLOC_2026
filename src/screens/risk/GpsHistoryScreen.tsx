import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

interface Read {
  id: string;
  title: string;
  coords: string;
  date: string;
  lat: number;
  lng: number;
  ok: boolean;
}

const READS: Read[] = [
  { id: "r1", title: "Verificação no terreno · ±4 m", coords: "-8.8990, 13.2050", date: "24 Out", lat: -8.899, lng: 13.205, ok: true },
  { id: "r2", title: "Leitura rejeitada · spoofing", coords: "-8.8401, 13.2890", date: "18 Out", lat: -8.8401, lng: 13.289, ok: false },
  { id: "r3", title: "Registo inicial · ±5 m", coords: "-8.8991, 13.2049", date: "02 Mai", lat: -8.8991, lng: 13.2049, ok: true },
];

function dot(ok: boolean) {
  const c = ok ? "#5BC48E" : "#D14B3A";
  return L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${c};border:3px solid #1A1814;box-shadow:0 0 0 1px ${c}"></div>`,
  });
}

function Fit({ reads }: { reads: Read[] }) {
  const map = useMap();
  useEffect(() => {
    const b = L.latLngBounds(reads.map((r) => [r.lat, r.lng] as [number, number]));
    map.fitBounds(b, { padding: [40, 40], maxZoom: 14 });
    setTimeout(() => map.invalidateSize(), 50);
  }, [reads, map]);
  return null;
}

export function GpsHistoryScreen() {
  const navigate = useNavigate();

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Histórico de GPS</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* suspicious banner */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#FBE3DE", borderRadius: 14, padding: "12px 14px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D14B3A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>
            <path d="M12 3l9 16H3z" />
            <path d="M12 10v4M12 17.5v.5" />
          </svg>
          <span style={{ font: "500 12.5px Inter", color: "#9c3a2d", lineHeight: 1.45 }}>
            1 leitura suspeita — possível GPS spoofing a <strong>3,2 km</strong> do padrão.
          </span>
        </div>

        {/* dark map */}
        <div style={{ height: 180, borderRadius: 18, overflow: "hidden", position: "relative", background: "#1A1814" }}>
          <MapContainer center={[-8.87, 13.25]} zoom={12} zoomControl={false} attributionControl={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              className="afl-dark-tiles"
            />
            {READS.map((r) => (
              <Marker key={r.id} position={[r.lat, r.lng]} icon={dot(r.ok)} />
            ))}
            <Fit reads={READS} />
          </MapContainer>
        </div>

        {/* timeline */}
        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Linha temporal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {READS.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", flex: "none", background: r.ok ? "#2F7A57" : "#D14B3A" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ font: `${r.ok ? 700 : 700} 13px Inter`, color: r.ok ? "#1A1814" : "#D14B3A" }}>{r.title}</div>
                  <div style={{ font: "500 11.5px 'Space Mono'", color: "#8A8073", marginTop: 2 }}>
                    {r.coords} · {r.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Estabilidade do ponto: <strong style={{ color: "#2F7A57" }}>95%</strong>. Leituras divergentes são descartadas do cálculo ATS.
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
