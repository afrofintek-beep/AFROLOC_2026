import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { COUNTRIES, countryByIso } from "../../data/africaAdmin";
import { useJurisdictionConfig } from "../../state/jurisdictionConfig";
import type { TaxConfig } from "../../data/tenancy";
import { computeCycleKpi, demoSeries, podpAtsBonus } from "../../lib/podp/kpi";
import { DARK } from "./adminUi";

const RATE_FIELDS: { key: keyof TaxConfig; label: string; party: string }[] = [
  { key: "predialRate", label: "Imposto Predial sobre rendas", party: "Senhorio" },
  { key: "retentionRate", label: "Retenção na fonte sobre a renda", party: "Arrendatário" },
  { key: "stampRate", label: "Imposto de Selo do contrato", party: "Arrendatário" },
];

export function CountryConfigScreen() {
  const navigate = useNavigate();
  const { isEnabled, taxFor, setEnabled, setRate, podp, setPodp } = useJurisdictionConfig();
  const [iso, setIso] = useState("AO");
  const podpKpi = computeCycleKpi(demoSeries(podp), podp);
  const atsBonus = podpAtsBonus(podpKpi.podpScore);
  const country = countryByIso(iso)!;
  const enabled = isEnabled(iso);
  const tax = taxFor(iso);
  const [saved, setSaved] = useState(false);

  return (
    <PhoneChrome bg="#1A1814" dark>
      <div style={{ padding: "8px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: "#F8F5F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ font: "700 16px Inter", color: "#F8F5F0" }}>Configuração de país</span>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#262019", border: "1px solid #3A332D", borderRadius: 11, padding: "7px 11px" }}>
              <span style={{ fontSize: 16 }}>{country.flag}</span>
              <span style={{ font: "700 13px Inter", color: "#F8F5F0" }}>{country.pais}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <select value={iso} onChange={(e) => { setIso(e.target.value); setSaved(false); }} aria-label="País" style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", cursor: "pointer" }}>
              {COUNTRIES.map((c) => (<option key={c.iso} value={c.iso}>{c.pais}</option>))}
            </select>
          </div>
        </div>

        {/* inherited defaults (display) */}
        <div style={{ background: "#262019", border: "1px solid #3A332D", borderRadius: 16, padding: "6px 16px" }}>
          <Row label="Prefixo" value={`${country.iso} · +244`} />
          <Div />
          <Row label="Nomenclatura nível 1" value={country.nivel1_tipo} />
          <Div />
          <Row label="Idiomas" value={country.linguas_oficiais.join(", ")} />
          <Div />
          <Row label="Célula urbana" value="10 × 10 m" />
          <Div />
          <Row label="Célula rural" value="50 × 50 m" />
          <Div />
          <Row label="Testemunhas (formal / informal)" value="2 / 3" />
          <Div />
          <Row label="Ciclo verificação" value="6m / 3m" />
        </div>

        {/* rent-tax rules (editable, per jurisdiction) */}
        <div style={{ background: "#262019", border: "1px solid #3A332D", borderRadius: 16, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ font: "700 13px Inter", color: "#F8F5F0" }}>Regras de arrendamento (rendas)</div>
              <div style={{ font: "400 11px Inter", color: "#A99E8C", marginTop: 3 }}>Tributação de rendas para {country.pais}</div>
            </div>
            <Switch on={enabled} onClick={() => { setEnabled(iso, !enabled); setSaved(false); }} />
          </div>

          {enabled ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {RATE_FIELDS.map((f) => (
                <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "600 12.5px Inter", color: "#F8F5F0" }}>{f.label}</div>
                    <div style={{ font: "500 10px Inter", color: "#A99E8C", marginTop: 2 }}>{f.party}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#1A1814", border: "1px solid #3A332D", borderRadius: 10, padding: "0 10px", height: 40 }}>
                    <input
                      type="number"
                      step="0.1"
                      value={+(tax[f.key] * 100).toFixed(2)}
                      onChange={(e) => { setRate(iso, f.key, Math.max(0, Number(e.target.value) || 0) / 100); setSaved(false); }}
                      style={{ width: 52, border: "none", background: "transparent", font: "700 14px 'Space Mono'", color: "#E8C97A", outline: "none", textAlign: "right" }}
                    />
                    <span style={{ font: "600 12px Inter", color: "#A99E8C" }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ font: "400 12px Inter", color: "#A99E8C", lineHeight: 1.45, marginTop: 12 }}>
              Tributação de rendas desativada para {country.pais}. Ative e defina as taxas para a aplicar no fluxo de arrendamento.
            </div>
          )}
        </div>

        <p style={{ font: "400 11.5px Inter", color: "#A99E8C", lineHeight: 1.45, margin: 0 }}>
          Cada país herda valores padrão e pode ajustá-los conforme a sua realidade administrativa e fiscal.
        </p>

        {/* PoDP — Proof of Daily Presence (admin nível ≥ 4) */}
        <div style={{ background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ font: "700 13px Inter", color: DARK.fg }}>Presença diária (PoDP)</div>
              <div style={{ font: "400 10.5px Inter", color: DARK.muted, marginTop: 3 }}>Reforço silencioso do ATS · só admin nível ≥ 4</div>
            </div>
            <Switch on={podp.enabled} onClick={() => { setPodp({ enabled: !podp.enabled }); setSaved(false); }} />
          </div>

          {podp.enabled && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                <NumRow label="Intervalo de amostra (min)" value={podp.sampleIntervalMinutes} min={1} max={240} onChange={(v) => { setPodp({ sampleIntervalMinutes: v }); setSaved(false); }} />
                <NumRow label="Raio urbano (m)" value={podp.toleranceRadiusUrbanM} min={10} max={1000} onChange={(v) => { setPodp({ toleranceRadiusUrbanM: v }); setSaved(false); }} />
                <NumRow label="Raio rural (m)" value={podp.toleranceRadiusRuralM} min={25} max={5000} onChange={(v) => { setPodp({ toleranceRadiusRuralM: v }); setSaved(false); }} />
                <NumRow label="Horas mínimas/dia" value={podp.minHoursPerDay} min={0} max={24} step={0.5} onChange={(v) => { setPodp({ minHoursPerDay: v }); setSaved(false); }} />
                <NumRow label="Duração do ciclo (dias)" value={podp.cycleLengthDays} min={1} max={365} onChange={(v) => { setPodp({ cycleLengthDays: v }); setSaved(false); }} />
                <NumRow label="Precisão GPS máx. (m)" value={podp.maxGpsAccuracyM} min={5} max={1000} onChange={(v) => { setPodp({ maxGpsAccuracyM: v }); setSaved(false); }} />
              </div>

              {/* live KPI preview from a demo cycle */}
              <div style={{ background: "#0f0d0a", border: `1px solid ${DARK.line}`, borderRadius: 12, padding: 14, marginTop: 14 }}>
                <div style={{ font: "700 10px Inter", letterSpacing: ".1em", color: DARK.muted, textTransform: "uppercase" }}>KPI do ciclo (exemplo)</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <Kpi v={`${podpKpi.podpScore}`} l="podp_score" />
                  <Kpi v={`${podpKpi.finalScore}`} l="final_score" />
                  <Kpi v={`${podpKpi.verifiedPct}%`} l={`${podpKpi.validDays}/${podpKpi.totalDays} dias`} />
                </div>
                <div style={{ font: "400 11px Inter", color: DARK.muted, marginTop: 10 }}>
                  Sequência máx. {podpKpi.longestStreak} d · consistência {Math.round(podpKpi.consistency * 100)}% · média {podpKpi.avgHoursValidDay} h/dia válido
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: "#2F7A5722", border: "1px solid #2F7A5744", borderRadius: 9, padding: "8px 11px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DARK.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                  <span style={{ font: "600 11.5px Inter", color: "#9fd9bb" }}>Reforça o ATS em <strong>+{atsBonus}</strong> (audit, cap +5) · fórmula pública inalterada</span>
                </div>
              </div>
              <p style={{ font: "400 10.5px Inter", color: DARK.muted, lineHeight: 1.45, margin: "10px 0 0" }}>
                Amostragem GPS silenciosa (sem UI ao titular), offline-first, anti-spoofing. Amostras e rollups só visíveis a admin nível ≥ 4.
              </p>
            </>
          )}
        </div>

        {saved && <div style={{ font: "600 12px Inter", color: "#7FD3A6", textAlign: "center" }}>Configuração guardada · aplica-se ao fluxo de arrendamento</div>}

        <button
          onClick={() => { setSaved(true); }}
          style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}
        >
          Guardar configuração
        </button>

        <button onClick={() => navigate("/tenancy")} style={{ all: "unset", cursor: "pointer", textAlign: "center", font: "600 12px Inter", color: "#A99E8C" }}>
          Ver no fluxo de arrendamento →
        </button>
      </div>
    </PhoneChrome>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0", gap: 12 }}>
      <span style={{ font: "500 11px Inter", color: "#A99E8C", flex: "none" }}>{label}</span>
      <span style={{ font: "700 12.5px Inter", color: "#F8F5F0", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Div() {
  return <div style={{ height: 1, background: "#3A332D" }} />;
}

function NumRow({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ flex: 1, font: "500 12px Inter", color: "#F8F5F0" }}>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        style={{ width: 70, height: 38, borderRadius: 10, border: "1px solid #3A332D", background: "#1A1814", padding: "0 10px", font: "700 13px 'Space Mono'", color: "#E8C97A", outline: "none", textAlign: "right" }}
      />
    </div>
  );
}

function Kpi({ v, l }: { v: string; l: string }) {
  return (
    <div style={{ flex: 1, background: "#1A1814", border: "1px solid #3A332D", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
      <div style={{ font: "800 18px 'Space Mono'", color: "#E8C97A" }}>{v}</div>
      <div style={{ font: "500 9.5px Inter", color: "#A99E8C", marginTop: 3 }}>{l}</div>
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: on ? "#2F7A57" : "#3A332D", position: "relative", cursor: "pointer", flex: "none" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
    </button>
  );
}
