import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "../admin/adminUi";

const OPERATORS = [
  { name: "Unitel", id: "MCC 631 · MNC 02 · 9 412 antenas", coverage: 92 },
  { name: "Movicel", id: "MCC 631 · MNC 04 · 5 088 antenas", coverage: 74 },
  { name: "Africell", id: "MCC 631 · MNC 05 · 2 140 antenas", coverage: 58 },
];

const INTEGRATION = [
  { label: "API de validação de número", state: "Ativa", ok: true },
  { label: "Feed de antenas (Cell ID)", state: "Ativo", ok: true },
  { label: "Africell · feed de antenas", state: "Pendente", ok: false },
];

export function TelecomOperatorsScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Operadoras" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <p style={{ font: "400 12.5px Inter", color: DARK.muted, lineHeight: 1.5, margin: 0 }}>
          Operadoras integradas para confirmar a posse do número e cruzar a localização por triangulação de antenas.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {OPERATORS.map((o) => (
            <div key={o.name} style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 15px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ font: "700 15px Inter", color: DARK.fg }}>{o.name}</span>
                <span style={{ font: "700 12px 'Space Mono'", color: o.coverage >= 80 ? DARK.green : DARK.gold }}>{o.coverage}% cobertura</span>
              </div>
              <div style={{ font: "500 11px 'Space Mono'", color: DARK.muted, margin: "6px 0 9px" }}>{o.id}</div>
              <div style={{ height: 6, borderRadius: 3, background: "#14110d", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${o.coverage}%`, borderRadius: 3, background: "var(--afl-grad-glow)" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ font: "700 13px Inter", color: DARK.fg, marginTop: 2 }}>Estado da integração</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {INTEGRATION.map((it) => (
            <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 12, padding: "11px 14px" }}>
              <span style={{ font: "500 12.5px Inter", color: DARK.fg }}>{it.label}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "700 10px Inter", color: it.ok ? DARK.green : DARK.warn, background: it.ok ? "#2F7A5722" : "#D99A3A22", borderRadius: 8, padding: "4px 9px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: it.ok ? DARK.green : DARK.warn }} />
                {it.state}
              </span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/cellTowers")} style={{ border: `1.5px dashed ${DARK.goldDeep}`, background: "transparent", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: DARK.gold, cursor: "pointer" }}>
          + Adicionar operadora
        </button>
      </div>
    </PhoneChrome>
  );
}
