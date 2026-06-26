import { useEffect, useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";
import { useAuth } from "../../state/auth";
import { traduzErro } from "./LoginScreen";

function formatPhone(e164: string | null): string {
  if (!e164) return "o seu número";
  const n = e164.replace("+244", "");
  return `+244 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`.trim();
}

export function OtpScreen() {
  const navigate = useNavigate();
  const { configured, pendingPhone, verifyPhoneOtp, sendPhoneOtp } = useAuth();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");
  const complete = digits.every((d) => d !== "");

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  // Em modo real, sem número pendente (ex.: recarregou) → volta ao início do fluxo.
  if (configured && !pendingPhone) return <Navigate to="/phoneLogin" replace />;

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, j) => (j === i ? c : x)));
    if (c && i < 5) refs.current[i + 1]?.focus();
  }

  async function verify() {
    setError(null);
    if (!configured) {
      navigate("/home"); // modo demo
      return;
    }
    setBusy(true);
    try {
      await verifyPhoneOtp(pendingPhone!, code);
      navigate("/home");
    } catch (e) {
      setError(traduzErro(e));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setSeconds(45);
    if (configured && pendingPhone) {
      try { await sendPhoneOtp(pendingPhone); } catch (e) { setError(traduzErro(e)); }
    }
  }

  const mmss = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <PhoneChrome>
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={2} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "20px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>Confirme o seu número</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          Enviámos um código de 6 dígitos por SMS para <strong style={{ color: "#1A1814" }}>{formatPhone(pendingPhone)}</strong>
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 24 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              style={{ width: 48, height: 60, textAlign: "center", borderRadius: 14, border: d ? "1.5px solid #D4A853" : "1.5px solid #EAE3D7", background: d ? "#FBF2DC" : "#FFFDF9", font: "700 24px 'Space Mono'", color: "#1A1814", outline: "none" }}
            />
          ))}
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: "11px 13px", borderRadius: 12, background: "#FBEAE7", border: "1px solid #F0C9C1", font: "500 12.5px Inter", color: "#B23A2A", lineHeight: 1.4 }}>{error}</div>
        )}

        <div style={{ marginTop: 18, textAlign: "center" }}>
          {seconds > 0 ? (
            <span style={{ font: "500 13px Inter", color: "#8A8073" }}>Reenviar código em <strong style={{ font: "700 13px 'Space Mono'", color: "#1A1814" }}>{mmss}</strong></span>
          ) : (
            <button onClick={resend} style={{ all: "unset", cursor: "pointer", font: "700 13px Inter", color: "#B0831F" }}>Reenviar código</button>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingBottom: 6 }}>
          <PrimaryButton disabled={!complete || busy} onClick={verify}>{busy ? "A verificar…" : "Verificar"}</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}
