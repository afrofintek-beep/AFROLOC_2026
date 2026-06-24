import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import { decode, validate } from "../../lib/afroloc/sdk";

interface Resolution {
  ok: boolean;
  ms: number;
  format?: string;
  lat?: number;
  lon?: number;
  gridM?: number;
  zone?: string;
  country?: string;
  error?: string;
}

export function AddressTestScreen() {
  const navigate = useNavigate();
  // A real, decodable AFROLOC code (Belas, urban) produced by the engine.
  const [code, setCode] = useState("AO-ZU-G10-X6AUQ-Y49HV");
  const [res, setRes] = useState<Resolution | null>(null);

  function resolve() {
    const start = performance.now();
    const v = validate(code);
    if (!v.valid) {
      setRes({ ok: false, ms: Math.round((performance.now() - start) * 100) / 100, error: "Formato de código não reconhecido" });
      return;
    }
    try {
      const d = decode(code);
      const ms = Math.round((performance.now() - start) * 100) / 100;
      setRes({
        ok: true,
        ms,
        format: v.format,
        lat: d.centroid.lat,
        lon: d.centroid.lon,
        gridM: d.gridSize,
        zone: d.zone === "urban" ? "urbana" : "rural",
        country: d.countryCode,
      });
    } catch (e) {
      setRes({ ok: false, ms: Math.round((performance.now() - start) * 100) / 100, error: (e as Error).message });
    }
  }

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Testar código</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setRes(null); }} placeholder="Código AFROLOC"
            style={{ flex: 1, height: 52, borderRadius: 14, border: "1.5px solid #EAE3D7", background: "#FFFDF9", padding: "0 14px", font: "700 13px 'Space Mono'", color: "#1A1814", outline: "none" }} />
          <button onClick={resolve} style={{ border: "none", background: "#1A1814", color: "#E8C97A", font: "700 13px Inter", borderRadius: 14, padding: "0 18px", cursor: "pointer" }}>Resolver</button>
        </div>

        {res && (res.ok ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#EBF1ED", borderRadius: 14, padding: "13px 15px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "700 12.5px Inter", color: "#2F7A57" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                Código válido · {res.format}
              </span>
              <span style={{ font: "600 11px 'Space Mono'", color: "#2F7A57" }}>Resolvido em {res.ms} ms</span>
            </div>

            <div style={{ font: "700 13px Inter", color: "#1A1814" }}>Resolução</div>
            <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "4px 16px" }}>
              <Row label="País" value={res.country!} mono />
              <Div />
              <Row label="Coordenadas (centróide)" value={`${res.lat!.toFixed(4)}, ${res.lon!.toFixed(4)}`} mono />
              <Div />
              <Row label="Célula QGSQ" value={`${res.gridM}×${res.gridM} m · ${res.zone}`} />
              <Div />
              <Row label="Decodificação" value="Web Mercator (EPSG:3857)" />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 9, alignItems: "center", background: "#FBE3DE", borderRadius: 14, padding: "13px 15px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D14B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            <span style={{ font: "600 12.5px Inter", color: "#9c3a2d" }}>Código inválido · {res.error}</span>
          </div>
        ))}

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          Resolvido localmente pelo SDK (<code style={{ font: "600 11px 'Space Mono'" }}>decode()</code>). Esta consulta não conta para métricas de produção.
        </p>
      </div>
    </PhoneChrome>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", gap: 12 }}>
      <span style={{ font: "500 11px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", flex: "none" }}>{label}</span>
      <span style={{ font: `700 13px ${mono ? "'Space Mono'" : "Inter"}`, color: "#1A1814", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Div() {
  return <div style={{ height: 1, background: "#EFE7DA" }} />;
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
