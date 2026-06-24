import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { AdminTabBar, DARK, SEV, StatGrid } from "./adminUi";

const EVENTS = [
  { title: "GPS spoofing · /address-create", sev: "CRÍTICO" as const, meta: "AO-LUA-4F2X · IP 197.149.x · há 22 min", to: "/fraudFlags" },
  { title: "OTP máx. tentativas", sev: "ELEVADO" as const, meta: "+244 92x · 3 tentativas · há 1h", to: "/securityAudit" },
  { title: "Limite de taxa · send-signup-otp", sev: "MÉDIO" as const, meta: "10/hora excedido · há 3h", to: "/securityAudit" },
];

export function SecurityScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark tabBar={<AdminTabBar active="security" />}>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <div style={{ font: "700 20px Inter", color: DARK.fg }}>Segurança &amp; fraude</div>

        <StatGrid items={[{ v: "6", l: "GPS spoofing detectado", tone: "danger" }, { v: "23", l: "OTP máx. tentativas", tone: "warn" }, { v: "148", l: "Limites de taxa", tone: "gold" }, { v: "99.6%", l: "Moradas íntegras", tone: "green" }]} />

        <div style={{ font: "700 14px Inter", color: DARK.fg }}>Eventos por resolver</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {EVENTS.map((e, i) => {
            const sev = SEV[e.sev];
            return (
              <button key={i} onClick={() => navigate(e.to)} style={{ all: "unset", cursor: "pointer", background: DARK.card, border: `1px solid ${DARK.line}`, borderLeft: `4px solid ${sev.fg}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ font: "700 13px Inter", color: DARK.fg }}>{e.title}</span>
                  <span style={{ font: "700 9px Inter", letterSpacing: ".06em", color: sev.fg, background: sev.bg, borderRadius: 6, padding: "3px 7px" }}>{e.sev}</span>
                </div>
                <div style={{ font: "500 11.5px 'Space Mono'", color: DARK.muted, marginTop: 6 }}>{e.meta}</div>
              </button>
            );
          })}
        </div>
      </div>
    </PhoneChrome>
  );
}
