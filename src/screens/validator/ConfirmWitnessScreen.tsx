import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { LiveMap } from "../../components/ui/LiveMap";
import { cellForCoords } from "../../lib/qgsq";

export function ConfirmWitnessScreen() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["9", "1", "4", "", "", ""]);
  const [decision, setDecision] = useState<null | "ok" | "no">(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const cell = cellForCoords(-8.899, 13.205, 10);
  const complete = digits.every((d) => d !== "");

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, j) => (j === i ? c : x)));
    if (c && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Confirmar testemunho</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ font: "400 13.5px Inter", color: "#8A8073", lineHeight: 1.5, margin: 0 }}>
          Foi indicado(a) como <strong style={{ color: "#1A1814" }}>testemunha</strong>. Confirme que conhece esta morada e o seu morador.
        </p>

        {/* subject */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px" }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", display: "flex", alignItems: "center", justifyContent: "center", font: "700 15px Inter" }}>AC</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "700 15px Inter", color: "#1A1814" }}>Ana Cardoso</div>
            <div style={{ font: "500 12px 'Space Mono'", color: "#8A8073", marginTop: 2 }}>AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001</div>
            <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2 }}>Rua da Samba, 14 · Belas · a 120 m de si</div>
          </div>
        </div>

        <LiveMap lat={-8.899} lng={13.205} accuracy={0} cell={cell} height={130} zoom={18} />

        {/* OTP */}
        <div>
          <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Código recebido por SMS</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                inputMode="numeric"
                maxLength={1}
                style={{ width: 46, height: 56, textAlign: "center", borderRadius: 13, border: d ? "1.5px solid #D4A853" : "1.5px solid #EAE3D7", background: d ? "#FBF2DC" : "#FFFDF9", font: "700 22px 'Space Mono'", color: "#1A1814", outline: "none" }}
              />
            ))}
          </div>
        </div>

        {decision && (
          <div style={{ font: "600 12px Inter", color: decision === "ok" ? "#2F7A57" : "#D14B3A", textAlign: "center" }}>
            {decision === "ok" ? "Testemunho confirmado · obrigado" : "Testemunho rejeitado"}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, paddingTop: 2 }}>
          <button onClick={() => setDecision("no")} style={{ flex: 1, border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 15, height: 52, font: "700 14px Inter", color: "#D14B3A", cursor: "pointer" }}>Rejeitar</button>
          <button disabled={!complete} onClick={() => setDecision("ok")} style={{ flex: 1.4, border: "none", background: complete ? "#2F7A57" : "#D9D2C6", borderRadius: 15, height: 52, font: "700 14px Inter", color: complete ? "#F5F0E8" : "#8A8073", cursor: complete ? "pointer" : "not-allowed" }}>Confirmar testemunho</button>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
