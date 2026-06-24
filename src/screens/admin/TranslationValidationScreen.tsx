import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader, StatGrid } from "./adminUi";

const LANGS = [
  { name: "Português", pct: 100, missing: 0, rtl: false },
  { name: "English", pct: 100, missing: 0, rtl: false },
  { name: "Kiswahili", pct: 96, missing: 6, rtl: false },
  { name: "Umbundu", pct: 84, missing: 32, rtl: false },
  { name: "Kimbundu", pct: 78, missing: 47, rtl: false },
  { name: "العربية", pct: 93, missing: 11, rtl: true },
];

export function TranslationValidationScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Validação de traduções" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <StatGrid items={[{ v: "13", l: "idiomas", tone: "gold" }, { v: "92%", l: "completude média", tone: "green" }, { v: "128", l: "chaves em falta", tone: "warn" }]} />

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Por idioma</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {LANGS.map((l) => {
            const done = l.missing === 0;
            return (
              <div key={l.name} style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ font: "700 14px Inter", color: DARK.fg }}>
                    {l.name}{l.rtl ? <span style={{ font: "600 9px Inter", color: DARK.muted, marginLeft: 7 }}>· RTL</span> : null}
                  </span>
                  <span style={{ font: "700 12px 'Space Mono'", color: done ? DARK.green : l.pct >= 90 ? DARK.gold : DARK.warn }}>{l.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#14110d", overflow: "hidden", margin: "8px 0" }}>
                  <div style={{ height: "100%", width: `${l.pct}%`, borderRadius: 3, background: done ? DARK.greenDeep : "var(--afl-grad-glow)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ font: "400 11px Inter", color: DARK.muted }}>{done ? "Completo" : `${l.missing} em falta`}</span>
                  {!done && <button style={{ all: "unset", cursor: "pointer", font: "700 11px Inter", color: DARK.gold }}>Auto-traduzir</button>}
                </div>
              </div>
            );
          })}
        </div>

        <button style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D2519" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></svg>
          Traduzir tudo em falta (IA)
        </button>
      </div>
    </PhoneChrome>
  );
}
