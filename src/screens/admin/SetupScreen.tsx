import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { AdminTabBar, DARK } from "./adminUi";

export function SetupScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark tabBar={<AdminTabBar active="setup" variant="system" />}>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ font: "700 20px Inter", color: DARK.fg }}>Configuração</span>
          <span style={{ font: "700 10px Inter", letterSpacing: ".08em", color: "#2D2519", background: "var(--afl-grad-glow)", borderRadius: 7, padding: "4px 9px" }}>NÍVEL 5</span>
        </div>

        {/* divisions */}
        <Section title="Divisões administrativas" action="Editar" onAction={() => navigate("/regionalMgmt")}>
          <Row k="Angola" v="Nível 5" />
          <Div />
          <Row k="Luanda" v="21 prov." />
          <Div />
          <Row k="Belas" v="município" />
          <div style={{ font: "400 11.5px Inter", color: DARK.muted, marginTop: 8 }}>Catete · Quenguela · Ramiros</div>
        </Section>

        {/* validation numbers */}
        <Section title="Números de validação regional">
          <Row k="+244 900 000 001" v="Belas · Carlos Nguvu" mono />
          <Div />
          <Row k="+244 900 000 002" v="Quenguela · por atribuir" mono warn />
        </Section>

        {/* cycles */}
        <Section title="Ciclos de verificação">
          <Row k="6 m" v="Endereço completo" />
          <Div />
          <Row k="3 m" v="Incompleto / informal" />
        </Section>
      </div>
    </PhoneChrome>
  );
}

function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ font: "700 13px Inter", color: DARK.fg }}>{title}</span>
        {action && <button onClick={onAction} style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: DARK.gold }}>{action}</button>}
      </div>
      <div style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "4px 15px" }}>{children}</div>
    </div>
  );
}

function Row({ k, v, mono, warn }: { k: string; v: string; mono?: boolean; warn?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "11px 0", gap: 12 }}>
      <span style={{ font: `700 13px ${mono ? "'Space Mono'" : "Inter"}`, color: DARK.fg }}>{k}</span>
      <span style={{ font: "500 12px Inter", color: warn ? DARK.warn : DARK.muted, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Div() {
  return <div style={{ height: 1, background: DARK.line }} />;
}
