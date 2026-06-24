import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "../admin/adminUi";

export function TestEnvironmentScreen() {
  const navigate = useNavigate();
  const [sandbox, setSandbox] = useState(true);

  const TOOLS = [
    { label: "Testar código AFROLOC", icon: codeIcon, onClick: () => navigate("/addressTest") },
    { label: "Gerar moradas fictícias", icon: dieIcon, onClick: () => {} },
    { label: "Repor dados de sandbox", icon: resetIcon, onClick: () => {} },
  ];

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Ambiente de testes" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        {/* sandbox banner */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: sandbox ? "#D99A3A22" : DARK.card, border: `1px solid ${sandbox ? "#D99A3A55" : DARK.line}`, borderRadius: 16, padding: "14px 16px" }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: "#D99A3A33", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK.warn} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v6l5 8a2 2 0 0 1-1.7 3H6.7A2 2 0 0 1 5 18l5-8V4" /><path d="M9 4h6" /></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 14px Inter", color: sandbox ? "#E8C97A" : DARK.fg }}>Modo SANDBOX {sandbox ? "ativo" : "inativo"}</div>
            <div style={{ font: "400 11.5px Inter", color: DARK.muted, marginTop: 2 }}>Dados isolados · não afeta produção</div>
          </div>
          <button onClick={() => setSandbox((v) => !v)} role="switch" aria-checked={sandbox} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: sandbox ? DARK.warn : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
            <span style={{ position: "absolute", top: 3, left: sandbox ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
            <div style={{ font: "800 18px 'Space Mono'", color: DARK.gold }}>1 200</div>
            <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>moradas teste</div>
          </div>
          <div style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
            <div style={{ font: "800 18px 'Space Mono'", color: DARK.fg }}>48</div>
            <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>validadores sim.</div>
          </div>
        </div>

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Ferramentas</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {TOOLS.map((t) => (
            <button key={t.label} onClick={t.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 15px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "#332B1E", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{t.icon()}</span>
              <span style={{ flex: 1, font: "600 13.5px Inter", color: DARK.fg }}>{t.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: DARK.muted, lineHeight: 1.45, margin: 0 }}>
          Saia do sandbox antes de operar em produção.
        </p>
      </div>
    </PhoneChrome>
  );
}

function codeIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" /></svg>; }
function dieIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="#E8C97A" /><circle cx="15" cy="15" r="1" fill="#E8C97A" /><circle cx="15" cy="9" r="1" fill="#E8C97A" /><circle cx="9" cy="15" r="1" fill="#E8C97A" /></svg>; }
function resetIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>; }
