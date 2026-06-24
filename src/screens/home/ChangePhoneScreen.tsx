import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";

export function ChangePhoneScreen() {
  const navigate = useNavigate();
  const [newNumber, setNewNumber] = useState("+244 936 110 244");
  const [digits, setDigits] = useState(["7", "2", "1", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Mudar número</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ font: "400 13.5px Inter", color: "#8A8073", lineHeight: 1.5, margin: 0 }}>
          Por segurança, confirmamos o número atual e o novo por SMS.
        </p>

        <Field label="Número atual">
          <div style={{ ...fieldBox, justifyContent: "space-between" }}>
            <span style={{ font: "700 14px 'Space Mono'", color: "#1A1814" }}>+244 923 ··· 030</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "700 10px Inter", color: "#2F7A57", background: "#EBF1ED", borderRadius: 16, padding: "4px 9px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              Confirmado
            </span>
          </div>
        </Field>

        <Field label="Novo número">
          <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} inputMode="tel" style={{ ...fieldBox, width: "100%", boxSizing: "border-box", font: "700 14px 'Space Mono'", color: "#1A1814", outline: "none" }} />
        </Field>

        <Field label="Código enviado ao novo número">
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            {digits.map((d, i) => (
              <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} onChange={(e) => setDigit(i, e.target.value)} inputMode="numeric" maxLength={1}
                style={{ width: 46, height: 56, textAlign: "center", borderRadius: 13, border: d ? "1.5px solid #D4A853" : "1.5px solid #EAE3D7", background: d ? "#FBF2DC" : "#FFFDF9", font: "700 22px 'Space Mono'", color: "#1A1814", outline: "none" }} />
            ))}
          </div>
        </Field>

        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "#F4EAD6", borderRadius: 13, padding: "12px 14px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
          <span style={{ font: "400 12px Inter", color: "#7C6A4A", lineHeight: 1.45 }}>
            Mudar de número repõe os dispositivos de confiança — terá de reativar a biometria.
          </span>
        </div>

        <div style={{ paddingTop: 2 }}>
          <PrimaryButton disabled={!complete} onClick={() => navigate("/profile")}>Confirmar novo número</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

const fieldBox = {
  background: "#FFFDF9",
  border: "1.5px solid #EAE3D7",
  borderRadius: 13,
  padding: "0 14px",
  height: 50,
  display: "flex",
  alignItems: "center",
} as const;

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
