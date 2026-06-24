import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { Logo } from "../../components/Logo";
import { DARK } from "./adminUi";

export function AdminLoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("c.nguvu@gov.ao");
  const [pw, setPw] = useState("12345678");
  const valid = /.+@.+\..+/.test(email) && pw.length >= 6;

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "12px 28px 0", flex: 1, display: "flex", flexDirection: "column", color: DARK.fg }}>
        <div style={{ marginTop: 14 }}><Logo size={42} /></div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#D14B3A22", border: "1px solid #D14B3A55", borderRadius: 18, padding: "6px 12px", marginTop: 22, alignSelf: "flex-start" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DARK.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          <span style={{ font: "700 10px Inter", letterSpacing: ".1em", color: DARK.danger }}>ÁREA RESTRITA</span>
        </div>
        <h1 style={{ font: "700 26px Inter", color: DARK.fg, margin: "16px 0 0", letterSpacing: "-.01em" }}>Consola de administração</h1>
        <p style={{ font: "400 13.5px Inter", color: DARK.muted, margin: "8px 0 0", lineHeight: 1.5 }}>
          Acesso para autoridades e validadores. Todas as sessões são auditadas.
        </p>

        <Field label="Email institucional">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
        </Field>
        <Field label="Palavra-passe">
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" style={inputStyle} />
        </Field>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, font: "400 12px Inter", color: DARK.muted }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DARK.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>
          A seguir pede-se verificação em duas etapas (2FA).
        </div>

        <div style={{ marginTop: "auto", paddingBottom: 8 }}>
          <button disabled={!valid} onClick={() => navigate("/admin2fa")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: valid ? "linear-gradient(135deg,#D4A853,#E07B2C)" : DARK.line, color: valid ? "#2D2519" : DARK.muted, font: "700 15px Inter", cursor: valid ? "pointer" : "not-allowed" }}>
            Continuar para 2FA
          </button>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ font: "500 10px Inter", color: "#A99E8C", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 50,
  boxSizing: "border-box" as const,
  borderRadius: 13,
  border: "1px solid #3A332D",
  background: "#262019",
  padding: "0 14px",
  font: "500 14px Inter",
  color: "#F8F5F0",
  outline: "none",
};
