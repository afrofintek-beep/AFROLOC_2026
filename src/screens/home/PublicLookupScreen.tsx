import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { validate } from "../../lib/afroloc/sdk";

export function PublicLookupScreen() {
  const navigate = useNavigate();
  const [code, setCode] = useState("AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001");
  const [result, setResult] = useState<"verified" | "none" | null>(null);

  function lookup() {
    // Public directory lookup — accepts the display code or a valid grid code.
    const ok = /^AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001$/.test(code.trim()) || validate(code).valid;
    setResult(ok ? "verified" : "none");
  }

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Consultar AFROLOC</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* scan plate */}
        <div style={{ background: "#1A1814", borderRadius: 18, padding: "26px 20px", textAlign: "center" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16" /></svg>
          <div style={{ font: "500 12.5px Inter", color: "#A99E8C", marginTop: 12 }}>Aponte para o código AFROLOC ou introduza manualmente</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }} placeholder="Código AFROLOC"
            style={{ flex: 1, height: 50, borderRadius: 14, border: "1.5px solid #EAE3D7", background: "#FFFDF9", padding: "0 14px", font: "700 13px 'Space Mono'", color: "#1A1814", outline: "none" }} />
          <button onClick={lookup} style={{ border: "none", background: "#1A1814", color: "#E8C97A", font: "700 13px Inter", borderRadius: 14, padding: "0 18px", cursor: "pointer" }}>Consultar</button>
        </div>

        {result === "verified" && (
          <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ font: "700 16px 'Space Mono'", color: "#1A1814" }}>AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "700 9px Inter", letterSpacing: ".04em", color: "#2F7A57", background: "#EBF1ED", borderRadius: 7, padding: "4px 8px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                MORADA VERIFICADA
              </span>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 11 }}>
              <Row k="Localização" v="Belas · Luanda" />
              <Row k="Titular" v="A. C. · titular verificado" />
              <Row k="Confiança (ATS)" v="86 · Elevado" green />
              <Row k="Última verificação" v="há 56 dias" />
            </div>
          </div>
        )}
        {result === "none" && (
          <div style={{ display: "flex", gap: 9, alignItems: "center", background: "#FBE3DE", borderRadius: 14, padding: "13px 15px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D14B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            <span style={{ font: "600 12.5px Inter", color: "#9c3a2d" }}>Código não encontrado no registo público.</span>
          </div>
        )}

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          A consulta pública não revela dados pessoais do titular.
        </p>
      </div>
    </PhoneChrome>
  );
}

function Row({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ font: "500 11px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</span>
      <span style={{ font: "700 13.5px Inter", color: green ? "#2F7A57" : "#1A1814" }}>{v}</span>
    </div>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
