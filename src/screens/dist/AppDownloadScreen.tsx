import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { Qr } from "../../components/ui/Qr";

export function AppDownloadScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div style={{ padding: "10px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h1 style={{ font: "700 26px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>Descarregar AFROLOC para telemóvel</h1>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>Disponível para Android e iOS, e como app web.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 22 }}>
          <StoreBadge top="DISPONÍVEL NO" main="Google Play" icon={playIcon} />
          <StoreBadge top="DESCARREGAR NA" main="App Store" icon={appleIcon} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <span style={{ flex: 1, height: 1, background: "#E6DCCC" }} />
          <span style={{ font: "500 12px Inter", color: "#A99E8C" }}>Sem loja</span>
          <span style={{ flex: 1, height: 1, background: "#E6DCCC" }} />
        </div>

        <button onClick={() => navigate("/install")} style={{ border: "1.5px solid #D4A853", background: "#FBF2DC", borderRadius: 16, height: 54, font: "700 14px Inter", color: "#B0831F", cursor: "pointer" }}>
          Instalar app web (PWA)
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: 16 }}>
          <Qr value="https://afroloc.ao/app" size={72} plate="#FFFDF9" />
          <span style={{ font: "400 13px Inter", color: "#8A8073", lineHeight: 1.5 }}>Aponte a câmara para instalar no seu dispositivo.</span>
        </div>

        <button onClick={() => navigate("/sourceDownload")} style={{ all: "unset", cursor: "pointer", textAlign: "center", marginTop: "auto", paddingTop: 16, paddingBottom: 8, font: "700 13px Inter", color: "#B0831F" }}>
          Programador? Descarregar código →
        </button>
      </div>
    </PhoneChrome>
  );
}

function StoreBadge({ top, main, icon }: { top: string; main: string; icon: () => JSX.Element }) {
  return (
    <button style={{ border: "none", background: "#1A1814", borderRadius: 16, height: 60, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", cursor: "pointer" }}>
      {icon()}
      <span style={{ textAlign: "left" }}>
        <span style={{ font: "500 9px Inter", color: "#A99E8C", display: "block", letterSpacing: ".06em" }}>{top}</span>
        <span style={{ font: "700 17px Inter", color: "#F8F5F0", display: "block" }}>{main}</span>
      </span>
    </button>
  );
}

function playIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 3l13 9-13 9z" fill="#E8C97A" /></svg>; }
function appleIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="#F8F5F0"><path d="M16 2c-1 .1-2.2.7-2.9 1.6-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4.6-.8 1.1-1.9 1-3.1zM18.5 17c-.5 1.1-.7 1.6-1.3 2.6-.9 1.4-2.1 3.1-3.6 3.1-1.3 0-1.7-.9-3.5-.9s-2.2.8-3.5.9c-1.5.1-2.6-1.5-3.5-2.9C1.4 17 1 13.7 2.5 11.5c.9-1.3 2.3-2.1 3.6-2.1 1.4 0 2.3.9 3.5.9 1.1 0 1.8-.9 3.5-.9 1.2 0 2.5.7 3.4 1.8-3 1.6-2.5 5.9.5 6.8z" /></svg>; }

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
