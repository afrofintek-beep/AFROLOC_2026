import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "../admin/adminUi";

const FORMATS = [
  { id: "pdf", label: "PDF", sub: "relatório" },
  { id: "csv", label: "CSV", sub: "dados" },
  { id: "api", label: "API JSON", sub: "integração" },
];

const INCLUDES = [
  "Cobertura por província",
  "Taxa de verificação",
  "Métricas de fraude",
  "Desempenho de validadores",
  "Dados pessoais (anonimizado)",
];

export function KpisExportScreen() {
  const navigate = useNavigate();
  const [fmt, setFmt] = useState("pdf");
  const [inc, setInc] = useState<Record<string, boolean>>({ "Cobertura por província": true, "Taxa de verificação": true, "Métricas de fraude": true });
  const [done, setDone] = useState(false);

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Exportar KPIs" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <div style={{ font: "700 12px Inter", color: DARK.muted, textTransform: "uppercase", letterSpacing: ".1em" }}>Formato</div>
        <div style={{ display: "flex", gap: 9 }}>
          {FORMATS.map((f) => {
            const on = fmt === f.id;
            return (
              <button key={f.id} onClick={() => { setFmt(f.id); setDone(false); }} style={{ flex: 1, border: on ? "2px solid #D4A853" : `1.5px solid ${DARK.line}`, background: on ? "#332B1E" : DARK.card, borderRadius: 14, padding: "13px 6px", cursor: "pointer", color: DARK.fg }}>
                <div style={{ font: "700 13px Inter", color: on ? DARK.gold : DARK.fg }}>{f.label}</div>
                <div style={{ font: "400 10px Inter", color: DARK.muted, marginTop: 2 }}>{f.sub}</div>
              </button>
            );
          })}
        </div>

        <div style={{ font: "700 12px Inter", color: DARK.muted, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 2 }}>Incluir</div>
        <div style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 16, overflow: "hidden" }}>
          {INCLUDES.map((label, i) => (
            <div key={label}>
              {i > 0 && <div style={{ height: 1, background: DARK.line, margin: "0 14px" }} />}
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", cursor: "pointer" }}>
                <span style={{ font: "500 13px Inter", color: DARK.fg }}>{label}</span>
                <button onClick={() => { setInc((m) => ({ ...m, [label]: !m[label] })); setDone(false); }} role="switch" aria-checked={!!inc[label]}
                  style={{ width: 42, height: 25, borderRadius: 13, border: "none", background: inc[label] ? DARK.greenDeep : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
                  <span style={{ position: "absolute", top: 3, left: inc[label] ? 20 : 3, width: 19, height: 19, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
                </button>
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "13px 15px" }}>
          <span style={{ font: "500 11px Inter", color: DARK.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Período</span>
          <span style={{ font: "700 13px Inter", color: DARK.fg }}>1 Jan – 30 Jun 2026</span>
        </div>

        {done && <div style={{ font: "600 12px Inter", color: DARK.green, textAlign: "center" }}>Exportação {fmt.toUpperCase()} gerada</div>}

        <button onClick={() => setDone(true)} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
          {done ? "Exportação gerada" : "Gerar exportação"}
        </button>
      </div>
    </PhoneChrome>
  );
}
