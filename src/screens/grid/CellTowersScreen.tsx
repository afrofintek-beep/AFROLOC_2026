import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "../admin/adminUi";

const TOWERS = [
  { cid: "CID 6313-0241", info: "Unitel · Belas", dbm: -68, dist: "240 m" },
  { cid: "CID 6313-0188", info: "Unitel · Belas", dbm: -74, dist: "510 m" },
  { cid: "CID 6314-9920", info: "Movicel · Catete", dbm: -81, dist: "870 m" },
];

export function CellTowersScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Antenas (Cell Towers)" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        {/* triangulation card */}
        <div style={{ background: "var(--afl-grad-hero)", border: `1px solid ${DARK.line}`, borderRadius: 18, padding: 18, position: "relative", overflow: "hidden", height: 150 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
          {/* towers */}
          {[
            { x: "22%", y: "30%" },
            { x: "74%", y: "26%" },
            { x: "58%", y: "74%" },
          ].map((p, i) => (
            <div key={i} style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%,-50%)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5BC48E", boxShadow: "0 0 0 6px #5BC48E22" }} />
            </div>
          ))}
          {/* estimated point */}
          <div style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%,-50%)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px dashed #E8C97A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#E8C97A" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 14, bottom: 12, font: "700 11px 'Space Mono'", color: "#E8C97A" }}>3 antenas · ponto estimado ±38m</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
            <div style={{ font: "800 20px 'Space Mono'", color: DARK.gold }}>9 412</div>
            <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>antenas Unitel</div>
          </div>
          <div style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
            <div style={{ font: "800 20px 'Space Mono'", color: DARK.fg }}>±38 m</div>
            <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>precisão média</div>
          </div>
        </div>

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Antenas próximas</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TOWERS.map((t) => (
            <div key={t.cid} style={{ display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "11px 14px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 12.5px 'Space Mono'", color: DARK.fg }}>{t.cid}</div>
                <div style={{ font: "400 11px Inter", color: DARK.muted, marginTop: 2 }}>{t.info} · {t.dbm} dBm</div>
              </div>
              <span style={{ font: "700 12px 'Space Mono'", color: DARK.gold }}>{t.dist}</span>
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: DARK.muted, lineHeight: 1.5, margin: 0 }}>
          A triangulação reforça o GPS e deteta spoofing quando a posição não bate com as antenas servidoras.
        </p>
      </div>
    </PhoneChrome>
  );
}
