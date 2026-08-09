import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AfrolocRadar from "../../shared/AfrolocRadar";
import { MAPBOX_TOKEN } from "../../lib/mapbox";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { TabBar } from "../../components/ui/TabBar";
import { SERVICES_GROUPS } from "../../data/appScreens";
import { useCitizenData } from "../../state/citizenData";
import { rowToPrimary } from "../../lib/afroloc/addressMap";
import { primaryAddress } from "../../data/account";

/**
 * Hub "Mais / Serviços" — ponto de acesso único a tudo o que está associado à
 * morada do titular. Não introduz ecrãs novos: cada item abre um ecrã que já
 * existe no demo, com o mesmo aspeto. Alcançável a partir do Perfil.
 */
export function ServicesScreen() {
  const navigate = useNavigate();
  const { configured, primary } = useCitizenData();
  const a = configured && primary ? rowToPrimary(primary) : primaryAddress;
  const [radar, setRadar] = useState(false);
  const radarTarget = configured && primary && primary.latitude != null && primary.longitude != null
    ? { lat: primary.latitude, lng: primary.longitude }
    : { lat: -8.899, lng: 13.205 };
  // "Guia até à morada" abre o Radar unificado (Radar·RA·Mapa) em overlay;
  // os restantes serviços navegam para o seu ecrã.
  const openItem = (id: string) => (id === "wayfinding" ? setRadar(true) : navigate("/" + id));

  return (
    <PhoneChrome bg="#F0EADE" tabBar={<TabBar active="profile" />}>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* cabeçalho */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            style={{ all: "unset", cursor: "pointer", width: 38, height: 38, borderRadius: 11, background: "#F8F5F0", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1814" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <div>
            <div style={{ font: "700 22px Inter", color: "#1A1814" }}>Mais serviços</div>
            <div style={{ font: "400 13px Inter", color: "#8A8073", marginTop: 2 }}>Tudo o que está associado à sua morada</div>
          </div>
        </div>

        {SERVICES_GROUPS.map((group) => (
          <div key={group.title}>
            <div style={{ font: "700 11px Inter", letterSpacing: ".1em", color: "#A0937E", margin: "0 2px 8px" }}>
              {group.title.toUpperCase()}
            </div>
            <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, overflow: "hidden" }}>
              {group.items.map((it, i) => (
                <div key={it.id}>
                  {i > 0 && <div style={{ height: 1, background: "#EFE7DA", margin: "0 16px" }} />}
                  <button
                    onClick={() => openItem(it.id)}
                    style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", width: "100%", boxSizing: "border-box" }}
                  >
                    <span style={{ width: 40, height: 40, borderRadius: 11, background: "#F4EAD6", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      {ICONS[it.id] ?? <DotIcon />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: "700 14px Inter", color: "#1A1814" }}>{it.label}</div>
                      <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.desc}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Radar (Radar · RA · Mapa) — distância real e meio de locomoção */}
      {radar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#0C0B0A", display: "flex", flexDirection: "column" }}>
          <AfrolocRadar
            target={radarTarget}
            title={a.code}
            subtitle={a.label}
            onClose={() => setRadar(false)}
            mapboxToken={MAPBOX_TOKEN}
          />
        </div>
      )}
    </PhoneChrome>
  );
}

const s = { fill: "none", stroke: "#B98421", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function DotIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3.5" /></svg>;
}

const ICONS: Record<string, JSX.Element> = {
  certificate: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>,
  share: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></svg>,
  wayfinding: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M12 2l3.5 8.5L22 12l-6.5 1.5L12 22l-3.5-8.5L2 12l6.5-1.5z" /></svg>,
  publicLookup: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" /></svg>,
  household: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /></svg>,
  addMember: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M18 8v6M15 11h6" /></svg>,
  tenancy: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16M9 20V9" /></svg>,
  foreigner: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>,
  reverify: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M4 12a8 8 0 0 1 14-5.3L20 8" /><path d="M20 4v4h-4" /><path d="M20 12a8 8 0 0 1-14 5.3L4 16" /><path d="M4 20v-4h4" /></svg>,
  riskAlerts: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M12 3l9 16H3z" /><path d="M12 10v4M12 17h.01" /></svg>,
  notifications: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>,
  witnessRep: <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="12" cy="9" r="5" /><path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5" /></svg>,
};
