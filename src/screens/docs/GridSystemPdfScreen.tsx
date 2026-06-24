import { DocsChrome } from "../../components/ui/DocsChrome";
import { URBAN_CELL_SIZE, RURAL_CELL_SIZE } from "../../lib/afroloc/sdk";

export function GridSystemPdfScreen() {
  return (
    <DocsChrome url="afroloc.ao/docs/grid-system.pdf" topActive="documentsHub" side="gridSystemPdf">
      <div style={{ background: "#E7E0D3", minHeight: "100%", padding: "30px 0", display: "flex", justifyContent: "center" }}>
        {/* paper */}
        <div style={{ width: 560, background: "#FFFFFF", boxShadow: "0 20px 50px -24px rgba(28,24,21,.4)", borderRadius: 4, padding: "48px 56px" }}>
          <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#B0831F" }}>ESPECIFICAÇÃO TÉCNICA</div>
          <h1 style={{ font: "800 26px 'Playfair Display', serif", color: "#1A1814", margin: "10px 0 0" }}>O sistema de grelha QGSQ</h1>
          <div style={{ font: "500 12px Inter", color: "#8A8073", marginTop: 6 }}>Versão 2.0 · AFROFINTEK GmbH</div>
          <div style={{ height: 1, background: "#EAE3D7", margin: "22px 0" }} />

          <h2 style={{ font: "700 15px Inter", color: "#1A1814", margin: 0 }}>1. Princípio</h2>
          <p style={{ font: "400 13.5px Inter", color: "#3a352e", lineHeight: 1.7, margin: "8px 0 0" }}>
            A grelha divide o território em células quadradas. Em zonas urbanas, cada célula mede
            {" "}{URBAN_CELL_SIZE}×{URBAN_CELL_SIZE}&nbsp;m; em zonas rurais, {RURAL_CELL_SIZE}×{RURAL_CELL_SIZE}&nbsp;m.
            Cada célula recebe um identificador determinístico a partir das suas coordenadas.
          </p>

          <h2 style={{ font: "700 15px Inter", color: "#1A1814", margin: "22px 0 0" }}>2. Derivação do código</h2>
          <p style={{ font: "400 13.5px Inter", color: "#3a352e", lineHeight: 1.7, margin: "8px 0 0" }}>
            O código AFROLOC combina o prefixo do país, a divisão administrativa, o tamanho da célula e as
            coordenadas X/Y projetadas em Web Mercator (EPSG:3857) e codificadas em base36.
          </p>
          <div style={{ background: "#1A1814", borderRadius: 8, padding: "12px 14px", marginTop: 12 }}>
            <span style={{ font: "700 12px 'Space Mono'", color: "#E8C97A" }}>AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV</span>
          </div>

          <h2 style={{ font: "700 15px Inter", color: "#1A1814", margin: "22px 0 0" }}>3. Subdivisão adaptativa (SQ)</h2>
          <p style={{ font: "400 13.5px Inter", color: "#3a352e", lineHeight: 1.7, margin: "8px 0 0" }}>
            Cada célula é subdividida em 2×2, 3×3, 4×4 ou 5×5 conforme a densidade de certificações
            (≤10 · ≤50 · ≤150 · &gt;150), garantindo unicidade onde a ocupação é alta.
          </p>
        </div>
      </div>
    </DocsChrome>
  );
}
