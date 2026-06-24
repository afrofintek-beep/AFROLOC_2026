import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { COUNTRIES, totalLevel1 } from "../../data/africaAdmin";
import { DARK, DarkBackHeader } from "../admin/adminUi";

// A few countries shown as "available to import" (Angola is pre-imported).
const AVAILABLE_ISOS = ["CD", "ZA", "MZ", "NG", "KE"];

export function ImportDivisionsScreen() {
  const navigate = useNavigate();
  const [imported, setImported] = useState<Record<string, boolean>>({ AO: true });
  const angola = COUNTRIES.find((c) => c.iso === "AO");
  const available = AVAILABLE_ISOS.map((iso) => COUNTRIES.find((c) => c.iso === iso)).filter(Boolean) as typeof COUNTRIES;

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Importar divisões" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <p style={{ font: "400 12.5px Inter", color: DARK.muted, lineHeight: 1.5, margin: 0 }}>
          Importe a malha administrativa de um país a partir do conjunto continental ({COUNTRIES.length} países ·{" "}
          {totalLevel1().toLocaleString("pt-PT")} unidades nível 1).
        </p>

        {/* Angola — imported */}
        {angola && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#2F7A5722", border: "1px solid #2F7A5744", borderRadius: 14, padding: "13px 15px" }}>
            <span style={{ fontSize: 20 }}>{angola.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ font: "700 14px Inter", color: DARK.fg }}>{angola.pais}</div>
              <div style={{ font: "400 11px Inter", color: DARK.muted, marginTop: 1 }}>província → município → comuna</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "700 10px Inter", color: DARK.green, background: "#2F7A5733", borderRadius: 8, padding: "5px 9px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={DARK.green} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              Importado
            </span>
          </div>
        )}

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Disponíveis para importar</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {available.map((c) => {
            const done = imported[c.iso];
            return (
              <div key={c.iso} style={{ display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "12px 15px" }}>
                <span style={{ fontSize: 20 }}>{c.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 13.5px Inter", color: DARK.fg }}>{c.pais}</div>
                  <div style={{ font: "400 11px Inter", color: DARK.muted, marginTop: 1 }}>{c.nivel1_tipo} · {c.nivel1.length} unidades</div>
                </div>
                <button onClick={() => setImported((m) => ({ ...m, [c.iso]: true }))} disabled={done}
                  style={{ border: done ? "none" : `1.5px solid ${DARK.goldDeep}`, background: done ? "#2F7A5733" : "transparent", color: done ? DARK.green : DARK.gold, font: "700 12px Inter", borderRadius: 11, padding: "8px 14px", cursor: done ? "default" : "pointer" }}>
                  {done ? "Importado" : "Importar"}
                </button>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate("/continentalCoverage")} style={{ border: `1px solid ${DARK.line}`, background: DARK.card, borderRadius: 14, padding: "13px", font: "700 13px Inter", color: DARK.fg, cursor: "pointer" }}>
          Ver cobertura continental
        </button>
      </div>
    </PhoneChrome>
  );
}
