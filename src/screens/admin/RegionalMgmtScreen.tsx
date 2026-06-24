import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "./adminUi";

const MUNICIPIOS = [
  { name: "Belas", validator: "Carlos Nguvu", moradas: "3 412 moradas", assigned: true },
  { name: "Cacuaco", validator: "Inês Tavares", moradas: "2 088 moradas", assigned: true },
  { name: "Quenguela", validator: "Por atribuir", moradas: "640 moradas", assigned: false },
];

export function RegionalMgmtScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Gestão regional" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <div style={{ background: "var(--afl-grad-hero)", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ font: "700 16px Inter", color: DARK.fg }}>🇦🇴 Angola · 21 províncias</div>
          <div style={{ font: "400 12px Inter", color: DARK.muted, marginTop: 4 }}>18 com validador · 3 por atribuir</div>
        </div>

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Municípios · Luanda</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {MUNICIPIOS.map((m) => (
            <div key={m.name} style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ font: "700 14px Inter", color: DARK.fg }}>{m.name}</span>
                <span style={{ font: "700 12px 'Space Mono'", color: DARK.gold }}>{m.moradas}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.assigned ? DARK.green : DARK.warn }} />
                <span style={{ font: "400 12px Inter", color: m.assigned ? DARK.muted : DARK.warn }}>
                  {m.assigned ? `Validador: ${m.validator}` : m.validator}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/roleApprovals")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", marginTop: 4 }}>
          Atribuir validador
        </button>
      </div>
    </PhoneChrome>
  );
}
