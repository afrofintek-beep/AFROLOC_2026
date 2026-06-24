import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK } from "./adminUi";

export function AdminSetupScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("Carlos Nguvu");
  const [email, setEmail] = useState("c.nguvu@gov.ao");
  const [twofa, setTwofa] = useState(true);

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "12px 26px 18px", flex: 1, display: "flex", flexDirection: "column", color: DARK.fg }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#332B1E", border: `1px solid ${DARK.line}`, borderRadius: 18, padding: "6px 12px", alignSelf: "flex-start", marginTop: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: DARK.gold }} />
          <span style={{ font: "700 10px Inter", letterSpacing: ".1em", color: DARK.gold }}>PRIMEIRA EXECUÇÃO</span>
        </div>
        <h1 style={{ font: "700 25px Inter", color: DARK.fg, margin: "16px 0 0", letterSpacing: "-.01em" }}>Criar super-administrador</h1>
        <p style={{ font: "400 13.5px Inter", color: DARK.muted, margin: "8px 0 0", lineHeight: 1.5 }}>
          Defina a conta de Nível 5 que governa o país. Só é feito uma vez.
        </p>

        <Field label="Nome completo"><input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Field>
        <Field label="País / jurisdição">
          <div style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ font: "700 14px Inter", color: DARK.fg }}>🇦🇴 Angola · nacional</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={DARK.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </Field>
        <Field label="Email institucional"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} /></Field>

        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#262019", border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "13px 15px", cursor: "pointer", marginTop: 16 }}>
          <span style={{ font: "600 13.5px Inter", color: DARK.fg }}>Ativar 2FA obrigatório</span>
          <button onClick={() => setTwofa((v) => !v)} role="switch" aria-checked={twofa} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: twofa ? DARK.greenDeep : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
            <span style={{ position: "absolute", top: 3, left: twofa ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
          </button>
        </label>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#D99A3A1A", border: "1px solid #D99A3A44", borderRadius: 13, padding: "12px 14px", marginTop: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK.warn} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
          <span style={{ font: "400 12px Inter", color: "#d8b87f", lineHeight: 1.45 }}>
            Guarde os códigos de backup gerados a seguir. Sem 2FA nem backup, não há recuperação de acesso de Nível 5.
          </span>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <button onClick={() => navigate("/admin2fa")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
            Criar e gerar backup
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
