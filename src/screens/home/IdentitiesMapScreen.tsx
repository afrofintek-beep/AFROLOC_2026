import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { TabBar } from "../../components/ui/TabBar";
import { ADDRESSES, STATUS_COLOR, type AddressStatus, type AddressSummary } from "../../data/addresses";

type Filter = "todas" | "activas" | "pendentes";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "activas", label: "Activas" },
  { id: "pendentes", label: "Pendentes" },
];

function pinFor(status: AddressStatus) {
  const c = STATUS_COLOR[status];
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${c};border:3px solid #F8F5F0;box-shadow:0 4px 10px -3px rgba(28,24,21,.6)"></div>`,
  });
}

function FitBounds({ items }: { items: AddressSummary[] }) {
  const map = useMap();
  useEffect(() => {
    if (!items.length) return;
    if (items.length === 1) {
      map.setView([items[0].lat, items[0].lng], 14);
    } else {
      const bounds = L.latLngBounds(items.map((a) => [a.lat, a.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
    setTimeout(() => map.invalidateSize(), 50);
  }, [items, map]);
  return null;
}

export function IdentitiesMapScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("todas");

  const items = useMemo(() => {
    if (filter === "activas") return ADDRESSES.filter((a) => a.status === "ACTIVO");
    if (filter === "pendentes") return ADDRESSES.filter((a) => a.status === "PENDENTE");
    return ADDRESSES;
  }, [filter]);

  return (
    <PhoneChrome bg="#F0EADE" tabBar={<TabBar active="identitiesMap" />}>
      <div style={{ position: "relative", height: "100%" }}>
        {/* full-bleed map */}
        <MapContainer
          center={[-8.95, 13.4]}
          zoom={11}
          zoomControl={false}
          attributionControl={false}
          style={{ position: "absolute", inset: 0, background: "#E9E0D1" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
          {items.map((a) => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={pinFor(a.status)} eventHandlers={{ click: () => navigate("/detail") }} />
          ))}
          <FitBounds items={items} />
        </MapContainer>

        {/* count badge + filter chips */}
        <div style={{ position: "absolute", left: 16, right: 16, top: 12, zIndex: 500, display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#1A1814",
              color: "#E8C97A",
              font: "700 13px 'Space Mono'",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
              boxShadow: "0 4px 10px -3px rgba(28,24,21,.5)",
            }}
          >
            {ADDRESSES.length}
          </span>
          <div style={{ display: "flex", gap: 7 }}>
            {FILTERS.map((f) => {
              const on = f.id === filter;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    border: "none",
                    borderRadius: 18,
                    padding: "7px 13px",
                    font: `${on ? 700 : 600} 12px Inter`,
                    cursor: "pointer",
                    color: on ? "#2D2519" : "#1A1814",
                    background: on ? "var(--afl-grad-glow)" : "#FFFDF9",
                    boxShadow: "0 4px 10px -4px rgba(28,24,21,.4)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* bottom sheet */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 500,
            background: "#FFFDF9",
            borderRadius: "22px 22px 0 0",
            boxShadow: "0 -16px 40px -22px rgba(28,24,21,.4)",
            padding: "10px 18px 16px",
            maxHeight: "52%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ width: 38, height: 5, borderRadius: 3, background: "#E6DCCC", margin: "0 auto 12px" }} />
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>
            {items.length} {items.length === 1 ? "morada" : "moradas"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
            {items.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate("/detail")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#F8F5F0",
                  borderRadius: 14,
                  padding: "11px 13px",
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: "50%", flex: "none", background: STATUS_COLOR[a.status], border: "2px solid #F8F5F0", boxShadow: `0 0 0 1px ${STATUS_COLOR[a.status]}55` }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ font: "700 13.5px Inter", color: "#1A1814", display: "block" }}>
                    {a.name} · {a.place}
                  </span>
                  <span style={{ font: "500 11.5px 'Space Mono'", color: "#8A8073", display: "block", marginTop: 1 }}>
                    {a.code ?? "— por concluir —"}
                  </span>
                </span>
                {a.ats != null ? (
                  <span style={{ font: "700 12px 'Space Mono'", color: a.status === "ACTIVO" ? "#2F7A57" : "#B98421" }}>ATS {a.ats}</span>
                ) : (
                  <span style={{ font: "600 10px Inter", color: "#A99E8C", letterSpacing: ".08em" }}>RASCUNHO</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
}
