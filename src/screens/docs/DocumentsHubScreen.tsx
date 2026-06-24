import { useNavigate } from "react-router-dom";
import { DocsChrome } from "../../components/ui/DocsChrome";

const CARDS = [
  { title: "Manual de apoio", desc: "Guia completo do cidadão, testemunha e validador.", tag: "PDF · 48 pág.", to: "/manualDownload" },
  { title: "Políticas & termos", desc: "Privacidade, uso de dados e termos de serviço.", tag: "PDF · público", to: "/contractDownloads" },
  { title: "Sistema de grelha QGSQ", desc: "Especificação técnica do código e da grelha.", tag: "PDF · técnico", to: "/gridSystemPdf" },
  { title: "Documentação de PI", desc: "Patente, marca, segredo comercial e direito de autor.", tag: "Confidencial", to: "/ipDocumentation" },
];

export function DocumentsHubScreen() {
  const navigate = useNavigate();
  return (
    <DocsChrome url="afroloc.ao/docs" topActive="documentsHub" side="documentsHub">
      <div style={{ padding: "34px 40px" }}>
        <div style={{ font: "700 11px Inter", letterSpacing: ".16em", color: "#B0831F" }}>CENTRO DE DOCUMENTOS</div>
        <h1 style={{ font: "800 30px 'Playfair Display', serif", color: "#1A1814", margin: "12px 0 0" }}>Tudo o que precisa para entender o AFROLOC</h1>
        <p style={{ font: "400 15px Inter", color: "#8A8073", margin: "10px 0 0", maxWidth: 680, lineHeight: 1.55 }}>
          Manuais, políticas, especificações técnicas e documentação de propriedade intelectual — públicos e para administradores.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 26, maxWidth: 820 }}>
          {CARDS.map((c) => (
            <button key={c.title} onClick={() => navigate(c.to)} style={{ all: "unset", cursor: "pointer", background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 16, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FBF2DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></svg>
                </span>
                <span style={{ font: "600 10px 'Space Mono'", color: "#8A8073" }}>{c.tag}</span>
              </div>
              <div style={{ font: "700 16px Inter", color: "#1A1814", marginTop: 14 }}>{c.title}</div>
              <div style={{ font: "400 13px Inter", color: "#8A8073", marginTop: 7, lineHeight: 1.5 }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </DocsChrome>
  );
}
