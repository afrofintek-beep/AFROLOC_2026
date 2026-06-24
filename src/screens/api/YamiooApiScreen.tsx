import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "../admin/adminUi";

const PERMISSIONS = [
  "Resolver código → coordenadas",
  "Receber pontos de referência",
  "Aceder a dados do titular",
];

export function YamiooApiScreen() {
  const navigate = useNavigate();
  const [reveal, setReveal] = useState(false);
  const [perms, setPerms] = useState<Record<string, boolean>>({ [PERMISSIONS[0]]: true, [PERMISSIONS[1]]: true });

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Yamioo API" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 15px" }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#E8C97A,#D4A853)", color: "#2D2519", display: "flex", alignItems: "center", justifyContent: "center", font: "800 16px Inter", flex: "none" }}>Y</span>
          <div>
            <div style={{ font: "700 15px Inter", color: DARK.fg }}>Yamioo</div>
            <div style={{ font: "400 11.5px Inter", color: DARK.muted, marginTop: 2 }}>Parceiro de entregas &amp; logística</div>
          </div>
        </div>

        <div style={{ font: "700 12px Inter", color: DARK.muted, textTransform: "uppercase", letterSpacing: ".1em" }}>Chave de integração</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f0d0a", border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "12px 14px" }}>
          <span style={{ flex: 1, font: "700 12.5px 'Space Mono'", color: DARK.gold, overflow: "hidden", textOverflow: "ellipsis" }}>
            {reveal ? "ymo_live_8K2pX7Lq93aF4Q9x" : "ymo_live_8K2p••••••••4Q9x"}
          </span>
          <button onClick={() => setReveal((r) => !r)} style={{ border: "none", background: DARK.card, color: DARK.fg, font: "600 11px Inter", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>{reveal ? "Ocultar" : "Revelar"}</button>
        </div>

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Permissões</div>
        <div style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 16, overflow: "hidden" }}>
          {PERMISSIONS.map((p, i) => (
            <div key={p}>
              {i > 0 && <div style={{ height: 1, background: DARK.line, margin: "0 14px" }} />}
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", cursor: "pointer" }}>
                <span style={{ font: "500 12.5px Inter", color: DARK.fg }}>{p}</span>
                <button onClick={() => setPerms((m) => ({ ...m, [p]: !m[p] }))} role="switch" aria-checked={!!perms[p]} style={{ width: 42, height: 25, borderRadius: 13, border: "none", background: perms[p] ? DARK.greenDeep : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
                  <span style={{ position: "absolute", top: 3, left: perms[p] ? 20 : 3, width: 19, height: 19, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
                </button>
              </label>
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: DARK.muted, lineHeight: 1.45, margin: 0 }}>
          <strong style={{ color: DARK.fg }}>28 410</strong> chamadas nos últimos 30 dias · 0 incidentes.
        </p>

        <button onClick={() => navigate("/adminYamiooAgents")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
          Gerir agentes Yamioo
        </button>
      </div>
    </PhoneChrome>
  );
}
