import { WebChrome } from "../../components/ui/WebChrome";

const STATS = [
  { v: "600M+", l: "sem morada em África" },
  { v: "54", l: "países no sistema" },
  { v: "10×10m", l: "precisão urbana" },
  { v: "100%", l: "validação comunitária" },
];

export function AboutScreen() {
  return (
    <WebChrome url="afroloc.ao/about" active="about">
      <div style={{ background: "#F8F5F0", minHeight: "100%" }}>
        <div style={{ padding: "50px 60px 40px", maxWidth: 760 }}>
          <div style={{ font: "700 11px Inter", letterSpacing: ".16em", color: "#B0831F" }}>A NOSSA MISSÃO</div>
          <h1 style={{ font: "800 36px 'Playfair Display', serif", color: "#1A1814", lineHeight: 1.15, margin: "14px 0 0" }}>
            Dar um endereço a quem o mundo não consegue encontrar.
          </h1>
          <p style={{ font: "400 16px Inter", color: "#8A8073", lineHeight: 1.65, margin: "18px 0 0" }}>
            Mais de metade da população africana vive sem morada formal. Sem endereço não há conta bancária,
            entrega, ambulância nem voto. O AFROLOC resolve isto com tecnologia simples e validação comunitária.
          </p>
        </div>

        <div style={{ padding: "0 60px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {STATS.map((s) => (
            <div key={s.l} style={{ background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 16, padding: 22 }}>
              <div style={{ font: "800 28px 'Space Mono'", color: "#B0831F" }}>{s.v}</div>
              <div style={{ font: "500 12.5px Inter", color: "#8A8073", marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: "40px 60px 54px", background: "var(--afl-grad-hero)", borderRadius: 20, padding: "28px 30px", color: "#F8F5F0" }}>
          <div style={{ font: "800 18px Inter", color: "#E8C97A" }}>AFROFINTEK GmbH</div>
          <p style={{ font: "400 14px Inter", color: "#C9BDA8", lineHeight: 1.6, margin: "10px 0 0", maxWidth: 620 }}>
            Construímos infraestrutura civil digital para o continente — começando pelo endereço.
          </p>
        </div>
      </div>
    </WebChrome>
  );
}
