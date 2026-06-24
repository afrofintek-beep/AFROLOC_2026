import { useState } from "react";
import { WebChrome } from "../../components/ui/WebChrome";

const QA = [
  { q: "Preciso de ter rua e número?", a: "Não. O AFROLOC foi feito precisamente para bairros sem toponímia — usa a grelha QGSQ e pontos de referência." },
  { q: "Quanto custa para o cidadão?", a: "É gratuito para sempre: uma morada pessoal com código, QR e certificado, validada pela comunidade." },
  { q: "Como é validada a minha morada?", a: "Vizinhos com AFROLOC ativa a menos de 1 km confirmam por OTP. Um validador autorizado aprova e calcula o ATS." },
  { q: "Funciona sem internet?", a: "Sim. A captura de campo funciona offline e sincroniza quando houver rede; o código é gerado localmente pelo SDK." },
  { q: "E se eu for estrangeiro ou inquilino?", a: "Há fluxos próprios: passaporte + autorização de residência para estrangeiros, e registo do vínculo com o senhorio para arrendatários." },
];

export function FaqScreen() {
  const [open, setOpen] = useState(0);
  return (
    <WebChrome url="afroloc.ao/faq" active="faq">
      <div style={{ background: "#F8F5F0", minHeight: "100%", padding: "50px 60px 56px" }}>
        <h1 style={{ font: "800 36px 'Playfair Display', serif", color: "#1A1814", margin: 0 }}>Perguntas frequentes</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 30, maxWidth: 760 }}>
          {QA.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} style={{ background: "#FFFFFF", border: `1px solid ${isOpen ? "#D4A853" : "#EAE3D7"}`, borderRadius: 16, overflow: "hidden" }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", width: "100%", boxSizing: "border-box" }}>
                  <span style={{ font: "700 16px Inter", color: "#1A1814" }}>{it.q}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .15s", flex: "none" }}><path d="M12 5v14M5 12h14" /></svg>
                </button>
                {isOpen && <div style={{ padding: "0 22px 20px", font: "400 14.5px Inter", color: "#8A8073", lineHeight: 1.6 }}>{it.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </WebChrome>
  );
}
