import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { URBAN_CELL_SIZE, RURAL_CELL_SIZE } from "../../lib/afroloc/sdk";
import { DARK, DarkBackHeader } from "../admin/adminUi";

export function ImportUrbanZonesScreen() {
  const navigate = useNavigate();
  const pct = 68;
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Importar zonas urbanas" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <p style={{ font: "400 12.5px Inter", color: DARK.muted, lineHeight: 1.5, margin: 0 }}>
          Carregue polígonos de zonas urbanas (GeoJSON) para definir onde a grelha QGSQ usa células de
          {" "}{URBAN_CELL_SIZE}×{URBAN_CELL_SIZE}&nbsp;m em vez de {RURAL_CELL_SIZE}×{RURAL_CELL_SIZE}&nbsp;m.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 11, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "12px 14px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK.gold} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></svg>
          <div style={{ flex: 1 }}>
            <div style={{ font: "600 12.5px Inter", color: DARK.fg }}>zonas_urbanas_luanda.geojson</div>
            <div style={{ font: "400 11px Inter", color: DARK.muted, marginTop: 1 }}>3,8 MB · 412 polígonos</div>
          </div>
        </div>

        <div style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ font: "700 13px Inter", color: DARK.fg }}>A processar</span>
            <span style={{ font: "700 13px 'Space Mono'", color: DARK.gold }}>{pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#14110d", overflow: "hidden", margin: "10px 0 14px" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: "var(--afl-grad-glow)" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { v: "280", l: "validados", c: DARK.green },
              { v: "9", l: "a rever", c: DARK.warn },
              { v: "123", l: "na fila", c: DARK.muted },
            ].map((s) => (
              <div key={s.l} style={{ flex: 1, textAlign: "center", background: "#14110d", borderRadius: 11, padding: "10px 4px" }}>
                <div style={{ font: "700 16px 'Space Mono'", color: s.c }}>{s.v}</div>
                <div style={{ font: "500 10px Inter", color: DARK.muted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 9, alignItems: "center", background: "#2F7A5722", border: "1px solid #2F7A5744", borderRadius: 12, padding: "11px 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={DARK.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
          <span style={{ font: "500 12px Inter", color: "#9fd9bb" }}>Belas e Catete reclassificados como urbanos ({URBAN_CELL_SIZE}×{URBAN_CELL_SIZE}&nbsp;m).</span>
        </div>

        <button onClick={() => navigate("/gridMgmt")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
          Aplicar à grelha QGSQ
        </button>
      </div>
    </PhoneChrome>
  );
}
