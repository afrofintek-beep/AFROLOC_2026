import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader, StatGrid } from "../admin/adminUi";

const CRITERIA = [
  { label: "Cobertura nacional", pct: 72, threshold: 75 },
  { label: "Taxa de verificação no prazo", pct: 94, threshold: 80 },
  { label: "Precisão GPS (≤10m)", pct: 88, threshold: 80 },
  { label: "Validação comunitária", pct: 91, threshold: 85 },
  { label: "Resolução de fraude", pct: 97, threshold: 90 },
];

export function CertificationKpisScreen() {
  const navigate = useNavigate();
  const above = CRITERIA.filter((c) => c.pct >= c.threshold).length;

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="KPIs de certificação" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <StatGrid items={[{ v: "428 K", l: "moradas ativas", tone: "gold" }, { v: "86", l: "ATS médio", tone: "green" }, { v: "94%", l: "verificadas", tone: "fg" }]} />

        <div style={{ font: "700 14px Inter", color: DARK.fg }}>Critérios de certificação</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {CRITERIA.map((c) => {
            const ok = c.pct >= c.threshold;
            return (
              <div key={c.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ font: "600 12.5px Inter", color: DARK.fg }}>{c.label}</span>
                  <span style={{ font: "700 12px 'Space Mono'", color: ok ? DARK.green : DARK.warn }}>{c.pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#14110d", overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "100%", width: `${c.pct}%`, borderRadius: 4, background: ok ? DARK.greenDeep : DARK.warn }} />
                  <div style={{ position: "absolute", top: -2, bottom: -2, left: `${c.threshold}%`, width: 2, background: DARK.muted }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#2F7A5722", border: "1px solid #2F7A5744", borderRadius: 14, padding: "13px 15px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DARK.green} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
          <div>
            <div style={{ font: "700 13px Inter", color: "#9fd9bb" }}>Elegível para certificação</div>
            <div style={{ font: "400 11.5px Inter", color: DARK.muted, marginTop: 2 }}>{above} de {CRITERIA.length} critérios acima do limiar</div>
          </div>
        </div>

        <button onClick={() => navigate("/kpisExport")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
          Exportar relatório
        </button>
      </div>
    </PhoneChrome>
  );
}
