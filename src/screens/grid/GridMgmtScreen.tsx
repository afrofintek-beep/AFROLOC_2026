import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { URBAN_CELL_SIZE, RURAL_CELL_SIZE } from "../../lib/afroloc/sdk";
import { countryByIso } from "../../data/africaAdmin";
import { DARK, DarkBackHeader } from "../admin/adminUi";

export function GridMgmtScreen() {
  const navigate = useNavigate();
  const provinces = countryByIso("AO")?.nivel1 ?? [];
  const [province, setProvince] = useState("Luanda");
  const [useUrban, setUseUrban] = useState(true);
  const [gen, setGen] = useState(false);

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Grelha QGSQ" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        {/* headline */}
        <div style={{ background: "var(--afl-grad-hero)", borderRadius: 18, padding: 18 }}>
          <div style={{ font: "800 32px 'Space Mono'", color: DARK.gold }}>2.1 M</div>
          <div style={{ font: "500 12px Inter", color: DARK.muted, marginTop: 4 }}>células geradas</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
            <div style={{ font: "800 18px 'Space Mono'", color: DARK.fg }}>{URBAN_CELL_SIZE}×{URBAN_CELL_SIZE}</div>
            <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>urbana (m)</div>
          </div>
          <div style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
            <div style={{ font: "800 18px 'Space Mono'", color: DARK.fg }}>{RURAL_CELL_SIZE}×{RURAL_CELL_SIZE}</div>
            <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>rural (m)</div>
          </div>
        </div>

        <div style={{ font: "700 13px Inter", color: DARK.fg, marginTop: 2 }}>Gerar células</div>

        {/* province select */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "13px 15px" }}>
            <span><span style={{ font: "500 10px Inter", color: DARK.muted, display: "block", textTransform: "uppercase", letterSpacing: ".04em" }}>Província</span><span style={{ font: "700 14px Inter", color: DARK.fg }}>{province}</span></span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={DARK.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <select value={province} onChange={(e) => setProvince(e.target.value)} aria-label="Província" style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", cursor: "pointer" }}>
            {provinces.map((p) => (<option key={p.codigo} value={p.nome}>{p.nome}</option>))}
          </select>
        </div>

        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "13px 15px", cursor: "pointer" }}>
          <span style={{ font: "600 13px Inter", color: DARK.fg }}>Usar zonas urbanas importadas</span>
          <button onClick={() => setUseUrban((v) => !v)} role="switch" aria-checked={useUrban} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: useUrban ? DARK.greenDeep : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
            <span style={{ position: "absolute", top: 3, left: useUrban ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
          </button>
        </label>

        {gen && <div style={{ font: "600 12px Inter", color: DARK.green, textAlign: "center" }}>Grelha de {province} gerada · células {URBAN_CELL_SIZE}/{RURAL_CELL_SIZE} m</div>}

        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <button onClick={() => setGen(true)} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
            {gen ? "Grelha gerada" : `Gerar grelha para ${province}`}
          </button>
        </div>
      </div>
    </PhoneChrome>
  );
}
