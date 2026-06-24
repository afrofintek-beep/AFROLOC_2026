import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

type Severity = "critico" | "alto" | "medio";

interface Alert {
  code: string;
  score: 70 | 80 | 90;
  severity: Severity;
  reason: string;
  action: string;
  to: string;
}

const ALERTS: Alert[] = [
  {
    code: "AO-LUA-LDA-MAI-CEN-G10-X6B14-Y49J3-0001",
    score: 90,
    severity: "critico",
    reason: "Verificação vencida há 12 dias · morada suspensa",
    action: "Verificar agora →",
    to: "/reverify",
  },
  {
    code: "AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001",
    score: 80,
    severity: "alto",
    reason: "Vence verificação em 7 dias",
    action: "Verificar agora →",
    to: "/reverify",
  },
  {
    code: "AO-BEN-LBT-GEN-COM-G10-X5K30-Y48T9-0001",
    score: 70,
    severity: "medio",
    reason: "Endereço incompleto · ciclo reduzido a 3 meses",
    action: "Completar morada →",
    to: "/type",
  },
];

const SEV = {
  critico: { accent: "#D14B3A", tint: "#FBE3DE", fg: "#D14B3A", label: "crítico" },
  alto: { accent: "#D4A853", tint: "#F4EAD6", fg: "#B98421", label: "alto" },
  medio: { accent: "#D99A3A", tint: "#F6E9CF", fg: "#B98421", label: "médio" },
} as const;

export function RiskAlertsScreen() {
  const navigate = useNavigate();
  const counts = { critico: 1, alto: 1, medio: 1 };

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Alertas de risco</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* counts */}
        <div style={{ display: "flex", gap: 10 }}>
          {(["critico", "alto", "medio"] as Severity[]).map((s) => (
            <div key={s} style={{ flex: 1, background: SEV[s].tint, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ font: "700 22px 'Space Mono'", color: SEV[s].fg }}>{counts[s]}</div>
              <div style={{ font: "600 11px Inter", color: SEV[s].fg, textTransform: "capitalize" }}>{SEV[s].label}</div>
            </div>
          ))}
        </div>

        {/* alert cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {ALERTS.map((al) => {
            const sev = SEV[al.severity];
            return (
              <div key={al.code} style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderLeft: `4px solid ${sev.accent}`, borderRadius: 16, padding: "14px 15px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ font: "700 14px 'Space Mono'", color: "#1A1814" }}>{al.code}</span>
                  <span style={{ font: "700 10px Inter", letterSpacing: ".06em", color: sev.fg, background: sev.tint, borderRadius: 8, padding: "4px 9px" }}>
                    RISCO {al.score}
                  </span>
                </div>
                <div style={{ font: "400 12.5px Inter", color: "#8A8073", marginTop: 7, lineHeight: 1.4 }}>{al.reason}</div>
                <button onClick={() => navigate(al.to)} style={{ all: "unset", cursor: "pointer", font: "700 12.5px Inter", color: "#B0831F", marginTop: 10, display: "inline-block" }}>
                  {al.action}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Pontuação: <strong style={{ color: "#D14B3A" }}>90 vencida</strong> · <strong style={{ color: "#B98421" }}>80 a vencer</strong> ·{" "}
          <strong style={{ color: "#B98421" }}>70 incompleta</strong>. Calculada automaticamente.
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
