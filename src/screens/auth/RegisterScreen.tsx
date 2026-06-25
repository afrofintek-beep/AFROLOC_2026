import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../state/auth";
import { traduzErro } from "./LoginScreen";

export function RegisterScreen() {
  const navigate = useNavigate();
  const { configured, signUpEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const valid = name.trim().length >= 2 && /.+@.+\..+/.test(email) && pw.length >= 6 && accepted;

  async function handleRegister() {
    setError(null);
    if (!configured) {
      navigate("/home"); // modo demo
      return;
    }
    setBusy(true);
    try {
      await signUpEmail(email.trim(), pw, name.trim());
      // Se a confirmação de email estiver desligada, a sessão já existe → início.
      // Caso contrário, mostramos o aviso para confirmar o email.
      setSent(true);
      setTimeout(() => navigate("/home"), 400);
    } catch (e) {
      setError(traduzErro(e));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <PhoneChrome>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 34px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#EBF1ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
          </div>
          <h2 style={{ font: "700 23px Inter", color: "#1A1814", margin: "20px 0 0" }}>Conta criada</h2>
          <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "10px 0 0", lineHeight: 1.5 }}>
            Se for pedida confirmação, verifique o seu email. A iniciar a sua AFROLOC…
          </p>
        </div>
      </PhoneChrome>
    );
  }

  return (
    <PhoneChrome>
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div style={{ padding: "10px 26px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <Logo size={40} />
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "18px 0 0", letterSpacing: "-.01em" }}>Criar conta</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>É rápido. Vai poder criar a sua AFROLOC a seguir.</p>

        <Field label="Nome completo">
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ex.: Ana Cardoso" style={inputStyle} />
        </Field>
        <Field label="Email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="o.seu@email.ao" style={inputStyle} />
        </Field>
        <Field label="Palavra-passe">
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" style={inputStyle} />
        </Field>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 11, marginTop: 16, cursor: "pointer" }}>
          <button onClick={() => setAccepted((a) => !a)} role="checkbox" aria-checked={accepted} style={{ width: 22, height: 22, flex: "none", marginTop: 1, borderRadius: 7, border: accepted ? "none" : "1.5px solid #C9BDA8", background: accepted ? "#D4A853" : "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {accepted && <svg width="12" height="12" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>
          <span style={{ font: "400 12.5px Inter", color: "#8A8073", lineHeight: 1.45 }}>
            Li e aceito os <strong style={{ color: "#B0831F" }}>Termos de Uso</strong> e a <strong style={{ color: "#B0831F" }}>Política de Privacidade</strong>.
          </span>
        </label>

        {error && (
          <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 12, background: "#FBEAE7", border: "1px solid #F0C9C1", font: "500 12.5px Inter", color: "#B23A2A", lineHeight: 1.4 }}>{error}</div>
        )}

        <div style={{ marginTop: 20 }}>
          <PrimaryButton disabled={!valid || busy} onClick={handleRegister}>{busy ? "A criar…" : "Criar conta"}</PrimaryButton>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 8, textAlign: "center", font: "500 13px Inter", color: "#8A8073" }}>
          Já tem conta?{" "}
          <button onClick={() => navigate("/login")} style={{ all: "unset", cursor: "pointer", font: "700 13px Inter", color: "#B0831F" }}>Entrar</button>
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

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
