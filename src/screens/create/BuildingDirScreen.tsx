import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { useCreateFlow } from "../../state/createFlow";

interface Unit { label: string; state: "ok" | "mine" | "empty" | "use" }

const FLOORS: { floor: string; units: Unit[] }[] = [
  { floor: "P6", units: [u("01"), u("02"), u("03"), u("04")] },
  { floor: "P5", units: [u("01"), u("02"), u("03"), u("04")] },
  { floor: "P4", units: [u("01"), u("02"), u("03"), { label: "04", state: "mine" }] },
  { floor: "P3", units: [u("01"), u("02"), u("03"), { label: "vazia", state: "empty" }] },
  { floor: "R/C", units: [{ label: "Comércio", state: "use" }, { label: "Entrada", state: "use" }] },
];

function u(label: string): Unit {
  return { label, state: "ok" };
}

export function BuildingDirScreen() {
  const navigate = useNavigate();
  const { draft } = useCreateFlow();
  const bloco = draft.building?.bloco ?? "B";

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Edifício</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#1A1814", borderRadius: 16, padding: "14px 16px", color: "#F8F5F0" }}>
          <div style={{ font: "700 16px 'Space Mono'", color: "#E8C97A" }}>AO-ZU-G10-X6AUQ-Y49HV</div>
          <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 3 }}>1 ponto GPS · 24 moradas</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {[{ v: "24", l: "frações" }, { v: "6", l: "pisos" }, { v: "88%", l: "verificadas" }].map((s) => (
            <div key={s.l} style={{ flex: 1, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ font: "700 18px 'Space Mono'", color: "#1A1814" }}>{s.v}</div>
              <div style={{ font: "500 10.5px Inter", color: "#8A8073", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ font: "700 13px Inter", color: "#1A1814" }}>Frações por piso · Bloco {bloco}</div>
        <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "6px 14px" }}>
          {FLOORS.map((f, i) => (
            <div key={f.floor} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? "1px solid #EFE7DA" : "none" }}>
              <span style={{ width: 34, flex: "none", font: "700 12px 'Space Mono'", color: "#8A8073" }}>{f.floor}</span>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {f.units.map((un, j) => <UnitChip key={j} u={un} />)}
              </div>
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Cada fração tem a sua própria AFROLOC, testemunhas e ciclo de verificação.
        </p>
      </div>
    </PhoneChrome>
  );
}

function UnitChip({ u }: { u: Unit }) {
  const styles: Record<Unit["state"], { bg: string; fg: string; border: string }> = {
    ok: { bg: "#F0EADE", fg: "#5C5347", border: "transparent" },
    mine: { bg: "#FBF2DC", fg: "#B0831F", border: "1.5px solid #D4A853" },
    empty: { bg: "transparent", fg: "#A99E8C", border: "1.5px dashed #E6DCCC" },
    use: { bg: "#EBF1ED", fg: "#2F7A57", border: "transparent" },
  };
  const s = styles[u.state];
  return (
    <span style={{ font: "700 11px 'Space Mono'", color: s.fg, background: s.bg, border: s.border, borderRadius: 8, padding: "6px 9px", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {u.label}{u.state === "mine" ? <span style={{ color: "#D4A853" }}>★</span> : null}
    </span>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
