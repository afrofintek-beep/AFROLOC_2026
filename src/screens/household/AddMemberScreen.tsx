import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton } from "../../components/ui/primitives";
import { HOUSEHOLD_MAX, RELATIONSHIP_LABEL, members, type Relationship } from "../../data/household";

const CHIPS: Relationship[] = ["conjuge", "filho", "progenitor", "irmao", "outro"];

// Age from a dd/mm/yyyy birth date, relative to the reference "today".
function ageFromDob(dob: string, today = new Date("2026-06-23")): number | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dob.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const birth = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const before = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (before) age--;
  return age >= 0 && age < 130 ? age : null;
}

export function AddMemberScreen() {
  const navigate = useNavigate();
  const [rel, setRel] = useState<Relationship>("filho");
  const [name, setName] = useState("Lúcia Cardoso");
  const [dob, setDob] = useState("14/03/2014");
  const [doc, setDoc] = useState("Cédula pessoal");
  const [minor, setMinor] = useState(true);

  const age = useMemo(() => ageFromDob(dob), [dob]);
  const full = members.length >= HOUSEHOLD_MAX;
  const valid = !!name.trim() && age != null && !full;

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Adicionar membro</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Relação com o titular">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CHIPS.map((c) => {
              const on = rel === c;
              return (
                <button
                  key={c}
                  onClick={() => setRel(c)}
                  style={{ border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", background: on ? "#FBF2DC" : "#FFFDF9", borderRadius: 11, padding: "8px 13px", font: `${on ? 700 : 600} 12.5px Inter`, color: "#1A1814", cursor: "pointer" }}
                >
                  {RELATIONSHIP_LABEL[c]}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Nome completo">
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 2 }}>
            <Field label="Data de nascimento">
              <input value={dob} onChange={(e) => setDob(e.target.value)} placeholder="dd/mm/aaaa" style={inputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Idade">
              <div style={{ ...inputStyle, display: "flex", alignItems: "center", font: "700 16px 'Space Mono'", color: age == null ? "#A99E8C" : "#1A1814" }}>
                {age ?? "—"}
              </div>
            </Field>
          </div>
        </div>

        <Field label="Documento">
          <input value={doc} onChange={(e) => setDoc(e.target.value)} style={inputStyle} />
        </Field>

        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 14, padding: "13px 15px", cursor: "pointer" }}>
          <span style={{ font: "600 14px Inter", color: "#1A1814" }}>Menor / dependente</span>
          <Switch on={minor} onClick={() => setMinor((v) => !v)} />
        </label>

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Agregado: <strong style={{ color: "#1A1814" }}>1–{HOUSEHOLD_MAX} membros</strong>. Atual: {members.length}. Menores são ligados ao titular até terem documento próprio.
        </p>

        <div style={{ paddingTop: 2 }}>
          <PrimaryButton disabled={!valid} onClick={() => navigate("/householdCensus")}>
            {full ? "Limite de 15 atingido" : "Adicionar ao agregado"}
          </PrimaryButton>
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
  border: "1.5px solid #EAE3D7",
  background: "#FFFDF9",
  padding: "0 13px",
  font: "600 14px Inter",
  color: "#1A1814",
  outline: "none",
};

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: on ? "#2F7A57" : "#E6DCCC", position: "relative", cursor: "pointer" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </button>
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
