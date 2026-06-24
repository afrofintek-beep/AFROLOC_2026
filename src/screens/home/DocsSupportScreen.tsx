import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const PUBLIC_DOCS = [
  { label: "Políticas e termos", to: "/contractDownloads" },
  { label: "Perguntas frequentes (FAQ)", to: "/faq" },
  { label: "Como funciona o AFROLOC", to: "/howitworks" },
  { label: "Guia para bairros informais", to: "/manualDownload" },
];

export function DocsSupportScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Documentos &amp; apoio</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 13, padding: "0 14px", height: 46 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input placeholder="Procurar nos documentos" style={{ flex: 1, border: "none", background: "transparent", font: "500 13px Inter", color: "#1A1814", outline: "none" }} />
        </div>

        {/* support manual */}
        <button onClick={() => navigate("/manualDownload")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, background: "#1A1814", borderRadius: 16, padding: "14px 16px", color: "#F8F5F0" }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: "#332B1E", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" /><path d="M18 7h2v13H7" /></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 14px Inter", color: "#F8F5F0" }}>Manual de apoio</div>
            <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 2 }}>PDF · descarregar</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
        </button>

        <div style={{ font: "700 13px Inter", color: "#1A1814" }}>Documentos públicos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PUBLIC_DOCS.map((d) => (
            <button key={d.label} onClick={() => navigate(d.to)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 13, padding: "13px 14px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
              <span style={{ flex: 1, font: "600 13.5px Inter", color: "#1A1814" }}>{d.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          ))}
        </div>

        {/* support */}
        <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ font: "700 13px Inter", color: "#1A1814" }}>Suporte técnico</div>
          <a href="mailto:suporte@afroloc.ao" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11, textDecoration: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
            <span style={{ font: "600 13px Inter", color: "#1A1814" }}>suporte@afroloc.ao</span>
          </a>
          <a href="tel:+244923828282" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, textDecoration: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
            <span style={{ font: "600 13px Inter", color: "#1A1814" }}>+244 923 828 282</span>
          </a>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
