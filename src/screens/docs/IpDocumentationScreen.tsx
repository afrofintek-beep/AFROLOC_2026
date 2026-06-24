import { DocsChrome } from "../../components/ui/DocsChrome";

const IP = [
  { kind: "PATENTE", title: "Método de endereçamento por grelha + validação comunitária", ref: "PT/AO · pedido 2025-0192" },
  { kind: "MARCA", title: "AFROLOC® · nome e logótipo", ref: "Registada · classes 9, 42" },
  { kind: "SEGREDO COMERCIAL", title: "Algoritmo do Índice de Confiança da Morada (ATS)", ref: "Acesso restrito" },
  { kind: "DIREITO DE AUTOR", title: "Código-fonte e base de dados continental", ref: "© 2026 AFROFINTEK" },
];

export function IpDocumentationScreen() {
  return (
    <DocsChrome url="afroloc.ao/ip" topActive="ipDocumentation" side="ipDocumentation">
      <div style={{ padding: "34px 40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#FBEAE4", borderRadius: 16, padding: "6px 13px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2542F" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /></svg>
          <span style={{ font: "700 11px Inter", color: "#C2542F", letterSpacing: ".04em" }}>CONFIDENCIAL · AFROFINTEK GmbH</span>
        </div>
        <h1 style={{ font: "800 32px 'Playfair Display', serif", color: "#1A1814", margin: "14px 0 0" }}>Propriedade Intelectual</h1>
        <p style={{ font: "400 15px Inter", color: "#8A8073", margin: "10px 0 0", maxWidth: 700, lineHeight: 1.55 }}>
          Conjunto de proteções sobre o sistema de endereçamento AFROLOC: código único, grelha QGSQ, validação
          comunitária e Índice de Confiança da Morada.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 26, maxWidth: 820 }}>
          {IP.map((c) => (
            <div key={c.kind} style={{ background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 14, padding: 20 }}>
              <div style={{ font: "700 11px Inter", letterSpacing: ".1em", color: "#B0831F", textTransform: "uppercase" }}>{c.kind}</div>
              <div style={{ font: "700 16px Inter", color: "#1A1814", marginTop: 8, lineHeight: 1.35 }}>{c.title}</div>
              <div style={{ font: "600 12px 'Space Mono'", color: "#8A8073", marginTop: 8 }}>{c.ref}</div>
            </div>
          ))}
        </div>
      </div>
    </DocsChrome>
  );
}
