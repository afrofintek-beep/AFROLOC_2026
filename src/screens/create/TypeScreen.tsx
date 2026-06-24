import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";
import { useCreateFlow } from "../../state/createFlow";
import type { AddressType } from "../../state/types";
import { nextStep } from "./flow";

interface Option {
  value: AddressType;
  title: string;
  desc: string;
  meta: string;
  icon: JSX.Element;
}

const OPTIONS: Option[] = [
  {
    value: "formal",
    title: "Formal",
    desc: "Tem nome de rua e número.",
    meta: "2 testemunhas · verif. 6 meses",
    icon: <HouseIcon />,
  },
  {
    value: "informal",
    title: "Informal",
    desc: "Bairro sem ruas nem números. Use pontos de referência e a grelha QGSQ.",
    meta: "3 testemunhas · verif. 3 meses",
    icon: <HutIcon />,
  },
  {
    value: "digital",
    title: "Digital",
    desc: "Apenas coordenadas e código AFROLOC.",
    meta: "2 testemunhas",
    icon: <PinIcon />,
  },
];

export function TypeScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();

  return (
    <PhoneChrome>
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={1} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "20px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>
          Que tipo de morada?
        </h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>
          O tipo define como a morada é descrita e validada.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
          {OPTIONS.map((o) => {
            const selected = draft.type === o.value;
            return (
              <button
                key={o.value}
                onClick={() => dispatch({ type: "setType", value: o.value })}
                style={{
                  textAlign: "left",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: 16,
                  borderRadius: 18,
                  cursor: "pointer",
                  background: selected ? "#FBF2DC" : "#FFFDF9",
                  border: selected ? "2px solid #D4A853" : "1.5px solid #EAE3D7",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    flex: "none",
                    background: selected ? "#F4E4BE" : "#F0EADE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {o.icon}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ font: "700 16px Inter", color: "#1A1814", display: "block" }}>{o.title}</span>
                  <span style={{ font: "400 13px Inter", color: "#8A8073", display: "block", marginTop: 3, lineHeight: 1.4 }}>
                    {o.desc}
                  </span>
                  <span style={{ font: "700 12px 'Space Mono'", color: "#B0831F", display: "block", marginTop: 8 }}>
                    {o.meta}
                  </span>
                </span>
                {selected && (
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#D4A853",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <path d="M5 12l5 5L20 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            background: "#F4EAD6",
            borderRadius: 14,
            padding: "12px 14px",
            font: "400 12px Inter",
            color: "#7C6A4A",
            lineHeight: 1.45,
          }}
        >
          Em muitos bairros africanos não existe rua nem número — o tipo{" "}
          <strong style={{ color: "#B0831F" }}>Informal</strong> foi feito para isso.
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => navigate("/" + nextStep("type", draft.type))}>Continuar</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function HouseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}
function HutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l9-7 9 7" />
      <path d="M5 11v8h14v-8" />
      <path d="M9 19v-5h6v5" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0831F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
