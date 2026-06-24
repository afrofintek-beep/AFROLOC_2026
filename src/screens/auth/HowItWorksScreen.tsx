import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

const STEPS = [
  { n: 1, title: "Marque o local", desc: "O GPS e a grelha QGSQ dão à sua casa um código único e permanente.", icon: pinIcon },
  { n: 2, title: "Os vizinhos confirmam", desc: "A validação comunitária dispensa cadastro oficial — quem vive ali atesta.", icon: peopleIcon },
  { n: 3, title: "Use em todo o lado", desc: "Entregas, banca, serviços e emergência — a partir de um só código.", icon: gridIcon },
];

export function HowItWorksScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#1A1814" dark>
      <div style={{ background: "var(--afl-grad-hero)", flex: 1, display: "flex", flexDirection: "column", padding: "4px 26px 22px", color: "#F8F5F0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => navigate("/welcome")} style={{ all: "unset", cursor: "pointer", font: "600 13px Inter", color: "#A99E8C", padding: "8px 4px" }}>Saltar</button>
        </div>

        <h1 style={{ font: "700 31px Inter", color: "#F8F5F0", letterSpacing: "-.01em", lineHeight: 1.15, margin: "18px 0 0", textWrap: "balance" }}>
          Sem rua? Sem número? Sem problema.
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 15, alignItems: "flex-start", background: "#26201966", border: "1px solid #3A332D", borderRadius: 18, padding: "16px 16px" }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, flex: "none", background: "linear-gradient(135deg,#E8C97A,#D4A853)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon()}</span>
              <div>
                <div style={{ font: "700 15px Inter", color: "#E8C97A" }}>{s.n} · {s.title}</div>
                <div style={{ font: "400 13px Inter", color: "#C9BDA8", marginTop: 4, lineHeight: 1.45 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <button onClick={() => navigate("/presignup")} style={{ border: "none", width: "100%", height: 56, borderRadius: 16, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 16px Inter", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.5)" }}>
            Começar
          </button>
        </div>
      </div>
    </PhoneChrome>
  );
}

function pinIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D2519" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>; }
function peopleIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D2519" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 6.5a3 3 0 0 1 0 5.5" /></svg>; }
function gridIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D2519" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>; }
