import { useState } from "react";
import { WebChrome } from "../../components/ui/WebChrome";

const DETAILS = [
  { label: "Email", value: "suporte@afroloc.ao", icon: mailIcon },
  { label: "Telefone", value: "+244 923 828 282", icon: phoneIcon },
  { label: "Sede", value: "Luanda, Angola", icon: pinIcon },
];

export function ContactScreen() {
  const [name, setName] = useState("Ana Cardoso");
  const [email, setEmail] = useState("ana@email.ao");
  const [msg, setMsg] = useState("Gostaria de saber como aderir como autoridade municipal…");
  const [sent, setSent] = useState(false);

  return (
    <WebChrome url="afroloc.ao/contact" active="contact">
      <div style={{ background: "#F8F5F0", minHeight: "100%", padding: "50px 60px 56px", display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 44 }}>
        <div>
          <h1 style={{ font: "800 36px 'Playfair Display', serif", color: "#1A1814", margin: 0 }}>Fale connosco</h1>
          <p style={{ font: "400 15px Inter", color: "#8A8073", margin: "12px 0 0", lineHeight: 1.6 }}>Cidadãos, autoridades e parceiros — estamos aqui para ajudar.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
            {DETAILS.map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: "#FBF2DC", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{d.icon()}</span>
                <div>
                  <div style={{ font: "500 11px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em" }}>{d.label}</div>
                  <div style={{ font: "700 14px Inter", color: "#1A1814", marginTop: 2 }}>{d.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 20, padding: 28 }}>
          <Field label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Field>
          <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></Field>
          <Field label="Mensagem"><textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} style={{ ...inputStyle, height: "auto", padding: 12, resize: "none", lineHeight: 1.5 }} /></Field>
          {sent && <div style={{ font: "600 12px Inter", color: "#2F7A57", marginTop: 12 }}>Mensagem enviada · responderemos por email.</div>}
          <button onClick={() => setSent(true)} style={{ border: "none", width: "100%", height: 50, borderRadius: 14, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", marginTop: 18 }}>
            {sent ? "Enviada" : "Enviar mensagem"}
          </button>
        </div>
      </div>
    </WebChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 46,
  boxSizing: "border-box" as const,
  borderRadius: 12,
  border: "1.5px solid #EAE3D7",
  background: "#FFFDF9",
  padding: "0 13px",
  font: "500 14px Inter",
  color: "#1A1814",
  outline: "none",
};

function mailIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>; }
function phoneIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>; }
function pinIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>; }
