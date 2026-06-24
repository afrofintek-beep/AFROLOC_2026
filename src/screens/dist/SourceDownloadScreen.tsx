import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const PACKAGES = [
  { name: "Código-fonte (.zip)", meta: "12,4 MB · v2.0", icon: zipIcon },
  { name: "APK Android", meta: "28 MB · assinado", icon: apkIcon },
  { name: "Esquema da BD (.sql)", meta: "africa-admin-seed", icon: dbIcon },
];

export function SourceDownloadScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div style={{ padding: "10px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <h1 style={{ font: "700 25px Inter", color: "#1A1814", margin: 0, letterSpacing: "-.01em" }}>Código-fonte</h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8, font: "600 12px 'Space Mono'", color: "#B0831F", background: "#FBF2DC", borderRadius: 10, padding: "6px 11px" }}>
            afroloc-app · React + Vite + Capacitor
          </div>
        </div>

        <div style={{ font: "700 13px Inter", color: "#1A1814" }}>Pacotes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {PACKAGES.map((p) => (
            <button key={p.name} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "#F0EADE", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{p.icon()}</span>
              <div style={{ flex: 1 }}>
                <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>{p.name}</div>
                <div style={{ font: "400 11.5px 'Space Mono'", color: "#8A8073", marginTop: 1 }}>{p.meta}</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
            </button>
          ))}
        </div>

        <div style={{ background: "#1A1814", borderRadius: 14, padding: "13px 15px" }}>
          <div style={{ font: "700 9px Inter", letterSpacing: ".14em", color: "#A99E8C", marginBottom: 7 }}>CLONAR</div>
          <div style={{ font: "600 12.5px 'Space Mono'", color: "#E8C97A" }}>git clone afroloc.ao/git/app</div>
        </div>

        <button onClick={() => navigate("/ipDocumentation")} style={{ all: "unset", cursor: "pointer", font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45 }}>
          Distribuído sob licença proprietária AFROFINTEK. <strong style={{ color: "#B0831F" }}>Ver documentação de PI.</strong>
        </button>
      </div>
    </PhoneChrome>
  );
}

function zipIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M12 11v2M12 15v2M12 19v1" /></svg>; }
function apkIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>; }
function dbIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>; }

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
