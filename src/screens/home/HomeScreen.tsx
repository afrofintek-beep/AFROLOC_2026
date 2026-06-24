import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { TabBar } from "../../components/ui/TabBar";
import { AtsRing } from "../../components/ui/AtsRing";
import { Qr } from "../../components/ui/Qr";
import { currentUser, primaryAddress, recentActivity, addressUrl } from "../../data/account";

export function HomeScreen() {
  const navigate = useNavigate();
  const a = primaryAddress;

  return (
    <PhoneChrome bg="#F0EADE" tabBar={<TabBar active="home" />}>
      <div style={{ padding: "8px 22px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* greeting */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ font: "400 13px Inter", color: "#8A8073" }}>Bem-vinda de volta</div>
            <div style={{ font: "700 22px Inter", color: "#1A1814", marginTop: 2 }}>{currentUser.name}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F1E7D6", borderRadius: 20, padding: "6px 11px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#D4A853" }} />
              <span style={{ font: "700 11px Inter", color: "#7C6A4A", letterSpacing: ".04em" }}>NÍVEL {currentUser.level}</span>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#D4A853,#E07B2C)",
                color: "#2D2519",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "700 16px Inter",
              }}
            >
              {currentUser.initials}
            </div>
          </div>
        </div>

        {/* hero AFROLOC card → detail */}
        <button
          onClick={() => navigate("/detail")}
          style={{
            all: "unset",
            cursor: "pointer",
            background: "#1A1814",
            borderRadius: 24,
            padding: 20,
            color: "#F8F5F0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "#D4A85322" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <div>
              <div style={{ font: "700 10.5px Inter", letterSpacing: ".16em", color: "#E8C97A" }}>A MINHA AFROLOC</div>
              <div style={{ font: "700 15px 'Space Mono'", letterSpacing: ".01em", marginTop: 10, lineHeight: 1.3, wordBreak: "break-all", maxWidth: 168 }}>{a.code}</div>
              <div style={{ marginTop: 7, color: "#A99E8C", font: "400 12.5px Inter" }}>{a.locationLine}</div>
            </div>
            <Qr value={addressUrl(a.code)} size={54} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 18, position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 18, padding: "5px 11px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5BC48E" }} />
              <span style={{ font: "700 11px Inter", color: "#7FD3A6", letterSpacing: ".06em" }}>{a.status}</span>
            </div>
            <span style={{ font: "400 12.5px Inter", color: "#A99E8C" }}>Verificado há {a.verifiedDaysAgo} dias</span>
          </div>
        </button>

        {/* stat row: ATS ring + countdown */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: "#F8F5F0", borderRadius: 20, padding: 15, display: "flex", alignItems: "center", gap: 13 }}>
            <AtsRing score={a.ats} size={58} />
            <div>
              <div style={{ font: "700 13px Inter", color: "#1A1814" }}>ATS</div>
              <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2 }}>Confiança do endereço</div>
            </div>
          </div>
          <div style={{ flex: 1, background: "#F8F5F0", borderRadius: 20, padding: 15, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ font: "700 22px 'Space Mono'", color: "#B0831F" }}>{a.nextVerifyDays}</div>
            <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2, lineHeight: 1.35 }}>dias até à próx. verificação</div>
          </div>
        </div>

        {/* quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <Action label="Testemunha" onClick={() => navigate("/witnesses")} icon={<WitnessIcon />} />
          <Action label="No mapa" onClick={() => navigate("/identitiesMap")} icon={<MapPinIcon />} />
          <Action label="Partilhar" onClick={() => navigate("/share")} icon={<ShareIcon />} />
          <Action label="Nova" onClick={() => navigate("/type")} icon={<PlusIcon />} />
        </div>

        {/* recent activity */}
        <div>
          <div style={{ font: "700 14px Inter", color: "#1A1814", marginBottom: 8 }}>Actividade recente</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentActivity.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8F5F0", borderRadius: 16, padding: "12px 14px" }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    flex: "none",
                    background: it.tone === "green" ? "#EBF1ED" : "#F4EAD6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={it.tone === "green" ? "#2F7A57" : "#B98421"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "600 13px Inter", color: "#1A1814" }}>{it.title}</div>
                  <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 1 }}>{it.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Action({ label, onClick, icon }: { label: string; onClick: () => void; icon: JSX.Element }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: "none",
        background: "#F8F5F0",
        borderRadius: 16,
        padding: "13px 4px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
      }}
    >
      <span style={{ width: 38, height: 38, borderRadius: 11, background: "#FBF2DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </span>
      <span style={{ font: "600 11px Inter", color: "#1A1814" }}>{label}</span>
    </button>
  );
}

const stroke = { fill: "none", stroke: "#B0831F", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function WitnessIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 8l2 2 4-4" /></svg>;
}
function MapPinIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>;
}
function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></svg>;
}
function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14" /></svg>;
}
