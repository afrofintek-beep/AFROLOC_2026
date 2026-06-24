import { useState } from "react";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { AdminHeader, AdminTabBar, Avatar, DARK, StatGrid } from "./adminUi";

type Role = "Admin" | "Validador" | "Operador" | "Cidadão";

const USERS: { initials: string; name: string; role: Role; detail: string }[] = [
  { initials: "AC", name: "Ana Cardoso", role: "Admin", detail: "Admin · Nível 3 · Belas" },
  { initials: "CN", name: "Carlos Nguvu", role: "Validador", detail: "Validador Regional · Quenguela" },
  { initials: "JB", name: "João Bunga", role: "Operador", detail: "Operador de campo · Catete" },
  { initials: "MS", name: "Maria Sousa", role: "Cidadão", detail: "Cidadã · 2 moradas" },
  { initials: "TM", name: "Tomás Munga", role: "Cidadão", detail: "Cidadão · testemunha Prata" },
];

const FILTERS = ["Todos", "Admins", "Validadores"];

export function UsersScreen() {
  const [filter, setFilter] = useState("Todos");
  const items = USERS.filter((u) =>
    filter === "Admins" ? u.role === "Admin" : filter === "Validadores" ? u.role === "Validador" : true,
  );

  return (
    <PhoneChrome bg={DARK.bg} dark tabBar={<AdminTabBar active="users" />}>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <AdminHeader kicker="JURISDIÇÃO · BELAS" title="Utilizadores" />

        <StatGrid items={[{ v: "1 284", l: "Total", tone: "fg" }, { v: "18", l: "Admins", tone: "gold" }, { v: "24", l: "Validadores", tone: "green" }]} />

        <div style={{ display: "flex", gap: 8 }}>
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ border: on ? "none" : `1.5px solid ${DARK.line}`, background: on ? "var(--afl-grad-glow)" : "transparent", color: on ? "#2D2519" : DARK.muted, borderRadius: 18, padding: "7px 14px", font: `${on ? 700 : 600} 12px Inter`, cursor: "pointer" }}>{f}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {items.map((u) => (
            <div key={u.initials} style={{ display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "11px 14px" }}>
              <Avatar initials={u.initials} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 13.5px Inter", color: DARK.fg }}>{u.name}</div>
                <div style={{ font: "400 11.5px Inter", color: DARK.muted, marginTop: 1 }}>{u.detail}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </div>
          ))}
        </div>

        <button style={{ border: `1.5px dashed ${DARK.goldDeep}`, background: "transparent", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: DARK.gold, cursor: "pointer" }}>
          + Criar subordinado · Nível 2
        </button>
      </div>
    </PhoneChrome>
  );
}
