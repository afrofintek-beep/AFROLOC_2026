import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader, SEV, StatGrid } from "./adminUi";

const FLAGS = [
  { id: "f1", code: "AO-LUA-LDA-MAI-CEN-G10-X6B14-Y49J3-0001", sev: "CRÍTICO" as const, reason: "GPS spoofing · posição a 3,2 km das antenas" },
  { id: "f2", code: "AO-LUA-VIA-ZAN-GEN-G10-X6D17-Y49Q8-0001", sev: "CRÍTICO" as const, reason: "Mesma testemunha em 14 moradas" },
  { id: "f3", code: "AO-BEN-LBT-GEN-COM-G10-X5K45-Y48U2-0001", sev: "MÉDIO" as const, reason: "Foto reutilizada noutro registo" },
];

const ACTIONS = ["Ignorar", "Suspender", "Investigar"];

export function FraudFlagsScreen() {
  const navigate = useNavigate();
  const [done, setDone] = useState<Record<string, string>>({});

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Sinalizações de fraude" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <StatGrid items={[{ v: "2", l: "críticas", tone: "danger" }, { v: "5", l: "médias", tone: "warn" }, { v: "38", l: "resolvidas", tone: "green" }]} />

        <div style={{ font: "700 14px Inter", color: DARK.fg }}>A rever</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {FLAGS.map((f) => {
            const sev = SEV[f.sev];
            return (
              <div key={f.id} style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderLeft: `4px solid ${sev.fg}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ font: "700 13px 'Space Mono'", color: DARK.fg }}>{f.code}</span>
                  <span style={{ font: "700 9px Inter", letterSpacing: ".06em", color: sev.fg, background: sev.bg, borderRadius: 6, padding: "3px 7px" }}>{f.sev}</span>
                </div>
                <div style={{ font: "400 12px Inter", color: DARK.muted, marginTop: 6, lineHeight: 1.4 }}>{f.reason}</div>
                {done[f.id] ? (
                  <div style={{ font: "600 11px Inter", color: DARK.gold, marginTop: 10, textAlign: "right" }}>{done[f.id]}</div>
                ) : (
                  <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                    {ACTIONS.map((a) => (
                      <button key={a} onClick={() => setDone((d) => ({ ...d, [f.id]: a === "Ignorar" ? "Ignorado" : a === "Suspender" ? "Suspenso" : "Em investigação" }))} style={{ flex: 1, border: `1.5px solid ${a === "Investigar" ? "transparent" : DARK.line}`, background: a === "Investigar" ? DARK.danger : "transparent", borderRadius: 10, height: 36, font: "700 11px Inter", color: a === "Investigar" ? DARK.fg : DARK.muted, cursor: "pointer" }}>{a}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PhoneChrome>
  );
}
