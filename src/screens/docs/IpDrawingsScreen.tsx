import { DocsChrome } from "../../components/ui/DocsChrome";

const FIGS = [
  { n: 1, title: "Célula QGSQ 10×10 m" },
  { n: 2, title: "Derivação do código" },
  { n: 3, title: "Raio de testemunhas" },
  { n: 4, title: "Fluxo de verificação" },
  { n: 5, title: "Triangulação telecom" },
  { n: 6, title: "Hierarquia administrativa" },
];

export function IpDrawingsScreen() {
  return (
    <DocsChrome url="afroloc.ao/ip/drawings" topActive="ipDocumentation" side="ipDrawings">
      <div style={{ padding: "34px 40px" }}>
        <h1 style={{ font: "800 30px 'Playfair Display', serif", color: "#1A1814", margin: 0 }}>Desenhos técnicos da patente</h1>
        <p style={{ font: "400 15px Inter", color: "#8A8073", margin: "10px 0 0", maxWidth: 680, lineHeight: 1.55 }}>
          Figuras que ilustram a grelha QGSQ, a derivação do código e o fluxo de validação.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 26, maxWidth: 860 }}>
          {FIGS.map((f) => (
            <div key={f.n} style={{ background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 130, background: "repeating-linear-gradient(135deg,#F4EFE6 0 10px,#EFE8DB 10px 20px)", position: "relative", borderBottom: "1px solid #EAE3D7" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1c181508 1px,transparent 1px),linear-gradient(90deg,#1c181508 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ font: "700 10px 'Space Mono'", color: "#1A181466", letterSpacing: ".1em" }}>FIG. {f.n}</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ font: "700 12px Inter", color: "#1A1814" }}>FIG. {f.n} — {f.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DocsChrome>
  );
}
