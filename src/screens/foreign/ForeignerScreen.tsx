import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";
import { useCreateFlow } from "../../state/createFlow";

// Nacionalidades mais comuns entre residentes estrangeiros em Angola (+ "Outra").
const NATIONALITIES = [
  "Portuguesa", "Brasileira", "Chinesa", "Cubana", "Congolesa (RDC)", "Congolesa (Rep.)",
  "Sul-africana", "Namibiana", "Zambiana", "Nigeriana", "Guineense (Guiné-Bissau)",
  "Cabo-verdiana", "São-tomense", "Moçambicana", "Francesa", "Espanhola", "Italiana",
  "Britânica", "Alemã", "Libanesa", "Indiana", "Norte-americana", "Outra",
];

const PERMIT_TYPES = [
  "Visto de trabalho", "Visto de residência", "Cartão de residente",
  "Autorização de residência", "Visto de estudante", "Outro",
];

export function ForeignerScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const f = draft.foreigner;
  const set = (value: Partial<NonNullable<typeof f>>) => dispatch({ type: "setForeigner", value });

  const complete = !!(
    f?.nationality && f?.passportNumber?.trim() && f?.passportExpiry &&
    f?.permitType && f?.permitNumber?.trim() && f?.permitValidUntil
  );

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
          <div style={selectWrap}>
            <select value={f?.nationality ?? ""} onChange={(e) => set({ nationality: e.target.value })} style={selectEl}>
              <option value="" disabled>Selecione a nacionalidade</option>
              {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <Chevron />
          </div>
        </Field>

        {/* passport card (introdução manual) */}
        <Field label="Passaporte">
          <div style={{ background: "#1A1814", borderRadius: 16, padding: 16, color: "#F8F5F0" }}>
            <span style={{ font: "700 11px Inter", letterSpacing: ".12em", color: "#A99E8C" }}>PASSAPORTE</span>
            <input
              value={f?.passportNumber ?? ""}
              onChange={(e) => set({ passportNumber: e.target.value.toUpperCase() })}
              placeholder="Nº do passaporte"
              style={{ ...darkInput, marginTop: 10, font: "700 18px 'Space Mono'", letterSpacing: ".06em" }}
            />
            <div style={{ font: "500 10px Inter", color: "#A99E8C", textTransform: "uppercase", letterSpacing: ".04em", margin: "12px 0 5px" }}>Válido até</div>
            <input
              type="month"
              value={f?.passportExpiry ?? ""}
              onChange={(e) => set({ passportExpiry: e.target.value })}
              style={{ ...darkInput, font: "600 14px Inter", colorScheme: "dark" }}
            />
          </div>
        </Field>

        {/* residence permit */}
        <Field label="Autorização de residência">
          <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={selectWrap}>
              <select value={f?.permitType ?? ""} onChange={(e) => set({ permitType: e.target.value })} style={selectEl}>
                <option value="" disabled>Tipo de autorização</option>
                {PERMIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Chevron />
            </div>
            <input
              value={f?.permitNumber ?? ""}
              onChange={(e) => set({ permitNumber: e.target.value.toUpperCase() })}
              placeholder="Nº da autorização"
              style={lightInput}
            />
            <div>
              <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>Validade</div>
              <input
                type="date"
                value={f?.permitValidUntil ?? ""}
                onChange={(e) => set({ permitValidUntil: e.target.value })}
                style={lightInput}
              />
            </div>
          </div>
        </Field>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: "16px 0 0" }}>
          A validade da sua AFROLOC e da declaração de residência acompanha a autorização de residência.
        </p>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => complete && navigate("/lease")} disabled={!complete}>Continuar</PrimaryButton>
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
      <path d="M6 9l6 6 6-6" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const selectWrap = { position: "relative" } as const;
const selectEl = {
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
  width: "100%",
  background: "#FFFDF9",
  border: "1.5px solid #EAE3D7",
  borderRadius: 13,
  padding: "14px 38px 14px 14px",
  font: "700 14px Inter",
  color: "#1A1814",
  outline: "none",
  cursor: "pointer",
} as const;
const lightInput = {
  width: "100%",
  boxSizing: "border-box" as const,
  background: "#FFFFFF",
  border: "1.5px solid #EAE3D7",
  borderRadius: 12,
  padding: "12px 14px",
  font: "600 14px Inter",
  color: "#1A1814",
  outline: "none",
} as const;
const darkInput = {
  width: "100%",
  boxSizing: "border-box" as const,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #3A342B",
  padding: "4px 0",
  color: "#F8F5F0",
  outline: "none",
} as const;
