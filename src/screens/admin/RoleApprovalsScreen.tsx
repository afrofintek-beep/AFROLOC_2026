import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { Avatar, DARK, DarkBackHeader, StatGrid } from "./adminUi";

const PENDING = [
  { id: "p1", initials: "JM", name: "Joana Miguel", role: "Administrador Comunal (N2) · Catete" },
  { id: "p2", initials: "PL", name: "Pedro Lemos", role: "Validador Regional · Quenguela" },
  { id: "p3", initials: "AF", name: "Ana Fonseca", role: "Operador de campo · Ramiros" },
];

export function RoleApprovalsScreen() {
  const navigate = useNavigate();
  const [decided, setDecided] = useState<Record<string, "ok" | "no">>({});

  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="Aprovação de funções" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <StatGrid items={[{ v: "3", l: "pendentes", tone: "warn" }, { v: "12", l: "aprovadas (mês)", tone: "green" }, { v: "1", l: "recusadas", tone: "danger" }]} />

        <div style={{ font: "700 14px Inter", color: DARK.fg }}>Pedidos pendentes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {PENDING.map((p) => (
            <div key={p.id} style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={p.initials} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 13.5px Inter", color: DARK.fg }}>{p.name}</div>
                  <div style={{ font: "400 11.5px Inter", color: DARK.muted, marginTop: 1 }}>{p.role}</div>
                </div>
              </div>
              {decided[p.id] ? (
                <div style={{ font: "600 11px Inter", color: decided[p.id] === "ok" ? DARK.green : DARK.danger, marginTop: 10, textAlign: "right" }}>
                  {decided[p.id] === "ok" ? "Aprovado" : "Recusado"}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => setDecided((d) => ({ ...d, [p.id]: "no" }))} style={{ flex: 1, border: `1.5px solid ${DARK.line}`, background: "transparent", borderRadius: 11, height: 38, font: "700 12px Inter", color: DARK.danger, cursor: "pointer" }}>Recusar</button>
                  <button onClick={() => setDecided((d) => ({ ...d, [p.id]: "ok" }))} style={{ flex: 1, border: "none", background: DARK.greenDeep, borderRadius: 11, height: 38, font: "700 12px Inter", color: DARK.fg, cursor: "pointer" }}>Aprovar</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ font: "400 12px Inter", color: DARK.muted, lineHeight: 1.45, margin: 0 }}>
          Só pode aprovar funções de nível inferior ao seu (Nível 5) e dentro da sua jurisdição.
        </p>
      </div>
    </PhoneChrome>
  );
}
