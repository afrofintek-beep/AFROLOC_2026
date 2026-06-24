import { useNavigate } from "react-router-dom";

interface Tab {
  id: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
}

const TABS: Tab[] = [
  { id: "home", label: "Início", icon: homeIcon },
  { id: "addresses", label: "Moradas", icon: listIcon },
  { id: "identitiesMap", label: "Mapa", icon: mapIcon },
  { id: "profile", label: "Perfil", icon: userIcon },
];

/** Bottom tab bar (Início / Moradas / Mapa / Perfil); active item turns gold. */
export function TabBar({ active }: { active: string }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        borderTop: "1px solid #E6DCCC",
        background: "#F8F5F0",
        padding: "8px 8px 4px",
      }}
    >
      {TABS.map((t) => {
        const on = t.id === active;
        const color = on ? "#B0831F" : "#B0A696";
        return (
          <button
            key={t.id}
            onClick={() => navigate("/" + t.id)}
            style={{
              flex: 1,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 0",
              color,
            }}
          >
            {t.icon(on)}
            <span style={{ font: `${on ? 700 : 500} 10px Inter` }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function homeIcon(active: boolean) {
  const c = active ? "#B0831F" : "#B0A696";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}
function listIcon(active: boolean) {
  const c = active ? "#B0831F" : "#B0A696";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6h14M5 12h14M5 18h14" />
    </svg>
  );
}
function mapIcon(active: boolean) {
  const c = active ? "#B0831F" : "#B0A696";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
function userIcon(active: boolean) {
  const c = active ? "#B0831F" : "#B0A696";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  );
}
