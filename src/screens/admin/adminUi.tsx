import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export const DARK = {
  bg: "#1A1814",
  card: "#262019",
  line: "#3A332D",
  gold: "#E8C97A",
  goldDeep: "#D4A853",
  muted: "#A99E8C",
  fg: "#F8F5F0",
  green: "#5BC48E",
  greenDeep: "#2F7A57",
  warn: "#D99A3A",
  danger: "#D14B3A",
} as const;

const BASE_TABS = [
  { id: "adminDash", label: "Painel", icon: gridIcon },
  { id: "users", label: "Utilizadores", icon: usersIcon },
  { id: "reports", label: "Relatórios", icon: reportIcon },
];

/**
 * Dark admin bottom tab bar. The 4th item is "Segurança" by default, or
 * "Sistema" (→ setup) in the system-config section.
 */
export function AdminTabBar({ active, variant = "security" }: { active: string; variant?: "security" | "system" }) {
  const navigate = useNavigate();
  const TABS = [
    ...BASE_TABS,
    variant === "system"
      ? { id: "setup", label: "Sistema", icon: shieldIcon }
      : { id: "security", label: "Segurança", icon: shieldIcon },
  ];
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${DARK.line}`, background: "#14110d", padding: "8px 8px 4px" }}>
      {TABS.map((t) => {
        const on = t.id === active;
        const c = on ? DARK.gold : "#6b6358";
        return (
          <button key={t.id} onClick={() => navigate("/" + t.id)} style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", color: c }}>
            {t.icon(c)}
            <span style={{ font: `${on ? 700 : 500} 10px Inter` }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Dark console header: kicker + title + avatar. */
export function AdminHeader({ kicker, title, sub, avatar }: { kicker: string; title: string; sub?: string; avatar?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: DARK.muted }}>{kicker}</div>
        <div style={{ font: "700 20px Inter", color: DARK.fg, marginTop: 4 }}>{title}</div>
        {sub && <div style={{ font: "400 12px Inter", color: DARK.muted, marginTop: 3 }}>{sub}</div>}
      </div>
      {avatar && (
        <span style={{ width: 42, height: 42, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", display: "flex", alignItems: "center", justifyContent: "center", font: "700 14px Inter" }}>{avatar}</span>
      )}
    </div>
  );
}

export function StatGrid({ items }: { items: { v: string; l: string; tone?: keyof typeof DARK }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {items.map((s) => (
        <div key={s.l} style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 14px" }}>
          <div style={{ font: "800 22px 'Space Mono'", color: s.tone ? (DARK[s.tone] as string) : DARK.gold }}>{s.v}</div>
          <div style={{ font: "500 11px Inter", color: DARK.muted, marginTop: 2 }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

export function DarkBackHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <button onClick={onBack} aria-label="Voltar" style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${DARK.line}`, background: DARK.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={DARK.fg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <span style={{ font: "700 16px Inter", color: DARK.fg }}>{title}</span>
      <span style={{ minWidth: 38, display: "flex", justifyContent: "flex-end" }}>{right}</span>
    </div>
  );
}

export function Avatar({ initials }: { initials: string }) {
  return <span style={{ width: 38, height: 38, borderRadius: "50%", flex: "none", background: DARK.card, border: `1px solid ${DARK.line}`, color: DARK.gold, display: "flex", alignItems: "center", justifyContent: "center", font: "700 12px Inter" }}>{initials}</span>;
}

export const SEV = {
  "CRÍTICO": { fg: DARK.danger, bg: "#D14B3A22" },
  "ELEVADO": { fg: DARK.warn, bg: "#D99A3A22" },
  "MÉDIO": { fg: DARK.warn, bg: "#D99A3A22" },
} as const;

function gridIcon(c: string) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>; }
function usersIcon(c: string) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 6.5a3 3 0 0 1 0 5.5M18 19c0-2-.8-3.6-2-4.6" /></svg>; }
function reportIcon(c: string) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14H6z" /><path d="M9 13v4M12 11v6M15 14v3" /></svg>; }
function shieldIcon(c: string) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>; }
