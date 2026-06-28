import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { AtsRing } from "../../components/ui/AtsRing";
import { Qr } from "../../components/ui/Qr";
import { primaryAddress, addressUrl } from "../../data/account";
import { useCreateFlow } from "../../state/createFlow";
import { useCitizenData } from "../../state/citizenData";
import { rowToPrimary } from "../../lib/afroloc/addressMap";
import { cyclePosition, CYCLE_STATE_META } from "../../lib/afroloc/risk";
import { CERT_LABEL } from "../../lib/afroloc/ats";
import { describeGpsCode } from "../../lib/afroloc/gps";

export function DetailScreen() {
  const navigate = useNavigate();
  const { configured, primary } = useCitizenData();
  const a = configured && primary ? rowToPrimary(primary) : primaryAddress;
  const { draft } = useCreateFlow();
  const gen = draft.generated;
  // Posição no ciclo de verificação (documento Score de Risco §5–§6).
  const cycle = configured && primary ? cyclePosition(primary.cycle_months, primary.next_verify_at) : null;
  const cycleMeta = cycle ? CYCLE_STATE_META[cycle.state] : null;

  return (
    <PhoneChrome bg="#F0EADE">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>{a.label}</span>
        <button onClick={() => navigate("/share")} aria-label="Partilhar" style={iconBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4M7 9l5-5 5 5" stroke="#1A1814" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 13v6h14v-6" stroke="#1A1814" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div style={{ padding: "16px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* freshly-generated AFROLOC (real creation pipeline) */}
        {gen && (
          <div style={{ background: gen.success ? "#EBF1ED" : "#FBE3DE", border: `1px solid ${gen.success ? "#2F7A5733" : "#D14B3A33"}`, borderRadius: 16, padding: "13px 15px" }}>
            {gen.success ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                  <span style={{ font: "700 11px Inter", letterSpacing: ".06em", color: "#2F7A57" }}>
                    NOVA AFROLOC · {CERT_LABEL[gen.ats!.certificationLevel].toUpperCase()} · ATS {gen.ats!.total}
                  </span>
                </div>
                <div style={{ font: "700 13px 'Space Mono'", color: "#1A1814", marginTop: 7, wordBreak: "break-all", lineHeight: 1.3 }}>{gen.afrolocCode}</div>
                <div style={{ font: "500 11px Inter", color: "#2F7A57", marginTop: 5 }}>
                  célula {gen.gridM}×{gen.gridM} m · SQ {gen.subdivisionType} · estado {gen.status === "draft" ? "rascunho" : gen.status}
                  {gen.warnings && gen.warnings.length > 0 ? ` · ${gen.warnings.length} aviso(s)` : ""}
                </div>
              </>
            ) : (
              <div>
                <span style={{ font: "700 11px Inter", color: "#D14B3A" }}>CRIAÇÃO BLOQUEADA POR SEGURANÇA</span>
                <div style={{ font: "400 12px Inter", color: "#9c3a2d", marginTop: 5, lineHeight: 1.4 }}>
                  {(gen.flags && gen.flags.length ? gen.flags.map(describeGpsCode) : ["Validação de GPS falhou"]).join("; ")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* dark code plate */}
        <div style={{ background: "#1A1814", borderRadius: 22, padding: 20, color: "#F8F5F0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -28, top: -28, width: 130, height: 130, borderRadius: "50%", background: "#D4A85322" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ font: "700 11px 'Space Mono'", color: "#2D2519", background: "#E8C97A", borderRadius: 6, padding: "2px 7px" }}>
                  {a.countryChip}
                </span>
                <span style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#A99E8C" }}>CÓDIGO AFROLOC</span>
              </div>
              <div style={{ font: "700 16px 'Space Mono'", letterSpacing: ".01em", marginTop: 12, lineHeight: 1.32, wordBreak: "break-all", maxWidth: 200 }}>
                {a.code}
              </div>
            </div>
            <Qr value={addressUrl(a.code)} size={70} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 16, position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2F7A5733", border: "1px solid #2F7A5766", borderRadius: 18, padding: "5px 11px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5BC48E" }} />
              <span style={{ font: "700 11px Inter", color: "#7FD3A6", letterSpacing: ".06em" }}>{a.status}</span>
            </div>
            <span style={{ font: "400 12.5px Inter", color: "#A99E8C" }}>{a.addressLine}</span>
          </div>
        </div>

        {/* ATS breakdown */}
        <div style={{ background: "#FFFDF9", borderRadius: 20, padding: 18, border: "1px solid #EAE3D7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <AtsRing score={a.ats} size={64} fontSize={19} bg="#FFFDF9" />
            <div>
              <div style={{ font: "700 15px Inter", color: "#1A1814" }}>Índice de Confiança da Morada <span style={{ color: "#8A8073", fontWeight: 600 }}>(ATS)</span></div>
              <div style={{ font: "500 12px Inter", color: "#2F7A57", marginTop: 2 }}>{a.atsLabel}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {a.factors.map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ font: "500 12.5px Inter", color: "#1A1814", width: 132, flex: "none" }}>{f.label}</span>
                <span style={{ flex: 1, height: 8, borderRadius: 4, background: "#EDE4D5", overflow: "hidden" }}>
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${f.value}%`,
                      borderRadius: 4,
                      background: f.tone === "green" ? "#2F7A57" : "#D4A853",
                    }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* verification cycle + estado (Score de Risco §5–§6) */}
        <div style={{ background: "#FFFDF9", borderRadius: 16, padding: "14px 16px", border: "1px solid #EAE3D7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: cycleMeta?.bg ?? "#F4EAD6", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={cycleMeta?.color ?? "#B98421"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
              </svg>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>Ciclo de verificação · {a.cycleMonths} meses</div>
              <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2 }}>
                {cycle ? `${cycle.daysRemaining} dias até à próxima · ${a.nextVerifyDate}` : `Próxima a ${a.nextVerifyDate}`}
              </div>
            </div>
            {cycleMeta && (
              <span style={{ font: "700 10px Inter", letterSpacing: ".04em", color: cycleMeta.color, background: cycleMeta.bg, borderRadius: 8, padding: "5px 9px", flex: "none" }}>
                {cycleMeta.label.toUpperCase()}
              </span>
            )}
          </div>
          {cycle && (
            <>
              <div style={{ height: 7, borderRadius: 4, background: "#EFE7DA", overflow: "hidden", marginTop: 12 }}>
                <div style={{ height: "100%", width: `${Math.min(100, cycle.progressPct)}%`, borderRadius: 4, background: cycleMeta!.color }} />
              </div>
              <div style={{ font: "400 11.5px Inter", color: cycleMeta!.color, marginTop: 7 }}>{cycleMeta!.action}</div>
            </>
          )}
        </div>

        {/* authority validated badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#EBF1ED", borderRadius: 16, padding: "13px 16px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span style={{ font: "500 13px Inter", color: "#2F7A57" }}>
            Validado por <strong>{a.validator}</strong>
          </span>
        </div>

        {/* tenancy / tax-obligation link */}
        <button onClick={() => navigate("/tenancy")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "#F4EAD6", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B98421" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5" /></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 13.5px Inter", color: "#1A1814" }}>Vínculo de ocupação · Inquilino</div>
            <div style={{ font: "400 12px Inter", color: "#8A8073", marginTop: 2 }}>Senhorio confirmado · obrigações tributárias registadas</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
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
