import { useNavigate } from "react-router-dom";
import { WebChrome } from "../../components/ui/WebChrome";
import { Qr } from "../../components/ui/Qr";

const FEATURES = [
  { title: "Sem rua? Sem número?", desc: "A grelha QGSQ dá a cada 10×10 m um código permanente.", icon: pinIcon },
  { title: "Validado pelos vizinhos", desc: "Testemunhas próximas confirmam — sem cadastro oficial.", icon: peopleIcon },
  { title: "Aceite em todo o lado", desc: "Bancos, serviços públicos, entregas e emergência.", icon: checkIcon },
];

export function LandingScreen() {
  const navigate = useNavigate();
  return (
    <WebChrome url="afroloc.ao" active="landing">
      {/* hero (dark) */}
      <div style={{ background: "var(--afl-grad-hero)", padding: "54px 60px 60px", display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#26201966", border: "1px solid #3A332D", borderRadius: 18, padding: "7px 14px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5BC48E" }} />
            <span style={{ font: "600 12px Inter", color: "#C9BDA8" }}>54 países · 834 regiões · 193 línguas</span>
          </div>
          <h1 style={{ font: "800 46px 'Playfair Display', serif", color: "#F8F5F0", lineHeight: 1.08, letterSpacing: "-.01em", margin: "20px 0 0", maxWidth: 540 }}>
            Um endereço digital para cada africano.
          </h1>
          <p style={{ font: "400 16px Inter", color: "#C9BDA8", lineHeight: 1.6, margin: "18px 0 0", maxWidth: 500 }}>
            Onde não há ruas nem números, o AFROLOC cria um código único, georreferenciado e validado pela comunidade — aceite por bancos, serviços e entregas.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <button onClick={() => navigate("/presignup")} style={{ border: "none", height: 52, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", padding: "0 24px", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.5)" }}>Criar a minha AFROLOC</button>
            <button onClick={() => navigate("/howitworks")} style={{ border: "1.5px solid #3A332D", height: 52, borderRadius: 15, background: "transparent", color: "#F8F5F0", font: "600 15px Inter", padding: "0 22px", cursor: "pointer" }}>Como funciona</button>
          </div>
        </div>

        {/* phone mockup card */}
        <div style={{ width: 250, flex: "none", background: "#262019", border: "1px solid #3A332D", borderRadius: 26, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ font: "700 9px Inter", letterSpacing: ".16em", color: "#E8C97A" }}>A MINHA AFROLOC</div>
              <div style={{ font: "700 12px 'Space Mono'", color: "#F8F5F0", marginTop: 10, lineHeight: 1.32, wordBreak: "break-all", maxWidth: 140 }}>AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001</div>
            </div>
            <Qr value="https://afroloc.ao/a/AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001" size={60} plate="#F8F5F0" />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 16, padding: "5px 11px", marginTop: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5BC48E" }} />
            <span style={{ font: "700 10px Inter", color: "#7FD3A6", letterSpacing: ".04em" }}>ATS 86 · ATIVO</span>
          </div>
        </div>
      </div>

      {/* features (light) */}
      <div style={{ background: "#F8F5F0", padding: "44px 60px 54px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 18, padding: 24 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "#FBF2DC", display: "flex", alignItems: "center", justifyContent: "center" }}>{f.icon()}</span>
            <div style={{ font: "700 17px Inter", color: "#1A1814", marginTop: 16 }}>{f.title}</div>
            <div style={{ font: "400 13.5px Inter", color: "#8A8073", marginTop: 8, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </WebChrome>
  );
}

function pinIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>; }
function peopleIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 6.5a3 3 0 0 1 0 5.5" /></svg>; }
function checkIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>; }
