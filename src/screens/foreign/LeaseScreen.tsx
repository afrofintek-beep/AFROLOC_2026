import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";

const OCCUPANCY = ["Proprietário", "Inquilino", "Cedência"];

export function LeaseScreen() {
  const navigate = useNavigate();
  const [occ, setOcc] = useState("Inquilino");

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={2} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "16px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>Contrato de arrendamento</h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          Como inquilino, a sua morada é provada pelo contrato e confirmada pelo senhorio.
        </p>

        <Field label="Tipo de ocupação">
          <div style={{ display: "flex", gap: 8 }}>
            {OCCUPANCY.map((o) => {
              const on = occ === o;
              return (
                <button key={o} onClick={() => setOcc(o)} style={{ flex: 1, border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", background: on ? "#FBF2DC" : "#FFFDF9", borderRadius: 11, padding: "11px 4px", font: `${on ? 700 : 600} 12px Inter`, color: "#1A1814", cursor: "pointer" }}>
                  {o}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Senhorio">
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
            <span style={{ width: 40, height: 40, borderRadius: "50%", flex: "none", background: "#F0EADE", color: "#8A8073", display: "flex", alignItems: "center", justifyContent: "center", font: "700 13px Inter" }}>JB</span>
            <div style={{ flex: 1 }}>
              <div style={{ font: "700 14px Inter", color: "#1A1814" }}>João Bunga</div>
              <div style={{ font: "500 12px 'Space Mono'", color: "#8A8073", marginTop: 1 }}>AO-LUA-BEL-FUT-GEN-G10-X6AZ9-Y49M4-0001</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "700 10px Inter", color: "#2F7A57", background: "#EBF1ED", borderRadius: 16, padding: "5px 9px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              Confirmou
            </span>
          </div>
        </Field>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <SmallField label="Nº de contrato" value="ARR-2026-1184" mono />
          </div>
          <div style={{ flex: 1 }}>
            <SmallField label="Vigência" value="Fev 26 – Fev 27" />
          </div>
        </div>

        {/* attached PDF */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 13, padding: "12px 14px", marginTop: 16 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8073" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></svg>
          <div style={{ flex: 1 }}>
            <div style={{ font: "600 12.5px Inter", color: "#1A1814" }}>contrato_arrendamento.pdf</div>
            <div style={{ font: "400 11px Inter", color: "#8A8073", marginTop: 1 }}>1,2 MB · anexado</div>
          </div>
          <span style={{ font: "600 11px Inter", color: "#2F7A57" }}>✓</span>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => navigate("/authorityDeclaration")}>Continuar</PrimaryButton>
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

function SmallField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      <div style={{ background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 13, padding: "13px 13px", font: `700 13.5px ${mono ? "'Space Mono'" : "Inter"}`, color: "#1A1814" }}>{value}</div>
    </div>
  );
}
