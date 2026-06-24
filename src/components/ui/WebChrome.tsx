import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../Logo";

const NAV = [
  { id: "landing", label: "Produto" },
  { id: "pricing", label: "Preços" },
  { id: "about", label: "Sobre" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contacto" },
];

/**
 * Desktop web frame for the public marketing site (1180×760): browser chrome +
 * top nav. The PhoneFrame scales this to fit; pages render `children` below.
 */
export function WebChrome({ url, active, children }: { url: string; active: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div style={{ width: 1180, height: 760, borderRadius: 14, background: "#F8F5F0", overflow: "hidden", boxShadow: "0 40px 70px -34px rgba(28,24,21,.45), 0 0 0 1px rgba(28,24,21,.05)", display: "flex", flexDirection: "column" }}>
      {/* browser chrome */}
      <div style={{ height: 46, flex: "none", background: "#EDE6DA", borderBottom: "1px solid #DDD3C4", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 7 }}>
          {["#E0655A", "#E6B95A", "#6FBE7A"].map((c) => (<div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />))}
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#F8F5F0", border: "1px solid #DDD3C4", borderRadius: 9, height: 28, display: "flex", alignItems: "center", gap: 7, padding: "0 14px", minWidth: 340 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span style={{ font: "600 12px 'Space Mono'", color: "#8A8073" }}>{url}</span>
          </div>
        </div>
      </div>

      {/* top nav */}
      <div style={{ height: 64, flex: "none", background: "#1A1814", display: "flex", alignItems: "center", padding: "0 30px", gap: 26 }}>
        <button onClick={() => navigate("/landing")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={32} />
          <span style={{ font: "800 17px Inter", color: "#F8F5F0", letterSpacing: ".02em" }}>AFROLOC</span>
        </button>
        <div style={{ display: "flex", gap: 4, marginLeft: 10 }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => navigate("/" + n.id)} style={{ all: "unset", cursor: "pointer", font: `${active === n.id ? 700 : 500} 13px Inter`, color: active === n.id ? "#E8C97A" : "#A99E8C", padding: "6px 11px" }}>{n.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => navigate("/login")} style={{ all: "unset", cursor: "pointer", font: "600 13px Inter", color: "#A99E8C" }}>Entrar</button>
          <button onClick={() => navigate("/presignup")} style={{ border: "none", background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 13px Inter", borderRadius: 11, padding: "9px 16px", cursor: "pointer" }}>Criar conta</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
    </div>
  );
}
