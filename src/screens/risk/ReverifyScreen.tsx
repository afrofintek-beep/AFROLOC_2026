import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton, Pill } from "../../components/ui/primitives";
import { LiveMap } from "../../components/ui/LiveMap";
import { primaryAddress } from "../../data/account";
import { cellForCoords } from "../../lib/qgsq";

const CHECKS = [
  { id: "resides", label: "Continuo a residir nesta morada", required: true },
  { id: "located", label: "Localização confirmada no terreno", required: true },
  { id: "photo", label: "Foto actualizada (opcional)", required: false },
];

export function ReverifyScreen() {
  const navigate = useNavigate();
  const a = primaryAddress;
  const [done, setDone] = useState<Record<string, boolean>>({ resides: true, located: true });

  const cell = cellForCoords(-8.899, 13.205, 10);
  const requiredMet = CHECKS.filter((c) => c.required).every((c) => done[c.id]);

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Verificação periódica</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* due banner */}
        <div style={{ background: "#F4EAD6", borderRadius: 14, padding: "13px 15px", font: "500 13px Inter", color: "#7C6A4A", lineHeight: 1.45 }}>
          A sua morada <strong style={{ fontFamily: "'Space Mono'", color: "#B0831F" }}>{a.code}</strong> vence verificação em{" "}
          <strong style={{ color: "#B0831F" }}>7 dias</strong>.
        </div>

        <div style={{ position: "relative" }}>
          <LiveMap lat={-8.899} lng={13.205} accuracy={4} cell={cell} height={150} />
          <div style={{ position: "absolute", left: 12, top: 12, zIndex: 500 }}>
            <Pill label="GPS recapturado · ±4m" tone="green" />
          </div>
        </div>

        {/* checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {CHECKS.map((c) => {
            const on = !!done[c.id];
            return (
              <button
                key={c.id}
                onClick={() => setDone((d) => ({ ...d, [c.id]: !d[c.id] }))}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#FFFDF9",
                  border: on ? "1.5px solid #2F7A57" : "1.5px solid #EAE3D7",
                  borderRadius: 14,
                  padding: "13px 14px",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    flex: "none",
                    background: on ? "#2F7A57" : "#F0EADE",
                    border: on ? "none" : "1.5px solid #E6DCCC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {on && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </span>
                <span style={{ font: "500 13.5px Inter", color: "#1A1814" }}>{c.label}</span>
              </button>
            );
          })}
        </div>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Endereço completo · ciclo de {a.cycleMonths} meses. Após confirmação a próxima verificação passa para{" "}
          <strong style={{ color: "#1A1814" }}>Abr 2027</strong>.
        </p>

        <div style={{ paddingTop: 4 }}>
          <PrimaryButton disabled={!requiredMet} onClick={() => navigate("/detail")}>
            Confirmar verificação
          </PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid #EAE3D7",
  background: "#FFFDF9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;
