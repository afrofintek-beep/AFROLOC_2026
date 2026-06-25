import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton, Pill } from "../../components/ui/primitives";
import { useCreateFlow } from "../../state/createFlow";
import { useCitizenData } from "../../state/citizenData";
import { requiredWitnesses } from "../../state/types";
import { createAfrolocAddress } from "../../lib/afroloc/createAddress";
import { adminCodesFor } from "../../lib/afroloc/admin";
import { nextStep } from "./flow";

export function WitnessesScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const { saveGenerated } = useCitizenData();
  const required = requiredWitnesses(draft.type);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const added = draft.witnesses.length;
  const canSend = added >= required;

  function addWitness() {
    const suffix = code.trim().toUpperCase();
    if (suffix.length < 3) return;
    dispatch({
      type: "addWitness",
      value: {
        id: "w" + Date.now(),
        name: "Vizinho por confirmar",
        afrolocCode: "AO-LUA-" + suffix,
        distanceM: 300 + Math.round(suffix.length * 17),
        status: "awaiting",
      },
    });
    setCode("");
  }

  // Show optional placeholder slots up to required + 1.
  const optionalSlots = Math.max(0, required + 1 - added);

  // Run the full AFROLOC creation pipeline (spec §1) and carry the result.
  function submit() {
    const confirmed = draft.witnesses.filter((w) => w.status === "confirmed").length;
    const now = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // fresh EXIF
    const result = createAfrolocAddress({
      latitude: draft.coords.lat,
      longitude: draft.coords.lng,
      accuracy: draft.coords.accuracy,
      countryCode: draft.division.countryIso,
      zone: draft.cell.sizeM <= 10 ? "urban" : "rural",
      admin: adminCodesFor(draft.division),
      registrationType: draft.type === "digital" ? "digital" : "formal",
      photoMetadata: draft.hasEntryPhoto
        ? { exifLat: draft.coords.lat, exifLon: draft.coords.lng, exifTimestamp: now, deviceMake: "AFROLOC", deviceModel: "Field" }
        : undefined,
      hasPhoto: draft.hasEntryPhoto,
      witnessesConfirmed: confirmed,
      witnessesRequired: required,
      validatorConfirmed: false,
      densityCount: 0,
    });
    dispatch({ type: "setGenerated", value: result });
    // Grava na conta do cidadão (quando há backend ligado). Em demo é no-op.
    setSaving(true);
    saveGenerated(result, draft)
      .catch(() => { /* p.ex. código duplicado — segue na mesma com o resultado gerado */ })
      .finally(() => {
        setSaving(false);
        navigate("/" + nextStep("witnesses", draft.type));
      });
  }

  return (
    <PhoneChrome>
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={3} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "20px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>
          Testemunhas
        </h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          Adicione {required} vizinhos com AFROLOC activa, a menos de 1&nbsp;km, para validar a sua morada.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
            background: "#FFFDF9",
            border: "1.5px solid #EAE3D7",
            borderRadius: 14,
            padding: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 4, paddingLeft: 8 }}>
            <span style={{ font: "700 14px 'Space Mono'", color: "#8A8073" }}>AO-LUA-</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWitness()}
              placeholder="____"
              maxLength={6}
              style={{ flex: 1, border: "none", background: "transparent", font: "700 14px 'Space Mono'", color: "#1A1814", outline: "none", width: 60 }}
            />
          </div>
          <button
            onClick={addWitness}
            style={{ border: "none", borderRadius: 10, background: "#1A1814", color: "#E8C97A", font: "700 13px Inter", padding: "0 16px", cursor: "pointer" }}
          >
            Adicionar
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {draft.witnesses.map((w) => (
            <div
              key={w.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#FFFDF9",
                border: w.status === "confirmed" ? "1.5px solid #2F7A57" : "1.5px solid #EAE3D7",
                borderRadius: 16,
                padding: "12px 14px",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flex: "none",
                  background: w.status === "confirmed" ? "#EBF1ED" : "#F4EAD6",
                  color: w.status === "confirmed" ? "#2F7A57" : "#B98421",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: "700 13px Inter",
                }}
              >
                {initials(w.name)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 14px Inter", color: "#1A1814" }}>{w.name}</div>
                <div style={{ font: "500 12px 'Space Mono'", color: "#8A8073", marginTop: 2 }}>
                  {w.afrolocCode} · {w.distanceM}&nbsp;m
                </div>
              </div>
              {w.status === "confirmed" ? (
                <Pill label="Confirmado" tone="green" />
              ) : (
                <button
                  onClick={() => dispatch({ type: "confirmWitness", id: w.id })}
                  style={{ border: "none", background: "#F4EAD6", color: "#B98421", font: "600 11px Inter", borderRadius: 20, padding: "6px 12px", cursor: "pointer" }}
                >
                  A aguardar OTP
                </button>
              )}
            </div>
          ))}

          {Array.from({ length: optionalSlots }).map((_, i) => (
            <div
              key={"opt" + i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "1.5px dashed #E6DCCC",
                borderRadius: 16,
                padding: "12px 14px",
                color: "#A99E8C",
                font: "600 13px Inter",
              }}
            >
              <span style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px dashed #E6DCCC", flex: "none" }} />
              Testemunha {added + i + 1} {added + i + 1 > required ? "(opcional)" : ""}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            background: "#F4EAD6",
            borderRadius: 14,
            padding: "12px 14px",
            font: "400 12px Inter",
            color: "#7C6A4A",
            lineHeight: 1.45,
          }}
        >
          {Math.min(added, required)} de {required} mínimas. Mais testemunhas aumentam o seu ATS.
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton disabled={!canSend || saving} onClick={submit}>
            {saving ? "A guardar…" : "Enviar para validação"}
          </PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
