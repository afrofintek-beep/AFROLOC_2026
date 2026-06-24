import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";

// Sober screen — register a household member's death. No gold accents.
export function DeceasedScreen() {
  const navigate = useNavigate();
  const [date, setDate] = useState("18/10/2026");
  const [cert, setCert] = useState("OB-2026-30142");
  const [done, setDone] = useState(false);

  const valid = !!date.trim() && !!cert.trim();

  return (
    <PhoneChrome bg="#EFEAE2">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#3a352e" }}>Registar óbito</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* member (sober) */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#F6F2EB", border: "1px solid #E2DCD0", borderRadius: 16, padding: "14px 16px" }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", flex: "none", background: "#E2DCD0", color: "#6b6358", display: "flex", alignItems: "center", justifyContent: "center", font: "700 15px Inter" }}>
            JC
          </span>
          <div>
            <div style={{ font: "700 15px Inter", color: "#3a352e" }}>Joaquim Cardoso</div>
            <div style={{ font: "400 12.5px Inter", color: "#8A8073", marginTop: 2 }}>Progenitor do titular · 78 anos</div>
          </div>
        </div>

        <Field label="Data do óbito">
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="dd/mm/aaaa" style={inputStyle} />
        </Field>

        <Field label="Nº da certidão de óbito">
          <input value={cert} onChange={(e) => setCert(e.target.value)} style={{ ...inputStyle, fontFamily: "'Space Mono'" }} />
        </Field>

        {/* attached PDF */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#F6F2EB", border: "1px solid #E2DCD0", borderRadius: 13, padding: "12px 14px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2h9l5 5v15H6z" />
            <path d="M14 2v6h6" />
          </svg>
          <span style={{ flex: 1, font: "600 12.5px Inter", color: "#3a352e" }}>certidao_obito.pdf</span>
          <span style={{ font: "600 11px Inter", color: "#6b8f78" }}>anexada</span>
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.5, margin: 0 }}>
          O membro é retirado da base ativa e do agregado, mantido em histórico, e a alteração é comunicada ao
          recenseamento populacional. Se for titular, o agregado deve indicar novo titular.
        </p>

        {done && <div style={{ font: "600 12px Inter", color: "#6b6358", textAlign: "center" }}>Óbito registado · agregado actualizado</div>}

        <div style={{ paddingTop: 2 }}>
          <button
            disabled={!valid || done}
            onClick={() => setDone(true)}
            style={{
              width: "100%",
              height: 54,
              borderRadius: 15,
              border: "none",
              background: !valid || done ? "#D9D2C6" : "#3a352e",
              color: !valid || done ? "#8A8073" : "#F5F0E8",
              font: "700 15px Inter",
              cursor: !valid || done ? "not-allowed" : "pointer",
            }}
          >
            {done ? "Óbito registado" : "Confirmar registo de óbito"}
          </button>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 48,
  boxSizing: "border-box" as const,
  borderRadius: 13,
  border: "1.5px solid #E2DCD0",
  background: "#F6F2EB",
  padding: "0 13px",
  font: "600 14px Inter",
  color: "#3a352e",
  outline: "none",
};

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #E2DCD0",
  background: "#F6F2EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;
