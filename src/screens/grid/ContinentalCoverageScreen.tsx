import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { COUNTRIES, totalLevel1 } from "../../data/africaAdmin";
import { DARK, DarkBackHeader } from "../admin/adminUi";

export function ContinentalCoverageScreen() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const list = q ? COUNTRIES.filter((c) => c.pais.toLowerCase().includes(q.toLowerCase())) : COUNTRIES;

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Cobertura continental" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 0", display: "flex", flexDirection: "column", gap: 12, color: DARK.fg, flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { v: String(COUNTRIES.length), l: "países" },
            { v: totalLevel1().toLocaleString("pt-PT"), l: "unidades nível 1" },
            { v: "193", l: "línguas" },
          ].map((s) => (
            <div key={s.l} style={{ flex: 1, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ font: "800 19px 'Space Mono'", color: DARK.gold }}>{s.v}</div>
              <div style={{ font: "500 10px Inter", color: DARK.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar país…"
          style={{ height: 40, borderRadius: 12, border: `1px solid ${DARK.line}`, background: DARK.card, padding: "0 12px", font: "500 13px Inter", color: DARK.fg, outline: "none" }} />

        <div style={{ font: "700 12px Inter", color: DARK.fg }}>Países &amp; nível 1</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", paddingBottom: 12 }}>
          {list.map((c) => (
            <div key={c.iso} style={{ display: "flex", alignItems: "center", gap: 11, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 11, padding: "10px 13px" }}>
              <span style={{ fontSize: 18 }}>{c.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 12.5px Inter", color: DARK.fg }}>{c.pais}</div>
                <div style={{ font: "400 10.5px Inter", color: DARK.muted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.nivel1_tipo} · {c.linguas_oficiais[0]}
                </div>
              </div>
              <span style={{ font: "700 13px 'Space Mono'", color: DARK.gold }}>{c.nivel1.length}</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneChrome>
  );
}
