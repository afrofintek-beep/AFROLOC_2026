import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

type Tone = "amber" | "green" | "gold";

interface Notif {
  id: string;
  title: string;
  meta: string;
  tone: Tone;
  to?: string;
  unread: boolean;
}

const INITIAL: Notif[] = [
  { id: "n1", title: "Verificação a vencer em 7 dias", meta: "AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001 · há 1 h", tone: "amber", to: "/riskAlerts", unread: true },
  { id: "n2", title: "Morada aprovada pelo validador", meta: "Belas · há 2 dias", tone: "green", to: "/detail", unread: true },
  { id: "n3", title: "Testemunha confirmada · Tomás M.", meta: "há 2 dias", tone: "green", to: "/witnessRep", unread: false },
  { id: "n4", title: "Lembrete: complete a morada 'Escritório'", meta: "há 5 dias", tone: "gold", to: "/addresses", unread: false },
];

const TONE = {
  amber: { bg: "#F4EAD6", fg: "#B98421" },
  green: { bg: "#EBF1ED", fg: "#2F7A57" },
  gold: { bg: "#FBF2DC", fg: "#B0831F" },
} as const;

export function NotificationsScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL);

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Notificações</span>
        <button onClick={() => setItems((xs) => xs.map((x) => ({ ...x, unread: false })))} style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: "#B0831F" }}>
          Ler todas
        </button>
      </div>

      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((n) => {
          const tone = TONE[n.tone];
          return (
            <button
              key={n.id}
              onClick={() => {
                setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
                if (n.to) navigate(n.to);
              }}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: n.unread ? "#FFFDF9" : "transparent",
                border: n.unread ? "1px solid #EAE3D7" : "1px solid #EFE7DA",
                borderRadius: 14,
                padding: "12px 14px",
              }}
            >
              <span style={{ width: 38, height: 38, borderRadius: 11, flex: "none", background: tone.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon(n.tone, tone.fg)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `${n.unread ? 700 : 600} 13.5px Inter`, color: "#1A1814" }}>{n.title}</div>
                <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 1 }}>{n.meta}</div>
              </div>
              {n.unread && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#D4A853", flex: "none" }} />}
            </button>
          );
        })}
      </div>
    </PhoneChrome>
  );
}

function icon(tone: Tone, c: string) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (tone === "amber") return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
  if (tone === "green") return <svg {...common}><path d="M5 12l5 5L20 7" /></svg>;
  return <svg {...common}><path d="M12 3l2.2 6.6H21l-5.4 4 2 6.4-5.6-4-5.6 4 2-6.4-5.4-4h6.8z" /></svg>;
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #EAE3D7",
  background: "#FFFDF9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;
