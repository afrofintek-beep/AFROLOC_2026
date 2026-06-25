import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { TabBar } from "../../components/ui/TabBar";
import { currentUser } from "../../data/account";
import { useAuth } from "../../state/auth";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { configured, profile, signOut } = useAuth();
  // Em modo real usa o perfil da BD; em demo, a "Ana Cardoso".
  const u = {
    ...currentUser,
    name: configured && profile?.name ? profile.name : currentUser.name,
    phone: configured && profile?.phone ? profile.phone : currentUser.phone,
    initials: configured && profile?.name ? initialsOf(profile.name) : currentUser.initials,
    language: configured && profile?.language ? profile.language : currentUser.language,
    reputationTier: (configured && profile ? profile.reputation_tier : currentUser.reputationTier) as typeof currentUser.reputationTier,
    reputationScore: configured && profile ? profile.reputation_score : currentUser.reputationScore,
    testimonials: configured && profile ? profile.testimonials : currentUser.testimonials,
    frauds: configured && profile ? profile.frauds : currentUser.frauds,
    level: configured && profile ? profile.level : currentUser.level,
    levelTitle: configured && profile ? profile.level_title : currentUser.levelTitle,
    authConfidence: configured && profile ? profile.auth_confidence : currentUser.authConfidence,
    jurisdiction: configured && profile?.jurisdiction ? profile.jurisdiction : currentUser.jurisdiction,
  };
  const [biometric, setBiometric] = useState(true);
  const [offline, setOffline] = useState(true);

  async function handleSignOut() {
    if (configured) await signOut();
    navigate("/welcome");
  }

  return (
    <PhoneChrome bg="#F0EADE" tabBar={<TabBar active="profile" />}>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#D4A853,#E07B2C)",
              color: "#2D2519",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "700 20px Inter",
              flex: "none",
            }}
          >
            {u.initials}
          </div>
          <div>
            <div style={{ font: "700 20px Inter", color: "#1A1814" }}>{u.name}</div>
            <div style={{ font: "500 13px 'Space Mono'", color: "#8A8073", marginTop: 2 }}>{u.phone}</div>
          </div>
        </div>

        {/* authority card (dark, 5-tier) */}
        <div style={{ background: "#1A1814", borderRadius: 20, padding: 18, color: "#F8F5F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#A99E8C" }}>NÍVEL DE AUTORIZAÇÃO</span>
            <span style={{ font: "700 11px 'Space Mono'", color: "#E8C97A" }}>Confiança {u.authConfidence}/100</span>
          </div>
          <div style={{ font: "700 18px Inter", marginTop: 10 }}>
            Nível {u.level} · {u.levelTitle}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    background: n <= u.level ? "var(--afl-grad-glow)" : "#2E2720",
                  }}
                />
                <span style={{ font: "700 10px 'Space Mono'", color: n <= u.level ? "#E8C97A" : "#6b6358" }}>{n}</span>
              </div>
            ))}
          </div>
          <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 14, lineHeight: 1.45 }}>{u.jurisdiction}</div>
        </div>

        {/* reputation → witnessRep */}
        <button onClick={() => navigate("/witnessRep")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "#F4EAD6", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="9" r="5" />
              <path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5" />
            </svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 14px Inter", color: "#1A1814" }}>Reputação · {u.reputationTier}</div>
            <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2 }}>
              {u.testimonials} testemunhos confirmados · {u.frauds} fraudes
            </div>
          </div>
          <span style={{ font: "700 20px 'Space Mono'", color: "#B98421" }}>{u.reputationScore}</span>
        </button>

        {/* settings */}
        <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, overflow: "hidden" }}>
          <button onClick={() => navigate("/language")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", width: "100%", boxSizing: "border-box" }}>
            <span style={{ font: "600 14px Inter", color: "#1A1814" }}>Idioma</span>
            <span style={{ font: "500 13px Inter", color: "#8A8073" }}>{u.language} ›</span>
          </button>
          <Divider />
          <Row label="Entrada biométrica">
            <Switch on={biometric} onClick={() => setBiometric((v) => !v)} />
          </Row>
          <Divider />
          <Row label="Modo offline">
            <Switch on={offline} onClick={() => setOffline((v) => !v)} />
          </Row>
          <Divider />
          <NavRow label="Mudar número" onClick={() => navigate("/changePhone")} />
          <Divider />
          <NavRow label="Dispositivos de confiança" onClick={() => navigate("/trustedDevices")} />
          <Divider />
          <NavRow label="Documentos & apoio" onClick={() => navigate("/docs")} />
        </div>

        <button onClick={handleSignOut} style={{ border: "1.5px solid #EAE3D7", background: "transparent", borderRadius: 14, padding: "13px", font: "600 14px Inter", color: "#D14B3A", cursor: "pointer" }}>
          Terminar sessão
        </button>
      </div>
    </PhoneChrome>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "·";
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
      <span style={{ font: "600 14px Inter", color: "#1A1814" }}>{label}</span>
      {children}
    </div>
  );
}

function NavRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", width: "100%", boxSizing: "border-box" }}>
      <span style={{ font: "600 14px Inter", color: "#1A1814" }}>{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#EFE7DA", margin: "0 16px" }} />;
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: on ? "#2F7A57" : "#E6DCCC", position: "relative", cursor: "pointer" }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </button>
  );
}
