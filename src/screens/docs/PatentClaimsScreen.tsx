import { DocsChrome } from "../../components/ui/DocsChrome";

const CLAIMS = [
  "Um método de atribuição de um identificador único e permanente a uma localização física através de uma grelha geoespacial de células de dimensão variável conforme a densidade urbana.",
  "O método da reivindicação 1, em que a validade do identificador depende de uma pontuação de confiança derivada de captura GPS, confirmação por testemunhas próximas e estabilidade temporal.",
  "O método da reivindicação 1, em que a posição é reforçada por triangulação de antenas de telecomunicações para detetar falsificação de GPS.",
  "Um sistema que implementa o método das reivindicações 1 a 3, com geração de código offline e reconciliação por chave de idempotência na sincronização.",
];

export function PatentClaimsScreen() {
  return (
    <DocsChrome url="afroloc.ao/ip/claims" topActive="ipDocumentation" side="patentClaims">
      <div style={{ padding: "34px 40px", maxWidth: 780 }}>
        <h1 style={{ font: "800 30px 'Playfair Display', serif", color: "#1A1814", margin: 0 }}>Reivindicações</h1>
        <p style={{ font: "400 15px Inter", color: "#8A8073", margin: "10px 0 0", lineHeight: 1.55 }}>
          Âmbito de proteção do pedido de patente 2025-0192.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
          {CLAIMS.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 16, background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 14, padding: "18px 20px" }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, flex: "none", background: "#1A1814", color: "#E8C97A", display: "flex", alignItems: "center", justifyContent: "center", font: "700 14px 'Space Mono'" }}>{i + 1}</span>
              <p style={{ margin: 0, font: "400 14px Inter", color: "#3a352e", lineHeight: 1.6 }}>{c}</p>
            </div>
          ))}
        </div>
      </div>
    </DocsChrome>
  );
}
