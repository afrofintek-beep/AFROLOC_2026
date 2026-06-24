import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton } from "../../components/ui/primitives";
import { useCreateFlow } from "../../state/createFlow";
import { nextStep } from "../create/flow";
import {
  OCCUPANCY_LABEL,
  formatKz,
  hasLandlord,
  taxObligations,
  type Occupancy,
} from "../../data/tenancy";
import { useJurisdictionConfig } from "../../state/jurisdictionConfig";

const OCCS: Occupancy[] = ["proprietario", "inquilino", "cedencia"];

export function TenancyScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const { isEnabled, taxFor } = useJurisdictionConfig();
  const t = draft.tenancy;
  const countryIso = draft.division.countryIso;
  const countryName = draft.division.countryName;
  const taxSupported = isEnabled(countryIso);
  const landlordRequired = hasLandlord(t.occupancy);
  const obligations = taxObligations(t, taxSupported ? taxFor(countryIso) : null);
  const annual = t.monthlyRent * 12;

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={3} total={5} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "16px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 25px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>
          Vínculo de ocupação
        </h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 0", lineHeight: 1.45 }}>
          Registe a relação com o senhorio — para o registo da morada e para as obrigações tributárias.
        </p>

        {/* occupancy */}
        <Field label="Tipo de ocupação">
          <div style={{ display: "flex", gap: 8 }}>
            {OCCS.map((o) => {
              const on = t.occupancy === o;
              return (
                <button
                  key={o}
                  onClick={() => dispatch({ type: "setTenancy", value: { occupancy: o } })}
                  style={{ flex: 1, border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", background: on ? "#FBF2DC" : "#FFFDF9", borderRadius: 11, padding: "11px 4px", font: `${on ? 700 : 600} 12px Inter`, color: "#1A1814", cursor: "pointer" }}
                >
                  {OCCUPANCY_LABEL[o]}
                </button>
              );
            })}
          </div>
        </Field>

        {!landlordRequired ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#EBF1ED", borderRadius: 14, padding: "14px 16px", marginTop: 16 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /></svg>
            <span style={{ font: "500 13px Inter", color: "#2F7A57", lineHeight: 1.4 }}>
              Morada própria — sem vínculo de arrendamento. Sem obrigações de renda a registar.
            </span>
          </div>
        ) : (
          <>
            {/* landlord */}
            <Field label="Senhorio">
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", flex: "none", background: "#F0EADE", color: "#8A8073", display: "flex", alignItems: "center", justifyContent: "center", font: "700 13px Inter" }}>
                  {(t.landlord?.name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 14px Inter", color: "#1A1814" }}>{t.landlord?.name}</div>
                  <div style={{ font: "500 11.5px 'Space Mono'", color: "#8A8073", marginTop: 1 }}>
                    {t.landlord?.afroloc} · NIF {t.landlord?.nif}
                  </div>
                </div>
                {t.landlord?.confirmed && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "700 10px Inter", color: "#2F7A57", background: "#EBF1ED", borderRadius: 16, padding: "5px 9px" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    Confirmou
                  </span>
                )}
              </div>
            </Field>

            {/* contract + rent */}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <MiniField label="Nº de contrato" value={t.contractNumber} mono />
              </div>
              <div style={{ flex: 1 }}>
                <MiniField label="Vigência" value={`${t.start} – ${t.end}`} />
              </div>
            </div>

            <Field label="Renda mensal">
              <div style={{ display: "flex", alignItems: "center", background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 13, padding: "0 13px", height: 50 }}>
                <input
                  type="number"
                  value={t.monthlyRent}
                  onChange={(e) => dispatch({ type: "setTenancy", value: { monthlyRent: Math.max(0, Number(e.target.value) || 0) } })}
                  style={{ flex: 1, border: "none", background: "transparent", font: "700 16px 'Space Mono'", color: "#1A1814", outline: "none", width: 0 }}
                />
                <span style={{ font: "600 13px Inter", color: "#8A8073" }}>Kz / mês</span>
              </div>
            </Field>

            {/* tax obligations — enabled per jurisdiction (Angola only for now) */}
            {!taxSupported ? (
              <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: "#F4EAD6", borderRadius: 14, padding: "13px 15px", marginTop: 18 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>
                  <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" />
                </svg>
                <span style={{ font: "500 12.5px Inter", color: "#7C6A4A", lineHeight: 1.45 }}>
                  Obrigações de renda disponíveis apenas para <strong>Angola</strong> nesta fase. Em {countryName} o
                  vínculo é registado, mas a tributação será ativada quando as regras do país forem configuradas.
                </span>
              </div>
            ) : (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ font: "700 14px Inter", color: "#1A1814" }}>Obrigações tributárias</span>
                <span style={{ font: "500 11px Inter", color: "#8A8073" }}>base anual {formatKz(annual)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {obligations.map((o) => (
                  <div key={o.key} style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ font: "700 13px Inter", color: "#1A1814" }}>{o.title}</span>
                      <span style={{ font: "700 13px 'Space Mono'", color: "#B0831F" }}>{formatKz(o.amount)}/ano</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                      <span style={{ font: "700 9px Inter", letterSpacing: ".06em", color: o.party === "Senhorio" ? "#B98421" : "#2F7A57", background: o.party === "Senhorio" ? "#F4EAD6" : "#EBF1ED", borderRadius: 6, padding: "3px 7px" }}>
                        {o.party.toUpperCase()}
                      </span>
                      <span style={{ font: "500 11px 'Space Mono'", color: "#8A8073" }}>{Math.round(o.rate * 100)}%</span>
                    </div>
                    <div style={{ font: "400 11.5px Inter", color: "#8A8073", marginTop: 6, lineHeight: 1.4 }}>{o.note}</div>
                  </div>
                ))}
              </div>
              <p style={{ font: "400 11px Inter", color: "#A99E8C", lineHeight: 1.45, margin: "10px 0 0" }}>
                Valores ilustrativos · taxas configuráveis por jurisdição (countryConfig) · não constituem aconselhamento fiscal.
              </p>
            </div>
            )}
          </>
        )}

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: "16px 0 0" }}>
          O vínculo fica associado à morada — alimenta o registo, as atualizações e a comunicação às finanças.
        </p>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => navigate("/" + nextStep("tenancy", draft.type))}>Continuar</PrimaryButton>
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

function MiniField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ font: "500 10px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{label}</div>
      <div style={{ background: "#FFFDF9", border: "1.5px solid #EAE3D7", borderRadius: 13, padding: "13px 13px", font: `700 13.5px ${mono ? "'Space Mono'" : "Inter"}`, color: "#1A1814" }}>{value}</div>
    </div>
  );
}
