import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { DARK, DarkBackHeader } from "../admin/adminUi";

const ENDPOINTS = [
  { method: "GET", path: "/address/{code}", desc: "Resolve um código AFROLOC" },
  { method: "POST", path: "/address/verify", desc: "Valida posse e proximidade" },
  { method: "GET", path: "/grid/{lat}/{lng}", desc: "Devolve a célula QGSQ" },
  { method: "GET", path: "/divisions/{iso}", desc: "Malha administrativa do país" },
];

const JSON_EXAMPLE = `{
  "code": "AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001",
  "ats": 86,
  "status": "active",
  "cell": "AO-ZU-G10-X6AUQ-Y49HV"
}`;

export function ApiDocsScreen() {
  const navigate = useNavigate();
  return (
    <PhoneChrome bg={DARK.bg} dark>
      <div style={{ padding: "0 22px", color: DARK.fg }}>
        <DarkBackHeader title="API · Documentação" onBack={() => navigate(-1)} />
      </div>
      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14, color: DARK.fg }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 15px" }}>
          <div>
            <div style={{ font: "700 13px Inter", color: DARK.fg }}>REST API v1</div>
            <div style={{ font: "600 11px 'Space Mono'", color: DARK.gold, marginTop: 3 }}>api.afroloc.ao/v1</div>
          </div>
          <span style={{ font: "700 12px 'Space Mono'", color: DARK.green }}>99.9%</span>
        </div>

        <div style={{ font: "700 13px Inter", color: DARK.fg }}>Endpoints</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ENDPOINTS.map((e) => (
            <div key={e.path} style={{ display: "flex", alignItems: "center", gap: 11, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 13, padding: "11px 13px" }}>
              <span style={{ font: "700 9px 'Space Mono'", color: e.method === "GET" ? DARK.green : DARK.gold, background: e.method === "GET" ? "#2F7A5722" : "#D4A85322", borderRadius: 6, padding: "4px 7px", flex: "none", width: 34, textAlign: "center" }}>{e.method}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "700 12px 'Space Mono'", color: DARK.fg }}>{e.path}</div>
                <div style={{ font: "400 11px Inter", color: DARK.muted, marginTop: 2 }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0f0d0a", border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ font: "700 9px Inter", letterSpacing: ".12em", color: DARK.green, marginBottom: 8 }}>EXEMPLO · 200 OK</div>
          <pre style={{ margin: 0, font: "500 11.5px 'Space Mono'", color: "#C9BDA8", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{JSON_EXAMPLE}</pre>
        </div>

        <button onClick={() => navigate("/yamiooApi")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
          Obter chave de API
        </button>
      </div>
    </PhoneChrome>
  );
}
