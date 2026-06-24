import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";

// Simple strength estimate: length + variety of character classes.
function strength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Muito fraca", color: "#D14B3A" },
    { label: "Fraca", color: "#D99A3A" },
    { label: "Razoável", color: "#D4A853" },
    { label: "Forte", color: "#2F7A57" },
    { label: "Muito forte", color: "#2F7A57" },
  ];
  return { score: s, ...map[s] };
}

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["5", "8", "2", "", "", ""]);
  const [pw, setPw] = useState("Belas2026!");
  const [confirm, setConfirm] = useState("Belas2026!");
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const st = strength(pw);
  const codeOk = digits.every((d) => d !== "");
  const valid = codeOk && pw.length >= 8 && pw === confirm;

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, j) => (j === i ? c : x)));
    if (c && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <PhoneChrome>
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div style={{ padding: "10px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>Repor palavra-passe</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          Enviámos um código para <strong style={{ color: "#1A1814" }}>ana.cardoso@email.ao</strong>. Introduza-o e defina uma nova palavra-passe.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 18 }}>
          {digits.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} onChange={(e) => setDigit(i, e.target.value)} inputMode="numeric" maxLength={1}
              style={{ width: 46, height: 56, textAlign: "center", borderRadius: 13, border: d ? "1.5px solid #D4A853" : "1.5px solid #EAE3D7", background: d ? "#FBF2DC" : "#FFFDF9", font: "700 22px 'Space Mono'", color: "#1A1814", outline: "none" }} />
          ))}
        </div>

        <Field label="Nova palavra-passe">
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" style={inputStyle} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <div style={{ flex: 1, display: "flex", gap: 4 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < st.score ? st.color : "#E6DCCC" }} />
              ))}
            </div>
            <span style={{ font: "700 11px Inter", color: st.color }}>{st.label}</span>
          </div>
        </Field>

        <Field label="Confirmar palavra-passe">
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" style={{ ...inputStyle, borderColor: confirm && confirm !== pw ? "#D14B3A" : "#EAE3D7" }} />
          {confirm && confirm !== pw && <div style={{ font: "500 11.5px Inter", color: "#D14B3A", marginTop: 6 }}>As palavras-passe não coincidem.</div>}
        </Field>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton disabled={!valid} onClick={() => navigate("/home")}>Repor e entrar</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 50,
  boxSizing: "border-box" as const,
  borderRadius: 14,
  border: "1.5px solid #EAE3D7",
  background: "#FFFDF9",
  padding: "0 14px",
  font: "500 15px Inter",
  color: "#1A1814",
  outline: "none",
};

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
