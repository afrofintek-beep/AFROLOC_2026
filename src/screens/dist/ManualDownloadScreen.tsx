import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const GUIDES = [
  { name: "Criar a primeira morada", meta: "PDF · 6 páginas" },
  { name: "Ser testemunha", meta: "PDF · 3 páginas" },
  { name: "Guia do validador", meta: "PDF · 12 páginas" },
];

export function ManualDownloadScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div style={{ padding: "10px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 style={{ font: "700 25px Inter", color: "#1A1814", margin: 0, letterSpacing: "-.01em" }}>Manual &amp; guias</h1>

        {/* main manual */}
        <button style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: "#1A1814", borderRadius: 18, padding: 18, color: "#F8F5F0" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: "#332B1E", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" /><path d="M18 7h2v13H7" /></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 15px Inter", color: "#F8F5F0" }}>Manual de apoio</div>
            <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 2 }}>Guia completo · 48 páginas · PT</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
        </button>

        <div style={{ font: "700 13px Inter", color: "#1A1814" }}>Guias rápidos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {GUIDES.map((g) => (
            <button key={g.name} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "#F0EADE", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>{g.name}</div>
                <div style={{ font: "400 11.5px Inter", color: "#8A8073", marginTop: 1 }}>{g.meta}</div>
              </div>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
            </button>
          ))}
        </div>

        <button onClick={() => navigate("/documentsHub")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", marginTop: 4 }}>
          Descarregar manual completo
        </button>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
