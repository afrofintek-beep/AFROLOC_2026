import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { Logo } from "../../components/Logo";

const BENEFITS = [
  { title: "Funciona offline no terreno", icon: wifiIcon },
  { title: "Leve · < 3 MB de dados", icon: featherIcon },
  { title: "Atualiza-se automaticamente", icon: refreshIcon },
];

export function InstallScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#1A1814" dark>
      <div style={{ background: "var(--afl-grad-hero)", flex: 1, display: "flex", flexDirection: "column", padding: "10px 28px 24px", color: "#F8F5F0" }}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <span style={{ width: 76, height: 76, borderRadius: 20, background: "linear-gradient(135deg,#E8C97A,#D4A853)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 36px -14px rgba(212,168,83,.6)" }}>
            <Logo size={48} />
          </span>
        </div>
        <h1 style={{ font: "700 28px Inter", color: "#F8F5F0", textAlign: "center", letterSpacing: "-.01em", margin: "22px 0 0" }}>Instale o AFROLOC</h1>
        <p style={{ font: "400 14px Inter", color: "#C9BDA8", textAlign: "center", lineHeight: 1.5, margin: "10px 0 0" }}>
          Adicione ao ecrã inicial e use mesmo offline — funciona como uma app nativa.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 28 }}>
          {BENEFITS.map((b) => (
            <div key={b.title} style={{ display: "flex", alignItems: "center", gap: 13, background: "#26201966", border: "1px solid #3A332D", borderRadius: 14, padding: "13px 15px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "#332B1E", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{b.icon()}</span>
              <span style={{ font: "600 13.5px Inter", color: "#F8F5F0" }}>{b.title}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", flexDirection: "column", gap: 11 }}>
          <button style={{ border: "none", width: "100%", height: 56, borderRadius: 16, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 16px Inter", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.5)" }}>
            Adicionar ao ecrã inicial
          </button>
          <button onClick={() => navigate("/appDownload")} style={{ all: "unset", cursor: "pointer", textAlign: "center", font: "600 13px Inter", color: "#A99E8C" }}>Prefiro a loja de apps</button>
        </div>
      </div>
    </PhoneChrome>
  );
}

function wifiIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" /></svg>; }
function featherIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4a9 9 0 0 0-13 0L4 12l3 3 8-8M9 13l4 4" /></svg>; }
function refreshIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>; }
