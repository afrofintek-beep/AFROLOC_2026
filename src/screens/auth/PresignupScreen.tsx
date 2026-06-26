import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";

type Method = "phone" | "email";

const OPTIONS: { id: Method; title: string; desc: string; recommended?: boolean; icon: JSX.Element }[] = [
  {
    id: "phone",
    title: "Número de telefone",
    desc: "Recomendado · validação por SMS",
    recommended: true,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>,
  },
  {
    id: "email",
    title: "Email",
    desc: "Para quem não tem SMS estável",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  },
];

export function PresignupScreen() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("phone");
  const [accepted, setAccepted] = useState(false);

  return (
    <PhoneChrome>
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div style={{ padding: "10px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>Criar conta</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>Como prefere registar-se?</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 18 }}>
          {OPTIONS.map((o) => {
            const on = method === o.id;
            return (
              <button key={o.id} onClick={() => setMethod(o.id)} style={{ textAlign: "left", display: "flex", gap: 14, alignItems: "center", padding: 16, borderRadius: 18, cursor: "pointer", background: on ? "#FBF2DC" : "#FFFDF9", border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", position: "relative" }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, flex: "none", background: on ? "#F4E4BE" : "#F0EADE", display: "flex", alignItems: "center", justifyContent: "center" }}>{o.icon}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ font: "700 16px Inter", color: "#1A1814", display: "block" }}>{o.title}</span>
                  <span style={{ font: "400 13px Inter", color: "#8A8073", display: "block", marginTop: 3 }}>{o.desc}</span>
                </span>
                {on && (
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#D4A853", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 11, marginTop: 18, cursor: "pointer" }}>
          <button onClick={() => setAccepted((a) => !a)} role="checkbox" aria-checked={accepted} style={{ width: 22, height: 22, flex: "none", marginTop: 1, borderRadius: 7, border: accepted ? "none" : "1.5px solid #C9BDA8", background: accepted ? "#D4A853" : "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {accepted && <svg width="12" height="12" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>
          <span style={{ font: "400 12.5px Inter", color: "#8A8073", lineHeight: 1.45 }}>
            Li e aceito os <strong style={{ color: "#B0831F" }}>Termos de Uso</strong> e a <strong style={{ color: "#B0831F" }}>Política de Privacidade</strong> do AFROLOC.
          </span>
        </label>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton disabled={!accepted} onClick={() => navigate(method === "email" ? "/register" : "/phoneLogin")}>Continuar</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
