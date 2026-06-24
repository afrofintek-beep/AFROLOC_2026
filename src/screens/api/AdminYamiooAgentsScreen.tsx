import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { Avatar, DARK, DarkBackHeader, StatGrid } from "../admin/adminUi";

const AGENTS = [
  { initials: "MK", name: "Mário Kassoma", place: "Belas · Luanda", deliveries: "1 204 entregas" },
  { initials: "TN", name: "Teresa Nbula", place: "Talatona", deliveries: "980 entregas" },
  { initials: "DF", name: "Dário Ferreira", place: "Cacuaco", deliveries: "712 entregas" },
];

export function AdminYamiooAgentsScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Agentes Yamioo" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <StatGrid items={[{ v: "42", l: "agentes ativos", tone: "gold" }, { v: "98%", l: "entregas certas", tone: "green" }]} />

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Agentes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {AGENTS.map((a) => (
            <div key={a.initials} style={{ display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "11px 14px" }}>
              <Avatar initials={a.initials} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 13.5px Inter", color: DARK.fg }}>{a.name}</div>
                <div style={{ font: "400 11.5px Inter", color: DARK.muted, marginTop: 1 }}>{a.place}</div>
              </div>
              <span style={{ font: "700 12px 'Space Mono'", color: DARK.gold }}>{a.deliveries}</span>
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: DARK.muted, lineHeight: 1.45, margin: 0 }}>
          Agentes usam os códigos AFROLOC e os pontos de referência para entregar onde não há ruas.
        </p>

        <button style={{ border: `1.5px dashed ${DARK.goldDeep}`, background: "transparent", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: DARK.gold, cursor: "pointer" }}>
          + Convidar agente
        </button>
      </div>
    </PhoneChrome>
  );
}
