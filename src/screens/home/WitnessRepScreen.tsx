import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { currentUser } from "../../data/account";

const HISTORY = [
  { title: "Confirmação positiva", meta: "Carlos N. · há 3 dias", delta: "+10" },
  { title: "Endereço próprio", meta: "verificado há 56 dias", delta: "+20" },
  { title: "Antiguidade (6 meses)", meta: "acumulado", delta: "+12" },
];

const TIERS = [
  { name: "Bronze", at: 20 },
  { name: "Prata", at: 50 },
  { name: "Ouro", at: 100 },
];

export function WitnessRepScreen() {
  const navigate = useNavigate();
  const u = currentUser;
  const toOuro = Math.max(0, 100 - u.reputationScore);

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Reputação</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* dark trust card */}
        <div style={{ background: "var(--afl-grad-hero)", borderRadius: 22, padding: 20, color: "#F8F5F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#A99E8C" }}>NÍVEL DE CONFIANÇA</div>
              <div style={{ font: "700 24px Inter", marginTop: 8 }}>{u.reputationTier}</div>
              <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 3 }}>
                {u.testimonials} testemunhos · {u.frauds} fraudes
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ font: "700 30px 'Space Mono'", color: "#E8C97A" }}>{u.reputationScore}</span>
              <span style={{ font: "500 13px 'Space Mono'", color: "#A99E8C" }}> / 100</span>
            </div>
          </div>

          {/* progress to Ouro */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", font: "600 11px Inter", color: "#A99E8C", marginBottom: 6 }}>
              <span>{u.reputationTier}</span>
              <span>Ouro a 100</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#2E2720", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${u.reputationScore}%`, borderRadius: 4, background: "var(--afl-grad-glow)" }} />
            </div>
            <div style={{ font: "500 12px Inter", color: "#E8C97A", marginTop: 8 }}>Faltam {toOuro} pontos para Ouro.</div>
          </div>
        </div>

        {/* history */}
        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 10 }}>Histórico de reputação</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {HISTORY.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", flex: "none", background: "#EBF1ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>{h.title}</div>
                  <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 1 }}>{h.meta}</div>
                </div>
                <span style={{ font: "700 14px 'Space Mono'", color: "#2F7A57" }}>{h.delta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* tiers */}
        <div style={{ display: "flex", gap: 10 }}>
          {TIERS.map((t) => {
            const reached = u.reputationScore >= t.at;
            const current = t.name === u.reputationTier;
            return (
              <div
                key={t.name}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  padding: "13px 8px",
                  textAlign: "center",
                  background: current ? "#FBF2DC" : "#FFFDF9",
                  border: current ? "2px solid #D4A853" : "1.5px solid #EAE3D7",
                  opacity: reached || current ? 1 : 0.6,
                }}
              >
                <div style={{ font: "700 13px Inter", color: "#1A1814" }}>{t.name}</div>
                <div style={{ font: "700 11px 'Space Mono'", color: "#B0831F", marginTop: 3 }}>{t.at}+</div>
              </div>
            );
          })}
        </div>
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
