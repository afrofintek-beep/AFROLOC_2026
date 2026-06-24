import { DocsChrome } from "../../components/ui/DocsChrome";

const CONTRACTS = [
  { title: "Acordo com autoridade municipal", sub: "Belas · Luanda · vigência 2026–2029", state: "ASSINADO" },
  { title: "Protocolo com operadora", sub: "Unitel · partilha de Cell ID", state: "ASSINADO" },
  { title: "Acordo de integração Yamioo", sub: "Logística & entregas", state: "ASSINADO" },
  { title: "Modelo de adesão de validador", sub: "Template para novas jurisdições", state: "MODELO" },
];

export function ContractDownloadsScreen() {
  return (
    <DocsChrome url="afroloc.ao/admin/contracts" topActive="documentsHub" side="contractDownloads">
      <div style={{ padding: "34px 40px", maxWidth: 820 }}>
        <h1 style={{ font: "800 28px 'Playfair Display', serif", color: "#1A1814", margin: 0 }}>Contratos &amp; acordos</h1>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "10px 0 0", lineHeight: 1.55 }}>
          Modelos e acordos assinados entre o AFROLOC, autoridades e parceiros.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 24 }}>
          {CONTRACTS.map((c) => {
            const signed = c.state === "ASSINADO";
            return (
              <div key={c.title} style={{ display: "flex", alignItems: "center", gap: 15, background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 14, padding: "16px 18px" }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: "#FBF2DC", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 15px Inter", color: "#1A1814" }}>{c.title}</div>
                  <div style={{ font: "400 12.5px Inter", color: "#8A8073", marginTop: 2 }}>{c.sub}</div>
                </div>
                <span style={{ font: "700 9px Inter", letterSpacing: ".06em", color: signed ? "#2F7A57" : "#8A8073", background: signed ? "#EBF1ED" : "#EFE7DA", borderRadius: 6, padding: "4px 8px" }}>{c.state}</span>
                <button style={{ border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 11, padding: "8px 14px", font: "700 12px Inter", color: "#1A1814", cursor: "pointer" }}>Descarregar PDF</button>
              </div>
            );
          })}
        </div>
      </div>
    </DocsChrome>
  );
}
