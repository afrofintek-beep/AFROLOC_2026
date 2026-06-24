import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "./adminUi";

const BACKUP = ["4F2X-9K1P", "7B3M-Q04T", "1H9D-30PA", "5T2W-88KB"];

export function Admin2faScreen() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["4", "8", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const complete = digits.every((d) => d !== "");

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, j) => (j === i ? c : x)));
    if (c && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Verificação em duas etapas" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <p style={{ font: "400 13.5px Inter", color: DARK.muted, lineHeight: 1.5, margin: 0 }}>
          Acesso administrativo exige 2FA. Introduza o código enviado para <strong style={{ color: DARK.fg }}>+244 923 ··· 030</strong>.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 4 }}>
          {digits.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} onChange={(e) => setDigit(i, e.target.value)} inputMode="numeric" maxLength={1}
              style={{ width: 46, height: 58, textAlign: "center", borderRadius: 13, border: d ? "1.5px solid #D4A853" : "1px solid #3A332D", background: d ? "#332B1E" : "#262019", font: "700 22px 'Space Mono'", color: "#F8F5F0", outline: "none" }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ font: "700 13px Inter", color: DARK.fg }}>Códigos de backup</span>
          <button style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: DARK.gold }}>Gerar novos</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {BACKUP.map((c) => (
            <div key={c} style={{ background: "#0f0d0a", border: `1px solid ${DARK.line}`, borderRadius: 11, padding: "12px 14px", font: "700 14px 'Space Mono'", color: DARK.gold, textAlign: "center" }}>{c}</div>
          ))}
        </div>
        <p style={{ font: "400 11.5px Inter", color: DARK.muted, lineHeight: 1.45, margin: 0 }}>
          Guarde-os em local seguro. Cada código serve uma vez.
        </p>

        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <button disabled={!complete} onClick={() => navigate("/adminDash")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: complete ? "linear-gradient(135deg,#D4A853,#E07B2C)" : DARK.line, color: complete ? "#2D2519" : DARK.muted, font: "700 15px Inter", cursor: complete ? "pointer" : "not-allowed" }}>
            Verificar
          </button>
        </div>
      </div>
    </PhoneChrome>
  );
}
