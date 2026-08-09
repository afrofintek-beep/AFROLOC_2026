import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { PhoneChrome } from "../../components/ui/PhoneChrome";
import {
  lookupPublicAfroloc, certLabel, atsBand, sinceLabel, placeLine, type PublicAfroloc,
} from "../../lib/supabase/publicLookup";
import { lookupYamiooEntity, type YamiooPlace } from "../../lib/supabase/yamiooLookup";
import AfrolocRadar from "../../shared/AfrolocRadar";
import { MAPBOX_TOKEN } from "../../lib/mapbox";

type State = "idle" | "loading" | "done" | "none";

/** Extrai o código AFROLOC do conteúdo do QR (URL afroloc.ao/a/<código> ou código nu). */
function extractCode(text: string): string {
  const t = text.trim();
  const url = t.match(/\/a\/([^\s?#]+)/i);
  if (url) return decodeURIComponent(url[1]).toUpperCase();
  // Código AFROLOC genérico: CC-…-G10/G25-… (apanha AFROLOC E Yamioo, com ou sem X/Y).
  const code = t.match(/[A-Z]{2}-[A-Z0-9-]*G[12]0-[A-Z0-9-]+/i);
  if (code) return code[0].toUpperCase();
  return t.toUpperCase();
}

export function PublicLookupScreen() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [rec, setRec] = useState<PublicAfroloc | null>(null);
  const [yplace, setYplace] = useState<YamiooPlace | null>(null);
  const [radar, setRadar] = useState<YamiooPlace | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function runLookup(raw: string) {
    const c = raw.trim();
    if (!c) return;
    setState("loading");
    setRec(null);
    setYplace(null);
    // 1) registo do cidadão (AFROLOC). 2) fallback: catálogo público da Yamioo.
    const r = await lookupPublicAfroloc(c);
    if (r) { setRec(r); setState("done"); return; }
    const y = await lookupYamiooEntity(c);
    if (y) { setYplace(y); setState("done"); return; }
    setState("none");
  }

  // Leitura por câmara: descodifica QR em contínuo; ao encontrar, consulta.
  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    const canvas = document.createElement("canvas");
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play().catch(() => {});
        const tick = () => {
          if (cancelled) return;
          if (v.readyState >= 2 && v.videoWidth) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const res = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
              if (res?.data) {
                const c = extractCode(res.data);
                cancelled = true;
                stream?.getTracks().forEach((t) => t.stop());
                setScanning(false);
                setCode(c);
                void runLookup(c);
                return;
              }
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        setScanError((e as { name?: string })?.name === "NotAllowedError" ? "Permita o acesso à câmara para ler o QR." : "Câmara indisponível neste dispositivo.");
      }
    })();
    return () => { cancelled = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, [scanning]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PhoneChrome bg="#F8F5F0">
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1A1814" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ font: "700 16px Inter", color: "#1A1814" }}>Consultar AFROLOC</span>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* scan plate — toca para ler o QR pela câmara */}
        <button
          onClick={() => { setScanError(null); setScanning(true); }}
          style={{ all: "unset", cursor: "pointer", background: "#1A1814", borderRadius: 18, padding: "26px 20px", textAlign: "center", display: "block" }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16" /></svg>
          <div style={{ font: "600 12.5px Inter", color: "#A99E8C", marginTop: 12 }}>Toque para ler o código AFROLOC com a câmara</div>
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setState("idle"); }}
            onKeyDown={(e) => { if (e.key === "Enter") runLookup(code); }}
            placeholder="ou introduza o código"
            style={{ flex: 1, height: 50, borderRadius: 14, border: "1.5px solid #EAE3D7", background: "#FFFDF9", padding: "0 14px", font: "700 13px 'Space Mono'", color: "#1A1814", outline: "none" }}
          />
          <button onClick={() => runLookup(code)} disabled={state === "loading" || !code.trim()}
            style={{ border: "none", background: "#1A1814", color: "#E8C97A", font: "700 13px Inter", borderRadius: 14, padding: "0 18px", cursor: state === "loading" || !code.trim() ? "default" : "pointer", opacity: state === "loading" || !code.trim() ? 0.6 : 1, minWidth: 92 }}>
            {state === "loading" ? "A consultar…" : "Consultar"}
          </button>
        </div>

        {state === "done" && rec && (
          <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ font: "700 14px 'Space Mono'", color: "#1A1814", wordBreak: "break-all" }}>{rec.code}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "700 9px Inter", letterSpacing: ".04em", color: "#2F7A57", background: "#EBF1ED", borderRadius: 7, padding: "4px 8px", flex: "none" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2F7A57" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                MORADA VERIFICADA
              </span>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 11 }}>
              <Row k="Localização" v={placeLine(rec)} />
              {certLabel(rec.certification_level) && <Row k="Certificação" v={certLabel(rec.certification_level)!} />}
              {(rec.ats_score ?? 0) > 0 && <Row k="Confiança (ATS)" v={`${Math.round(rec.ats_score!)} · ${atsBand(rec.ats_score)}`} green />}
              <Row k="Última verificação" v={sinceLabel(rec.last_verified_at)} />
            </div>
          </div>
        )}

        {state === "done" && yplace && (
          <div style={{ background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 18, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ font: "700 15px Inter", color: "#1A1814" }}>{yplace.title}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "700 9px Inter", letterSpacing: ".04em", color: "#B0831F", background: "#FBF2DC", borderRadius: 7, padding: "4px 8px", flex: "none", whiteSpace: "nowrap" }}>ESTABELECIMENTO · YAMIOO</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 11 }}>
              <Row k="Código" v={yplace.code} />
              <Row k="Local" v={[yplace.city, yplace.country].filter(Boolean).join(" · ") || "—"} />
              {yplace.type && <Row k="Tipo" v={yplace.type} />}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => setRadar(yplace)} style={{ flex: 1, border: "none", background: "var(--afl-grad-glow)", color: "#2D2519", font: "700 13px Inter", borderRadius: 12, padding: "12px", cursor: "pointer" }}>Chegar (Radar)</button>
              {yplace.url && (
                <a href={yplace.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #EAE3D7", borderRadius: 12, padding: "0 16px", font: "700 13px Inter", color: "#1A1814", textDecoration: "none" }}>Ver na Yamioo</a>
              )}
            </div>
          </div>
        )}

        {state === "none" && (
          <div style={{ display: "flex", gap: 9, alignItems: "center", background: "#FBE3DE", borderRadius: 14, padding: "13px 15px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D14B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            <span style={{ font: "600 12.5px Inter", color: "#9c3a2d" }}>Código não encontrado no registo público.</span>
          </div>
        )}

        <p style={{ font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45, margin: 0 }}>
          A consulta pública confirma a validade da morada sem revelar dados pessoais do titular.
        </p>
      </div>

      {/* scanner de câmara em ecrã inteiro */}
      {scanning && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#000", display: "flex", flexDirection: "column" }}>
          <video ref={videoRef} playsInline muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          {/* moldura de leitura */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: 230, height: 230, borderRadius: 20, boxShadow: "0 0 0 100vmax rgba(0,0,0,.5)", border: "2px solid #E8C97A" }} />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
            <span style={{ font: "700 13px Inter", color: "#F8F5F0", background: "rgba(0,0,0,.5)", borderRadius: 10, padding: "6px 12px" }}>Ler QR AFROLOC</span>
            <button onClick={() => setScanning(false)} style={{ all: "unset", cursor: "pointer", font: "700 13px Inter", color: "#F8F5F0", background: "rgba(0,0,0,.5)", borderRadius: 10, padding: "6px 14px" }}>Cancelar</button>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px", textAlign: "center", zIndex: 2, font: "500 13px Inter", color: "#F8F5F0", background: "linear-gradient(180deg, transparent, rgba(0,0,0,.7))" }}>
            {scanError ?? "Aponte a câmara ao código QR AFROLOC."}
          </div>
        </div>
      )}

      {/* Radar para chegar ao estabelecimento (só locais públicos da Yamioo) */}
      {radar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#0C0B0A", display: "flex", flexDirection: "column" }}>
          <AfrolocRadar
            target={{ lat: radar.lat, lng: radar.lng }}
            title={radar.title}
            subtitle={`Yamioo · ${radar.code}`}
            onClose={() => setRadar(null)}
            mapboxToken={MAPBOX_TOKEN}
          />
        </div>
      )}
    </PhoneChrome>
  );
}

function Row({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <span style={{ font: "500 11px Inter", color: "#8A8073", textTransform: "uppercase", letterSpacing: ".04em", flex: "none" }}>{k}</span>
      <span style={{ font: "700 13.5px Inter", color: green ? "#2F7A57" : "#1A1814", textAlign: "right" }}>{v}</span>
    </div>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "1px solid #EAE3D7", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;
