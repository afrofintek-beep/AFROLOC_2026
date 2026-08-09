import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";
import { useCreateFlow } from "../../state/createFlow";
import { OCCUPANCY_LABEL, hasLandlord, type Occupancy } from "../../data/tenancy";

const OCCS: Occupancy[] = ["proprietario", "inquilino", "cedencia"];

export function LeaseScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const t = draft.tenancy;
  const set = (value: Partial<typeof t>) => dispatch({ type: "setTenancy", value });
  const setLandlord = (v: Partial<NonNullable<typeof t.landlord>>) =>
    dispatch({ type: "setTenancy", value: { landlord: { name: "", nif: "", ...(t.landlord ?? {}), ...v, confirmed: false } } });

  const needsLandlord = hasLandlord(t.occupancy);
  const complete = needsLandlord
    ? !!(t.landlord?.name?.trim() && t.contractNumber?.trim() && t.start?.trim() && t.end?.trim())
    : true;

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={2} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "16px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>Vínculo de ocupação</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          {needsLandlord
            ? "A sua morada é provada pelo contrato e confirmada pelo senhorio."
            : "Como proprietário, a morada é provada pela titularidade do imóvel."}
        </p>

        <Field label="Tipo de ocupação">
          <div style={{ display: "flex", gap: 8 }}>
            {OCCS.map((o) => {
              const on = t.occupancy === o;
              return (
                <button key={o} onClick={() => set({ occupancy: o })} style={{ flex: 1, border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", background: on ? "#FBF2DC" : "#FFFDF9", borderRadius: 11, padding: "11px 4px", font: `${on ? 700 : 600} 12px Inter`, color: "#1A1814", cursor: "pointer" }}>
                  {OCCUPANCY_LABEL[o]}
                </button>
              );
            })}
          </div>
        </Field>

        {needsLandlord && (
          <>
            <Field label="Senhorio">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={t.landlord?.name ?? ""} onChange={(e) => setLandlord({ name: e.target.value })} placeholder="Nome do senhorio" style={inputEl} />
                <input value={t.landlord?.afroloc ?? ""} onChange={(e) => setLandlord({ afroloc: e.target.value.toUpperCase() })} placeholder="AFROLOC do senhorio (opcional)" style={{ ...inputEl, font: "700 12.5px 'Space Mono'" }} />
                <span style={{ font: "600 11px Inter", color: "#B0831F", background: "#FBF2DC", borderRadius: 10, padding: "7px 11px", alignSelf: "flex-start" }}>
                  Por confirmar pelo senhorio
                </span>
              </div>
            </Field>

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <SmallField label="Nº de contrato" mono value={t.contractNumber} onChange={(v) => set({ contractNumber: v.toUpperCase() })} placeholder="ARR-…" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <SmallField label="Início" value={t.start} onChange={(v) => set({ start: v })} placeholder="Fev 2026" />
              </div>
              <div style={{ flex: 1 }}>
                <SmallField label="Fim" value={t.end} onChange={(v) => set({ end: v })} placeholder="Fev 2027" />
              </div>
            </div>

            {/* contrato (PDF) */}
            <label style={{ display: "flex", alignItems: "center", gap: 11, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 13, padding: "12px 14px", marginTop: 16, cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ font: "600 12.5px Inter", color: "#1A1814" }}>{t.hasContractPdf ? "Contrato anexado" : "Anexar contrato (PDF)"}</div>
                <div style={{ font: "400 11px Inter", color: "#8A8073", marginTop: 1 }}>{t.hasContractPdf ? "toque para substituir" : "opcional, reforça a prova"}</div>
              </div>
              {t.hasContractPdf && <span style={{ font: "600 11px Inter", color: "#2F7A57" }}>✓</span>}
              <input type="file" accept="application/pdf,image/*" style={{ display: "none" }} onChange={(e) => set({ hasContractPdf: !!e.target.files?.length })} />
            </label>
          </>
        )}

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => complete && navigate("/authorityDeclaration")} disabled={!complete}>Continuar</PrimaryButton>
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

function SmallField({ label, value, onChange, mono, placeholder }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; placeholder?: string }) {
  return (
    <div>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputEl, font: `700 13.5px ${mono ? "'Space Mono'" : "Inter"}` }} />
    </div>
  );
}

const inputEl = {
  width: "100%",
  boxSizing: "border-box" as const,
  background: "#FFFDF9",
  border: "1.5px solid #EAE3D7",
  borderRadius: 13,
  padding: "13px 13px",
  font: "600 13.5px Inter",
  color: "#1A1814",
  outline: "none",
} as const;
