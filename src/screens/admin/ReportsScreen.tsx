import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { AdminTabBar, DARK, StatGrid } from "./adminUi";

const BY_COMUNA = [
  { name: "Catete", n: 1200 },
  { name: "Quenguela", n: 842 },
  { name: "Belas Sede", n: 631 },
  { name: "Ramiros", n: 467 },
];

export function ReportsScreen() {
  const max = Math.max(...BY_COMUNA.map((b) => b.n));
  return (
    <PhoneChrome bg={DARK.bg} dark tabBar={<AdminTabBar active="reports" />}>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ font: "700 20px Inter", color: DARK.fg }}>Relatórios</span>
          <span style={{ font: "500 12px Inter", color: DARK.muted }}>Últimos 30 dias</span>
        </div>

        <StatGrid items={[{ v: "91%", l: "aprovação", tone: "green" }, { v: "3 142", l: "validações", tone: "gold" }]} />
        <div style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
          <div style={{ font: "800 22px 'Space Mono'", color: DARK.fg }}>2.4h</div>
          <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>tempo médio de decisão</div>
        </div>

        <div style={{ font: "700 14px Inter", color: DARK.fg }}>Validações por comuna</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {BY_COMUNA.map((b) => (
            <div key={b.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ font: "600 12.5px Inter", color: DARK.fg }}>{b.name}</span>
                <span style={{ font: "700 12px 'Space Mono'", color: DARK.gold }}>{b.n >= 1000 ? (b.n / 1000).toFixed(1).replace(".", ",") + "k" : b.n}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "#14110d", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(b.n / max) * 100}%`, borderRadius: 4, background: "var(--afl-grad-glow)" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ flex: "none", font: "600 12px Inter", color: DARK.muted, alignSelf: "center" }}>Exportar relatório</span>
          <button style={{ flex: 1, border: `1.5px solid ${DARK.line}`, background: DARK.card, color: DARK.fg, borderRadius: 11, height: 42, font: "700 12px Inter", cursor: "pointer" }}>PDF</button>
          <button style={{ flex: 1, border: `1.5px solid ${DARK.line}`, background: DARK.card, color: DARK.fg, borderRadius: 11, height: 42, font: "700 12px Inter", cursor: "pointer" }}>Excel</button>
        </div>
      </div>
    </PhoneChrome>
  );
}
