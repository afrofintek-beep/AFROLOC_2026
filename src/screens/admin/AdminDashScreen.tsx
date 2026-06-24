import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { AdminHeader, AdminTabBar, DARK, StatGrid } from "./adminUi";

const WEEK = [62, 70, 58, 81, 74, 92];

const BATCHES = [
  { title: "Operador · Comuna de Catete", meta: "42 moradas · há 1h", to: "/aflRequests" },
  { title: "Novo admin · Comuna do Quenguela", meta: "Nível 2 · pendente", to: "/roleApprovals" },
];

export function AdminDashScreen() {
  const navigate = useNavigate();
  const max = Math.max(...WEEK);

  return (
    <PhoneChrome bg={DARK.bg} dark tabBar={<AdminTabBar active="adminDash" />}>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <AdminHeader kicker="PAINEL ADMINISTRATIVO" title="Município de Belas" sub="Nível 3 · Administrador Municipal" avatar="AC" />

        <StatGrid
          items={[
            { v: "8 420", l: "Moradas activas", tone: "gold" },
            { v: "312", l: "Pendentes", tone: "warn" },
            { v: "24", l: "Validadores activos", tone: "fg" },
            { v: "0.4 %", l: "Taxa de fraude", tone: "green" },
          ]}
        />

        {/* weekly chart */}
        <div style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ font: "700 13px Inter", color: DARK.fg }}>Validações por semana</span>
            <span style={{ font: "700 11px Inter", color: DARK.green, background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 8, padding: "3px 8px" }}>+18%</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 76, marginTop: 14 }}>
            {WEEK.map((v, i) => (
              <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", height: `${(v / max) * 100}%`, borderRadius: 5, background: "var(--afl-grad-glow)", minHeight: 4 }} />
                <span style={{ font: "600 9px 'Space Mono'", color: DARK.muted }}>S{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* batches */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ font: "700 14px Inter", color: DARK.fg }}>Lotes a aprovar</span>
            <button onClick={() => navigate("/aflRequests")} style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: DARK.gold }}>Ver todos</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {BATCHES.map((b) => (
              <div key={b.title} style={{ display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 13px Inter", color: DARK.fg }}>{b.title}</div>
                  <div style={{ font: "400 12px Inter", color: DARK.muted, marginTop: 2 }}>{b.meta}</div>
                </div>
                <button onClick={() => navigate(b.to)} style={{ border: "none", background: "var(--afl-grad-glow)", color: "#2D2519", font: "700 12px Inter", borderRadius: 10, padding: "8px 14px", cursor: "pointer" }}>Rever</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
}
