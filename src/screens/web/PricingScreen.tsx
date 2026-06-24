import { useNavigate } from "react-router-dom";
import { WebChrome } from "../../components/ui/WebChrome";

const TIERS = [
  { name: "Cidadão", price: "Grátis", sub: "para sempre", features: ["1 morada pessoal", "Código + QR + certificado", "Validação comunitária", "App offline"], highlight: false },
  { name: "Empresarial", price: "25 000 Kz", sub: "/mês · a partir de", features: ["Até 10 000 consultas/mês", "API REST", "Para lojas, estafetas e PME", "1 painel"], highlight: false },
  { name: "Instituições", price: "150 000 Kz", sub: "/mês · a partir de", features: ["Até 100 000 consultas/mês", "API REST + Yamioo", "Painel de validação + SLA", "Suporte prioritário"], highlight: true },
  { name: "Governo", price: "Sob consulta", sub: "licença anual", features: ["Cobertura nacional", "Hierarquia 5 níveis", "Integração de censo", "Certificação oficial"], highlight: false },
];

export function PricingScreen() {
  const navigate = useNavigate();
  return (
    <WebChrome url="afroloc.ao/pricing" active="pricing">
      <div style={{ padding: "48px 60px 56px", background: "#F8F5F0", minHeight: "100%" }}>
        <h1 style={{ font: "800 38px 'Playfair Display', serif", color: "#1A1814", textAlign: "center", margin: 0 }}>Preços simples e justos</h1>
        <p style={{ font: "400 15px Inter", color: "#8A8073", textAlign: "center", margin: "12px 0 0" }}>Para cidadãos é grátis. As instituições pagam por escala.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 36, maxWidth: 1060, marginLeft: "auto", marginRight: "auto" }}>
          {TIERS.map((t) => (
            <div key={t.name} style={{ background: t.highlight ? "#1A1814" : "#FFFFFF", border: t.highlight ? "1px solid #3A332D" : "1px solid #EAE3D7", borderRadius: 18, padding: 20, color: t.highlight ? "#F8F5F0" : "#1A1814", position: "relative", transform: t.highlight ? "translateY(-8px)" : "none", boxShadow: t.highlight ? "0 30px 50px -28px rgba(28,24,21,.5)" : "none" }}>
              {t.highlight && <div style={{ position: "absolute", top: 16, right: 16, font: "700 9px Inter", letterSpacing: ".08em", color: "#2D2519", background: "#E8C97A", borderRadius: 6, padding: "3px 8px" }}>POPULAR</div>}
              <div style={{ font: "700 15px Inter", color: t.highlight ? "#E8C97A" : "#B0831F" }}>{t.name}</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ font: "800 24px 'Space Mono'", color: t.highlight ? "#F8F5F0" : "#1A1814", whiteSpace: "nowrap" }}>{t.price}</div>
                <div style={{ font: "500 12px Inter", color: t.highlight ? "#A99E8C" : "#8A8073", marginTop: 4 }}>{t.sub}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, margin: "20px 0 24px" }}>
                {t.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.highlight ? "#5BC48E" : "#2F7A57"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    <span style={{ font: "500 13px Inter", color: t.highlight ? "#C9BDA8" : "#5C5347" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/presignup")} style={{ border: t.highlight ? "none" : "1.5px solid #E2D8C8", width: "100%", height: 46, borderRadius: 13, background: t.highlight ? "linear-gradient(135deg,#D4A853,#E07B2C)" : "transparent", color: t.highlight ? "#2D2519" : "#1A1814", font: "700 14px Inter", cursor: "pointer" }}>Começar</button>
            </div>
          ))}
        </div>

        {/* pay-as-you-go add-ons */}
        <div style={{ maxWidth: 920, margin: "26px auto 0", display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { v: "5 Kz", l: "por consulta adicional (resolução de morada)" },
            { v: "100 Kz", l: "por verificação de morada (comprovativo · KYC)" },
          ].map((a) => (
            <div key={a.l} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 13, padding: "12px 16px" }}>
              <span style={{ font: "800 16px 'Space Mono'", color: "#B0831F" }}>a partir de {a.v}</span>
              <span style={{ font: "500 12.5px Inter", color: "#8A8073" }}>{a.l}</span>
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: "#A99E8C", textAlign: "center", margin: "22px auto 0", maxWidth: 720, lineHeight: 1.5 }}>
          Preços em kwanzas (Kz), indicativos e revistos periodicamente. Planos institucionais podem ser ajustados por
          volume e jurisdição — fale connosco para uma proposta. IVA não incluído.
        </p>
      </div>
    </WebChrome>
  );
}
