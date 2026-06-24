import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";
import { useCreateFlow } from "../../state/createFlow";
import { nextStep } from "./flow";

export function InformalScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const [newLandmark, setNewLandmark] = useState("");

  function addLandmark() {
    const label = newLandmark.trim();
    if (!label) return;
    dispatch({ type: "addLandmark", value: { id: "lm" + Date.now(), label } });
    setNewLandmark("");
  }

  return (
    <PhoneChrome>
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={3} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "20px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>
          Pontos de referência
        </h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>
          Sem rua nem número, descreva como chegar a partir de marcos visíveis.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            background: "#FFFDF9",
            border: "1.5px solid #EAE3D7",
            borderRadius: 14,
            padding: "13px 15px",
            cursor: "pointer",
          }}
        >
          <span style={{ font: "600 14px Inter", color: "#1A1814" }}>Casa sem número</span>
          <Switch on={draft.noNumber} onClick={() => dispatch({ type: "setNoNumber", value: !draft.noNumber })} />
        </label>

        <Field label="Descrição da chegada">
          <textarea
            value={draft.arrivalDescription}
            onChange={(e) => dispatch({ type: "setArrival", value: e.target.value })}
            rows={3}
            style={{
              width: "100%",
              resize: "none",
              borderRadius: 13,
              border: "1.5px solid #EAE3D7",
              background: "#FFFDF9",
              padding: 12,
              font: "400 14px Inter",
              color: "#1A1814",
              lineHeight: 1.45,
              outline: "none",
            }}
          />
        </Field>

        <Field label="Marcos próximos">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {draft.landmarks.map((l) => (
              <span
                key={l.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#F0EADE",
                  borderRadius: 11,
                  padding: "7px 10px 7px 12px",
                  font: "600 12px Inter",
                  color: "#1A1814",
                }}
              >
                {l.label}
                <button
                  onClick={() => dispatch({ type: "removeLandmark", id: l.id })}
                  aria-label={`Remover ${l.label}`}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "#8A8073", font: "700 14px Inter", lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <div style={{ display: "inline-flex", gap: 6 }}>
              <input
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLandmark()}
                placeholder="Adicionar"
                style={{
                  height: 32,
                  width: 110,
                  borderRadius: 11,
                  border: "1.5px dashed #D4A853",
                  background: "transparent",
                  padding: "0 10px",
                  font: "600 12px Inter",
                  color: "#1A1814",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </Field>

        <Field label="Foto da entrada">
          <button
            onClick={() => dispatch({ type: "setEntryPhoto", value: !draft.hasEntryPhoto })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#FFFDF9",
              border: draft.hasEntryPhoto ? "1.5px solid #2F7A57" : "1.5px dashed #E6DCCC",
              borderRadius: 14,
              padding: "13px 15px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 11,
                background: draft.hasEntryPhoto ? "#EBF1ED" : "#F0EADE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={draft.hasEntryPhoto ? "#2F7A57" : "#8A8073"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
                <circle cx="12" cy="13" r="3.2" />
              </svg>
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ font: "600 13px Inter", color: "#1A1814", display: "block" }}>
                {draft.hasEntryPhoto ? "Foto adicionada" : "Adicionar foto"}
              </span>
              <span style={{ font: "400 12px Inter", color: "#8A8073", display: "block", marginTop: 2 }}>
                Ajuda testemunhas e estafetas a reconhecer a casa.
              </span>
            </span>
            <span style={{ font: "700 10px 'Space Mono'", color: "#2F7A57", whiteSpace: "nowrap" }}>GPS + EXIF</span>
          </button>
        </Field>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => navigate("/" + nextStep("informal", draft.type))}>Continuar</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        border: "none",
        background: on ? "#2F7A57" : "#E6DCCC",
        position: "relative",
        cursor: "pointer",
        transition: "background .15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .15s",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}
