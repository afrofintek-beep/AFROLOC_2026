import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { PrimaryButton, Pill } from "../../components/ui/primitives";
import { LiveMap } from "../../components/ui/LiveMap";
import { useCreateFlow } from "../../state/createFlow";
import { cellForCoords } from "../../lib/qgsq";
import { qgEncode, sqEncode } from "../../lib/afroloc/engines";
import { adminCodesFor } from "../../lib/afroloc/admin";
import { nextStep } from "./flow";

export function QgsqScreen() {
  const navigate = useNavigate();
  const { draft } = useCreateFlow();
  const zone = draft.cell.sizeM <= 10 ? "urban" : "rural";
  const admin = adminCodesFor(draft.division);
  const regType = draft.type === "digital" ? "digital" : "formal";

  // Real QG + SQ engines (preview — no sequence side-effect; spec §4/§5).
  const qg = qgEncode(draft.coords.lat, draft.coords.lng, draft.division.countryIso, zone, admin, regType);
  const sq = sqEncode(qg.afroloc, draft.coords.lat, draft.coords.lng, qg.bbox, 0);
  const cell = cellForCoords(draft.coords.lat, draft.coords.lng, draft.cell.sizeM, draft.division.countryIso, admin);

  return (
    <PhoneChrome>
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={chevronBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>A sua célula</span>
        <Pill label={`GPS · ±${draft.coords.accuracy}m`} tone="green" />
      </div>

      <div style={{ padding: "16px 22px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <LiveMap lat={draft.coords.lat} lng={draft.coords.lng} accuracy={draft.coords.accuracy} cell={cell} height={200} zoom={19} />

        {/* dark code plate — real AFROLOC nomenclature */}
        <div style={{ marginTop: 16, background: "#1A1814", borderRadius: 18, padding: "18px 18px", textAlign: "center" }}>
          <div style={{ font: "700 10px Inter", letterSpacing: ".16em", color: "#A99E8C", textTransform: "uppercase" }}>
            Célula QGSQ · a sua morada
          </div>
          <div style={{ font: "700 17px 'Space Mono'", color: "#E8C97A", letterSpacing: ".01em", margin: "10px 0 4px", wordBreak: "break-all", lineHeight: 1.25 }}>
            {qg.afroloc}
          </div>
          <div style={{ font: "500 11px 'Space Mono'", color: "#8A8073" }}>célula {qg.afrolocLegacy}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
            <Chip>{qg.grid_m}×{qg.grid_m} m</Chip>
            <Chip>Zona {cell.zone}</Chip>
            <Chip>SQ {sq.subdivisionType} · {sq.sqCode}</Chip>
          </div>
        </div>

        <p style={{ font: "400 13px Inter", color: "#8A8073", lineHeight: 1.5, margin: "16px 0 0" }}>
          A grelha nacional projeta o seu ponto em Web Mercator e atribui uma célula de {qg.grid_m}×{qg.grid_m}&nbsp;m
          com código permanente. O motor SQ subdivide-a por densidade ({sq.subdivisionType}). Essa célula é a sua morada.
        </p>

        <div style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 6 }}>
          <PrimaryButton onClick={() => navigate("/" + nextStep("qgsq", draft.type))}>Confirmar célula</PrimaryButton>
        </div>
      </div>
    </PhoneChrome>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ font: "700 10.5px 'Space Mono'", color: "#E8C97A", background: "#262019", borderRadius: 9, padding: "5px 10px" }}>
      {children}
    </span>
  );
}

const chevronBtn = {
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
