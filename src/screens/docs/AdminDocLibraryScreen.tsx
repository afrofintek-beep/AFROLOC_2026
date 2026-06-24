import { useState } from "react";
import { DocsChrome } from "../../components/ui/DocsChrome";

const DOCS = [
  { name: "Manual de apoio v2", tag: "Público · PT", size: "4,2 MB", date: "Jun 2026", cat: "Políticas" },
  { name: "Política de privacidade", tag: "Público", size: "280 KB", date: "Mai 2026", cat: "Políticas" },
  { name: "Especificação QGSQ", tag: "Técnico · restrito", size: "1,8 MB", date: "Abr 2026", cat: "Técnicos" },
  { name: "Relatório de auditoria de PI", tag: "PI · restrito", size: "920 KB", date: "Mar 2026", cat: "PI" },
  { name: "Acordo de licença", tag: "Legal", size: "340 KB", date: "Fev 2026", cat: "PI" },
];

const FILTERS = ["Todos", "Políticas", "Técnicos", "PI"];

export function AdminDocLibraryScreen() {
  const [filter, setFilter] = useState("Todos");
  const rows = filter === "Todos" ? DOCS : DOCS.filter((d) => d.cat === filter);

  return (
    <DocsChrome url="afroloc.ao/admin/docs" topActive="documentsHub" side="adminDocLibrary">
      <div style={{ padding: "34px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ font: "800 28px 'Playfair Display', serif", color: "#1A1814", margin: 0 }}>Biblioteca de documentos</h1>
          <button style={{ border: "none", background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 13px Inter", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>+ Carregar documento</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ border: on ? "none" : "1.5px solid #E6DCCC", borderRadius: 18, padding: "7px 14px", font: `${on ? 700 : 600} 12px Inter`, cursor: "pointer", color: on ? "#2D2519" : "#8A8073", background: on ? "var(--afl-grad-glow)" : "transparent" }}>
                {f}{f === "Todos" ? ` · ${DOCS.length}` : ""}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 18, background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 16, overflow: "hidden", maxWidth: 860 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px 40px", padding: "12px 18px", background: "#F0EADE", font: "700 10px Inter", letterSpacing: ".06em", color: "#8A8073", textTransform: "uppercase" }}>
            <span>Documento</span><span>Tamanho</span><span>Data</span><span />
          </div>
          {rows.map((d, i) => (
            <div key={d.name} style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px 40px", alignItems: "center", padding: "13px 18px", borderTop: i ? "1px solid #EFE7DA" : "none" }}>
              <div>
                <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>{d.name}</div>
                <div style={{ font: "400 11px Inter", color: "#8A8073", marginTop: 2 }}>{d.tag}</div>
              </div>
              <span style={{ font: "600 12px 'Space Mono'", color: "#5C5347" }}>{d.size}</span>
              <span style={{ font: "500 12px Inter", color: "#8A8073" }}>{d.date}</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
            </div>
          ))}
        </div>
      </div>
    </DocsChrome>
  );
}
