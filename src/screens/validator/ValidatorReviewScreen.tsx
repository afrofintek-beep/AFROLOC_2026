import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const CHECKS = [
  "testemunhas < 1km",
  "GPS verificado · sem indícios de spoofing · ±4m",
];

const WITNESSES = [
  { initials: "TM", name: "Tomás Munga", tier: "Prata", code: "AO-LUA-BEL-FUT-GEN-G10-X6AZ9-Y49M4-0001", dist: "120m" },
  { initials: "JP", name: "Joana Pereira", tier: "Bronze", code: "AO-LUA-BEL-RAM-GEN-G10-X6AV5-Y49K1-0002", dist: "240m" },
];

export function ValidatorReviewScreen() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState<null | "approved" | "rejected">(null);

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Pedido de validação</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* subject */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px" }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", display: "flex", alignItems: "center", justifyContent: "center", font: "700 15px Inter" }}>AC</span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 15px Inter", color: "#1A1814" }}>Ana Cardoso</div>
            <div style={{ font: "500 12.5px 'Space Mono'", color: "#8A8073", marginTop: 2 }}>AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001</div>
          </div>
          <span style={{ font: "700 9px Inter", letterSpacing: ".06em", color: "#B98421", background: "#F4EAD6", borderRadius: 6, padding: "4px 8px" }}>PENDENTE</span>
        </div>

        {/* checks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CHECKS.map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 11, background: "#EBF1ED", borderRadius: 13, padding: "11px 14px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              <span style={{ font: "500 12.5px Inter", color: "#2F7A57" }}>{c}</span>
            </div>
          ))}
        </div>

        {/* witnesses */}
        <div>
          <div style={{ font: "700 13px Inter", color: "#1A1814", marginBottom: 9 }}>Testemunhos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WITNESSES.map((w) => (
              <div key={w.code} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "11px 14px" }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", flex: "none", background: "#F0EADE", color: "#8A8073", display: "flex", alignItems: "center", justifyContent: "center", font: "700 12px Inter" }}>{w.initials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 13px Inter", color: "#1A1814" }}>{w.name} · {w.tier}</div>
                  <div style={{ font: "500 11.5px 'Space Mono'", color: "#8A8073", marginTop: 1 }}>{w.code} · {w.dist}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              </div>
            ))}
          </div>
        </div>

        {/* ATS estimate */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1A1814", borderRadius: 14, padding: "14px 16px" }}>
          <span style={{ font: "500 12.5px Inter", color: "#A99E8C" }}>ATS estimado após aprovação</span>
          <span style={{ font: "700 22px 'Space Mono'", color: "#E8C97A" }}>78</span>
        </div>

        {decision && (
          <div style={{ font: "600 12px Inter", color: decision === "approved" ? "#2F7A57" : "#D14B3A", textAlign: "center" }}>
            {decision === "approved" ? "Morada aprovada · validada" : "Pedido rejeitado"}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setDecision("rejected")} style={{ flex: 1, border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 15, height: 52, font: "700 14px Inter", color: "#D14B3A", cursor: "pointer" }}>Rejeitar</button>
          <button onClick={() => setDecision("approved")} style={{ flex: 1.4, border: "none", background: "#2F7A57", borderRadius: 15, height: 52, font: "700 14px Inter", color: "#F5F0E8", cursor: "pointer" }}>Aprovar morada</button>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
