import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const CAPTURED = [
  { code: "AO-ZU-G10-X6AUR-Y49HV", detail: "Informal · 3 fotos", ok: true },
  { code: "AO-ZU-G10-X6AUS-Y49HV", detail: "Informal · 2 fotos", ok: true },
  { code: "AO-ZU-G10-X6AUT-Y49HV", detail: "Digital · GPS ±5m", ok: true },
];

const DONE = 42;
const TARGET = 50;
const PENDING = 8;

export function OperatorScreen() {
  const navigate = useNavigate();
  const pct = Math.round((DONE / TARGET) * 100);

  return (
    <PhoneChrome bg="#1A1814" dark offline>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: "#F8F5F0" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#A99E8C" }}>OPERADOR DE CAMPO</div>
            <div style={{ font: "700 20px Inter", marginTop: 4 }}>Lote · Catete</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#262019", color: "#E8C97A", display: "flex", alignItems: "center", justifyContent: "center", font: "700 14px Inter", border: "1px solid #3A332D" }}>
            JB
          </div>
        </div>

        {/* progress */}
        <div style={{ background: "#262019", borderRadius: 18, padding: 18, border: "1px solid #3A332D" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ font: "700 28px 'Space Mono'", color: "#E8C97A" }}>{DONE}</span>
            <span style={{ font: "500 14px 'Space Mono'", color: "#A99E8C" }}>/ {TARGET}</span>
            <span style={{ font: "500 12px Inter", color: "#A99E8C", marginLeft: 4 }}>registos offline</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#1A1814", overflow: "hidden", marginTop: 12 }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: "var(--afl-grad-glow)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#D99A3A" }} />
            <span style={{ font: "500 12px Inter", color: "#D99A3A" }}>{PENDING} por sincronizar quando houver rede</span>
          </div>
        </div>

        {/* captured */}
        <div>
          <div style={{ font: "700 13px Inter", color: "#F8F5F0", marginBottom: 10 }}>Capturados</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CAPTURED.map((c) => (
              <div key={c.code} style={{ display: "flex", alignItems: "center", gap: 12, background: "#262019", border: "1px solid #3A332D", borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", flex: "none", background: "#5BC48E" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ font: "700 14px 'Space Mono'", color: "#F8F5F0" }}>{c.code}</div>
                  <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 2 }}>{c.detail}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99E8C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* capture button */}
        <button
          onClick={() => navigate("/type")}
          style={{ border: "none", width: "100%", height: 58, borderRadius: 16, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 12px 24px -10px rgba(212,168,83,.5)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D2519" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
            <circle cx="12" cy="13" r="3.4" />
          </svg>
          Capturar nova morada
        </button>
      </div>
    </PhoneChrome>
  );
}
