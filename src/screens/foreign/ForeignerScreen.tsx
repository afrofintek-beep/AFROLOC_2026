import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";

export function ForeignerScreen() {
  const navigate = useNavigate();

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={1} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "16px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#B0831F" }}>RESIDENTE ESTRANGEIRO</div>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "6px 0 0", letterSpacing: "-.01em" }}>Residência em Angola</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>
          Identifique-se com o passaporte e a autorização de residência.
        </p>

        <Field label="Nacionalidade">
          <div style={fieldBox}>
            <span style={{ font: "700 14px Inter", color: "#1A1814" }}>🇵🇹 Portuguesa</span>
            <Chevron />
          </div>
        </Field>

        {/* passport card */}
        <Field label="Passaporte">
          <div style={{ background: "#1A1814", borderRadius: 16, padding: 16, color: "#F8F5F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: "700 11px Inter", letterSpacing: ".12em", color: "#A99E8C" }}>PASSAPORTE</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "700 9px Inter", color: "#7FD3A6", background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 7, padding: "3px 8px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7FD3A6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                MRZ LIDO
              </span>
            </div>
            <div style={{ font: "700 18px 'Space Mono'", marginTop: 12, letterSpacing: ".06em" }}>P&lt;PRT CA928374</div>
            <div style={{ font: "400 12px Inter", color: "#A99E8C", marginTop: 8 }}>Válido até 03/2029</div>
          </div>
        </Field>

        {/* residence permit */}
        <Field label="Autorização de residência">
          <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ font: "700 14px Inter", color: "#1A1814" }}>Visto de trabalho · nº 2026-44871</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "#F4EAD6", borderRadius: 18, padding: "5px 11px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D99A3A" }} />
              <span style={{ font: "600 11.5px Inter", color: "#B98421" }}>Validade: 12 Jan 2027</span>
            </div>
          </div>
        </Field>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: "16px 0 0" }}>
          A validade da sua AFROLOC e da declaração de residência acompanha a autorização de residência.
        </p>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => navigate("/lease")}>Continuar</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

const fieldBox = {
  background: "#FFFDF9",
  border: "1.5px solid #EAE3D7",
  borderRadius: 13,
  padding: "14px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as const;
