import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";
import { Logo } from "../../components/Logo";

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana.cardoso@email.ao");
  const [pw, setPw] = useState("12345678");
  const [show, setShow] = useState(false);
  const valid = /.+@.+\..+/.test(email) && pw.length >= 6;

  return (
    <PhoneChrome>
      <div style={{ padding: "12px 26px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ marginTop: 12 }}>
          <Logo size={44} />
        </div>
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "22px 0 0", letterSpacing: "-.01em" }}>Bem-vinda de volta</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>Entre com o seu email e palavra-passe.</p>

        <Field label="Email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" style={inputStyle} />
        </Field>

        <Field label="Palavra-passe">
          <div style={{ position: "relative" }}>
            <input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} style={{ ...inputStyle, paddingRight: 46 }} />
            <button onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar" : "Mostrar"} style={{ position: "absolute", right: 6, top: 6, width: 40, height: 40, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
                {!show && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </div>
        </Field>

        <button onClick={() => navigate("/forgotPassword")} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-end", marginTop: 12, font: "600 13px Inter", color: "#B0831F" }}>Esqueci a palavra-passe</button>

        <div style={{ marginTop: 22 }}>
          <PrimaryButton disabled={!valid} onClick={() => navigate("/home")}>Entrar</PrimaryButton>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <span style={{ flex: 1, height: 1, background: "#E6DCCC" }} />
          <span style={{ font: "500 12px Inter", color: "#A99E8C" }}>ou</span>
          <span style={{ flex: 1, height: 1, background: "#E6DCCC" }} />
        </div>

        <button onClick={() => navigate("/otp")} style={{ border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 16, height: 54, font: "600 14px Inter", color: "#1A1814", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1814" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
          Entrar com telefone (SMS)
        </button>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 8, textAlign: "center", font: "500 13px Inter", color: "#8A8073" }}>
          Não tem conta?{" "}
          <button onClick={() => navigate("/presignup")} style={{ all: "unset", cursor: "pointer", font: "700 13px Inter", color: "#B0831F" }}>Criar conta</button>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 52,
  boxSizing: "border-box" as const,
  borderRadius: 14,
  border: "1.5px solid #EAE3D7",
  background: "#FFFDF9",
  padding: "0 14px",
  font: "500 15px Inter",
  color: "#1A1814",
  outline: "none",
};
