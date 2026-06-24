import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton, GhostButton } from "../../components/ui/primitives";
import { useCreateFlow } from "../../state/createFlow";
import { nextStep } from "./flow";

const FLOORS = ["P6", "P5", "P4", "P3", "P2", "R/C"];
const BLOCOS = ["A", "B", "C"];

export function BuildingScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const b = draft.building ?? { bloco: "B", piso: "4", fracao: "04E" };

  function set(patch: Partial<typeof b>) {
    dispatch({ type: "setBuilding", value: { ...b, ...patch } });
  }
  function pisoDelta(d: number) {
    const n = Math.max(0, Math.min(6, (parseInt(b.piso, 10) || 0) + d));
    set({ piso: String(n) });
  }

  const fracaoSuffix = `${b.bloco}·P${b.piso}·${b.fracao}`;

  return (
    <PhoneChrome>
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={4} total={6} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "20px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>
          Apartamento em prédio
        </h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0" }}>
          Várias frações partilham a mesma célula QGSQ. Indique a sua.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <div
            style={{
              width: 92,
              flex: "none",
              background: "#FFFDF9",
              border: "1.5px solid #EAE3D7",
              borderRadius: 14,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {FLOORS.map((f) => {
              const on = `P${b.piso}` === f || (f === "R/C" && b.piso === "0");
              return (
                <div
                  key={f}
                  style={{
                    height: 28,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    font: "700 12px 'Space Mono'",
                    background: on ? "var(--afl-grad-glow)" : "#F0EADE",
                    color: on ? "#2D2519" : "#8A8073",
                  }}
                >
                  {f}
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <Group label="Bloco">
              <div style={{ display: "flex", gap: 8 }}>
                {BLOCOS.map((x) => (
                  <Toggle key={x} active={b.bloco === x} onClick={() => set({ bloco: x })}>
                    {x}
                  </Toggle>
                ))}
              </div>
            </Group>

            <Group label="Piso / andar">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Stepper onClick={() => pisoDelta(-1)}>–</Stepper>
                <span style={{ font: "700 18px 'Space Mono'", color: "#1A1814", minWidth: 24, textAlign: "center" }}>
                  {b.piso}
                </span>
                <Stepper onClick={() => pisoDelta(1)}>+</Stepper>
              </div>
            </Group>

            <Group label="Porta / fração">
              <input
                value={b.fracao}
                onChange={(e) => set({ fracao: e.target.value })}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 11,
                  border: "1.5px solid #EAE3D7",
                  background: "#FFFDF9",
                  padding: "0 12px",
                  font: "700 14px 'Space Mono'",
                  color: "#1A1814",
                  outline: "none",
                }}
              />
            </Group>
          </div>
        </div>

        <div style={{ marginTop: 16, background: "#1A1814", borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#A99E8C", textTransform: "uppercase" }}>
            AFROLOC · fração
          </div>
          <div style={{ font: "700 13px 'Space Mono'", color: "#E8C97A", marginTop: 4, wordBreak: "break-all", lineHeight: 1.3 }}>
            AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001 <span style={{ color: "#5BC48E" }}>{fracaoSuffix}</span>
          </div>
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", margin: "12px 0 0", lineHeight: 1.45 }}>
          1 célula QGSQ · até dezenas de frações. As testemunhas são vizinhos do mesmo piso.
        </p>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6, display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton onClick={() => navigate("/" + nextStep("building", draft.type))}>Continuar</PrimaryButton>
          <GhostButton onClick={() => navigate("/buildingDir")}>Ver edifício</GhostButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: 40,
        borderRadius: 11,
        cursor: "pointer",
        font: "700 14px Inter",
        background: active ? "#FBF2DC" : "#FFFDF9",
        border: active ? "2px solid #D4A853" : "1.5px solid #EAE3D7",
        color: "#1A1814",
      }}
    >
      {children}
    </button>
  );
}

function Stepper({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 11,
        border: "1.5px solid #EAE3D7",
        background: "#FFFDF9",
        font: "700 20px Inter",
        color: "#1A1814",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
