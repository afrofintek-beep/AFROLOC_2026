import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { TabBar } from "../../components/ui/TabBar";

export function EmptyScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg="#F0EADE" tabBar={<TabBar active="home" />}>
      <div style={{ flex: 1, padding: "20px 30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {/* illustration */}
        <div style={{ width: 150, height: 150, borderRadius: 28, background: "repeating-linear-gradient(135deg,#EFE7DA 0 12px,#E9E0D1 12px 24px)", position: "relative", overflow: "hidden", marginBottom: 6 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1c181510 1px,transparent 1px),linear-gradient(90deg,#1c181510 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 54, height: 54, borderRadius: "50%", background: "#D4A85322", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px dashed #D4A853" }} />
          </div>
        </div>

        <h2 style={{ font: "700 23px Inter", color: "#1A1814", margin: "22px 0 0", letterSpacing: "-.01em" }}>Ainda não tem nenhuma AFROLOC</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "12px 0 0", lineHeight: 1.5, maxWidth: 280 }}>
          Crie o seu primeiro endereço digital — único, georreferenciado e validado pela sua comunidade.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 28, width: "100%", maxWidth: 300 }}>
          <button onClick={() => navigate("/type")} style={{ border: "none", width: "100%", height: 54, borderRadius: 16, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.6)" }}>
            Criar a minha primeira AFROLOC
          </button>
          <button onClick={() => navigate("/howitworks")} style={{ border: "1.5px solid #E2D8C8", width: "100%", height: 54, borderRadius: 16, background: "transparent", color: "#1A1814", font: "600 14px Inter", cursor: "pointer" }}>
            Saber como funciona
          </button>
        </div>
      </div>
    </PhoneChrome>
  );
}
