import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../state/auth";
import { traduzErro } from "./LoginScreen";

export function PhoneLoginScreen() {
  const navigate = useNavigate();
  const { configured, sendPhoneOtp } = useAuth();
  const [digits, setDigits] = useState(""); // 9 dígitos nacionais (sem +244)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^9\d{8}$/.test(digits); // telemóvel angolano: 9XXXXXXXX
  const e164 = "+244" + digits;

  async function handleSend() {
    setError(null);
    if (!configured) {
      navigate("/otp"); // modo demo
      return;
    }
    setBusy(true);
    try {
      await sendPhoneOtp(e164);
      navigate("/otp");
    } catch (e) {
      setError(traduzErro(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PhoneChrome>
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div style={{ padding: "12px 26px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <Logo size={42} />
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "20px 0 0", letterSpacing: "-.01em" }}>Entrar com telemóvel</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          Vamos enviar-lhe um código por SMS para confirmar o número.
        </p>

        <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", margin: "26px 0 8px" }}>Número de telemóvel</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 56, border: "1.5px solid #EAE3D7", background: "#FFFDF9", borderRadius: 14, padding: "0 14px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, paddingRight: 12, borderRight: "1.5px solid #EAE3D7", flex: "none" }}>
            <span style={{ fontSize: 18 }}>🇦🇴</span>
            <span style={{ font: "700 15px 'Space Mono'", color: "#1A1814" }}>+244</span>
          </span>
          <input
            value={digits}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 9))}
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="9XX XXX XXX"
            style={{ flex: 1, border: "none", background: "transparent", font: "600 16px 'Space Mono'", letterSpacing: ".04em", color: "#1A1814", outline: "none", width: "100%" }}
          />
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 12, background: "#FBEAE7", border: "1px solid #F0C9C1", font: "500 12.5px Inter", color: "#B23A2A", lineHeight: 1.4 }}>{error}</div>
        )}

        <div style={{ marginTop: 22 }}>
          <PrimaryButton disabled={!valid || busy} onClick={handleSend}>{busy ? "A enviar…" : "Enviar código"}</PrimaryButton>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 8, textAlign: "center", font: "500 13px Inter", color: "#8A8073" }}>
          Prefere email?{" "}
          <button onClick={() => navigate("/login")} style={{ all: "unset", cursor: "pointer", font: "700 13px Inter", color: "#B0831F" }}>Entrar com email</button>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
