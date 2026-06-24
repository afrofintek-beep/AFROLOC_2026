import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";

export function OtpScreen() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["3", "0", "7", "", "", ""]);
  const [seconds, setSeconds] = useState(42);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const complete = digits.every((d) => d !== "");

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, j) => (j === i ? c : x)));
    if (c && i < 5) refs.current[i + 1]?.focus();
  }

  const mmss = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <PhoneChrome>
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={1} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "20px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>Confirme o seu número</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          Enviámos um código de 6 dígitos por SMS para <strong style={{ color: "#1A1814" }}>+244 923 ··· 030</strong>
        </p>

        <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 7, background: "#EBF1ED", borderRadius: 20, padding: "6px 12px", marginTop: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F7A57" }} />
          <span style={{ font: "600 11.5px Inter", color: "#2F7A57" }}>Operadora detectada · Unitel · Angola</span>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 22 }}>
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

        <div style={{ marginTop: 18, textAlign: "center" }}>
          {seconds > 0 ? (
            <span style={{ font: "500 13px Inter", color: "#8A8073" }}>Reenviar código em <strong style={{ font: "700 13px 'Space Mono'", color: "#1A1814" }}>{mmss}</strong></span>
          ) : (
            <button onClick={() => setSeconds(42)} style={{ all: "unset", cursor: "pointer", font: "700 13px Inter", color: "#B0831F" }}>Reenviar código</button>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingBottom: 6, display: "flex", flexDirection: "column", gap: 12 }}>
          <PrimaryButton disabled={!complete} onClick={() => navigate("/home")}>Verificar</PrimaryButton>
          <button onClick={() => navigate("/home")} style={{ all: "unset", cursor: "pointer", textAlign: "center", font: "600 13px Inter", color: "#8A8073", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11c2 0 3-1.5 3-4s-1-4-3-4-3 1.5-3 4M7 12c0-1 .5-2 1.5-2.5M5 16c0-2 1-3 2-3.5M9 21c-1-1.5-1.5-3-1.5-5M13 21c1.5-2 2-4 2-7" /></svg>
            Ou entre com a impressão digital
          </button>
        </div>
      </div>
    </PhoneChrome>
  );
}
