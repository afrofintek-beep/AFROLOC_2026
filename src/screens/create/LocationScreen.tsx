import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { FlowHeader, PrimaryButton, Pill, CellPlate } from "../../components/ui/primitives";
import { LiveMap } from "../../components/ui/LiveMap";
import { useCreateFlow } from "../../state/createFlow";
import { countryByIso } from "../../data/africaAdmin";
import { provinces as angolaProvinces, municipiosOf, comunasOf } from "../../data/angolaDivisions";
import { useGeolocation } from "../../lib/useGeolocation";
import { cellForCoords } from "../../lib/qgsq";
import { adminCodesFor } from "../../lib/afroloc/admin";
import { validateGpsIntegrity, describeGpsCode } from "../../lib/afroloc/gps";
import { nextStep } from "./flow";
import type { ReactNode } from "react";

export function LocationScreen() {
  const navigate = useNavigate();
  const { draft, dispatch } = useCreateFlow();
  const country = countryByIso(draft.division.countryIso);
  const { status, fix, error, locate } = useGeolocation();

  // Cascata administrativa. Para Angola usamos a árvore completa
  // (província → município → comuna); para outros países, só nível 1.
  const isAngola = draft.division.countryIso === "AO";
  const provinceOptions = isAngola ? angolaProvinces() : (country?.nivel1 ?? []).map((p) => p.nome);
  const municipioOptions = isAngola ? municipiosOf(draft.division.province) : [];
  const comunaOptions = isAngola ? comunasOf(draft.division.province, draft.division.municipio) : [];

  // Capture real GPS on mount.
  useEffect(() => {
    locate();
  }, [locate]);

  // When a fix arrives, refine the draft coordinates + recompute the QGSQ cell.
  useEffect(() => {
    if (!fix) return;
    dispatch({ type: "setCoords", value: { lat: fix.lat, lng: fix.lng, accuracy: fix.accuracy } });
    const c = cellForCoords(fix.lat, fix.lng, draft.cell.sizeM);
    dispatch({ type: "setCell", value: { code: c.code, zone: c.zone } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fix]);

  const cell = cellForCoords(draft.coords.lat, draft.coords.lng, draft.cell.sizeM, draft.division.countryIso, adminCodesFor(draft.division));
  const integrity = validateGpsIntegrity({
    latitude: draft.coords.lat,
    longitude: draft.coords.lng,
    countryCode: draft.division.countryIso,
    accuracy: draft.coords.accuracy,
  });
  const gpsLabel =
    status === "locating"
      ? "GPS · a localizar…"
      : status === "denied" || status === "unavailable"
        ? "GPS · indisponível"
        : `GPS · ±${draft.coords.accuracy}m`;

  return (
    <PhoneChrome>
      <div style={{ paddingTop: 8 }}>
        <FlowHeader step={2} total={4} onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "20px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ font: "700 27px Inter", color: "#1A1814", margin: "4px 0 0", letterSpacing: "-.01em" }}>
          Localização
        </h2>
        <p style={{ font: "400 14px Inter", color: "#8A8073", margin: "8px 0 14px" }}>
          Confirme o ponto exacto da sua morada no mapa.
        </p>

        <div style={{ position: "relative" }}>
          <LiveMap lat={draft.coords.lat} lng={draft.coords.lng} accuracy={draft.coords.accuracy} cell={cell} height={180} />
          <div style={{ position: "absolute", left: 12, top: 12, zIndex: 500 }}>
            <Pill label={gpsLabel} tone={status === "denied" || status === "unavailable" ? "amber" : "green"} />
          </div>
          <button
            onClick={locate}
            disabled={status === "locating"}
            aria-label="Recapturar GPS"
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              zIndex: 500,
              width: 36,
              height: 36,
              borderRadius: 11,
              border: "none",
              background: "#FFFDF9",
              boxShadow: "0 4px 10px -4px rgba(28,24,21,.4)",
              cursor: status === "locating" ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1814" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          </button>
        </div>

        {error && <p style={{ font: "500 12px Inter", color: "#B98421", margin: "8px 0 0" }}>{error}</p>}

        {/* anti-spoofing integrity (spec §3) */}
        {!integrity.valid ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#FBE3DE", borderRadius: 12, padding: "9px 12px", marginTop: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#D14B3A", flex: "none" }} />
            <span style={{ font: "600 11.5px Inter", color: "#9c3a2d" }}>GPS bloqueado: {integrity.flags.map(describeGpsCode).join("; ")}</span>
          </div>
        ) : integrity.warnings.length > 0 ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#F4EAD6", borderRadius: 12, padding: "9px 12px", marginTop: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#D99A3A", flex: "none" }} />
            <span style={{ font: "600 11.5px Inter", color: "#7C6A4A" }}>Aviso GPS: {integrity.warnings.map(describeGpsCode).join("; ")}</span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#EBF1ED", borderRadius: 12, padding: "9px 12px", marginTop: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
            <span style={{ font: "600 11.5px Inter", color: "#2F7A57" }}>Integridade GPS verificada · sem indícios de spoofing</span>
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <CellPlate code={cell.code} sub={`Célula QGSQ · ${cell.sizeM}×${cell.sizeM}m ${cell.zone}`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <FieldButton label="País" value={`${country?.flag ?? ""} ${draft.division.countryName}`} onClick={() => navigate("/adminDivision")} />
          <SelectField
            label={cap(draft.division.level1Type)}
            value={draft.division.province ?? ""}
            placeholder="Seleccionar"
            options={provinceOptions}
            onChange={(v) => dispatch({ type: "setDivision", value: { province: v, municipio: undefined, comuna: undefined } })}
          />
          <SelectField
            label="Município"
            value={draft.division.municipio ?? ""}
            placeholder={draft.division.province ? "Seleccionar" : "Escolha a província"}
            options={municipioOptions}
            onChange={(v) => dispatch({ type: "setDivision", value: { municipio: v, comuna: undefined } })}
          />
          <SelectField
            label="Comuna"
            value={draft.division.comuna ?? ""}
            placeholder={!draft.division.municipio ? "Escolha o município" : comunaOptions.length ? "Seleccionar" : "Sem comunas"}
            options={comunaOptions}
            onChange={(v) => dispatch({ type: "setDivision", value: { comuna: v } })}
          />
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => navigate("/" + nextStep("location", draft.type))}>Continuar</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fieldShell(children: ReactNode, active = false) {
  return (
    <div
      style={{
        background: "#FFFDF9",
        border: active ? "1.5px solid #D4A853" : "1.5px solid #EAE3D7",
        borderRadius: 13,
        padding: "9px 13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minHeight: 56,
      }}
    >
      {children}
    </div>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flex: "none" }}>
      <path d="M6 9l6 6 6-6" stroke="#A99E8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldButton({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ all: "unset", cursor: "pointer", width: "100%" }}>
      {fieldShell(
        <>
          <span>
            <span style={{ font: "500 10px Inter", color: "#8A8073", display: "block", textTransform: "uppercase", letterSpacing: ".04em" }}>
              {label}
            </span>
            <span style={{ font: "700 14px Inter", color: "#1A1814", display: "block", marginTop: 2 }}>{value}</span>
          </span>
          <Chevron />
        </>,
      )}
    </button>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const empty = !value;
  return (
    <div style={{ position: "relative" }}>
      {fieldShell(
        <>
          <span style={{ flex: 1 }}>
            <span style={{ font: "500 10px Inter", color: "#8A8073", display: "block", textTransform: "uppercase", letterSpacing: ".04em" }}>
              {label}
            </span>
            <span style={{ font: "700 14px Inter", color: empty ? "#A99E8C" : "#1A1814", display: "block", marginTop: 2 }}>
              {value || placeholder}
            </span>
          </span>
          <Chevron />
        </>,
        !empty,
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
