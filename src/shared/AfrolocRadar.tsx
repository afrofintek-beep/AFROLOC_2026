// ─────────────────────────────────────────────────────────────
// AfrolocRadar — chegada a um ponto AFROLOC, SEM ruas.
//
// Uma entrada única ("Radar") que abre TRÊS modos:
//   • RADAR — tu no centro, o destino é um blip na direção+distância reais.
//   • RA    — aponta a câmara e a AFROLOC flutua na direção real (bússola).
//   • MAPA  — mapa Mapbox com o trajeto a pé + marcos de referência.
// Serve Maguela (moto-táxi), Imbamba (entregas), Yamioo (descoberta), etc.
//
// AUTÓNOMO: só depende de React + APIs padrão do browser (Geolocation,
// DeviceOrientation, getUserMedia) e, para o trajeto/mapa/marcos, das APIs
// Mapbox (Directions + Static Images) via `mapboxToken` — SEM a lib mapbox-gl
// (usa a Static Images API, portanto cai em qualquer app React 18/19). Uso:
//   <AfrolocRadar target={{lat,lng}} title="AO-LUA-…" subtitle="…"
//                 onClose={...} mapboxToken={MAPBOX_TOKEN} />
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState } from "react";

export interface LatLng { lat: number; lng: number; }
export type GuideMode = "radar" | "ar" | "map";
export interface AfrolocRadarProps {
  target: LatLng;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  mapboxToken?: string;
  initialMode?: GuideMode;
  style?: React.CSSProperties;
}

// ── geo (inline, portável) ───────────────────────────────────
const R_EARTH = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;
function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(s)));
}
function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
function fmtDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km` : `${Math.round(m)} m`;
}
// ── meio de locomoção (perfil Mapbox + velocidade p/ ETA) ────
export type Transport = "walk" | "bike" | "moto" | "car";
export const TRANSPORT_ORDER: Transport[] = ["walk", "bike", "moto", "car"];
export const TRANSPORT: Record<Transport, {
  label: string;        // "A pé"
  adverbial: string;    // "a pé" / "de mota"
  profile: string;      // perfil da Mapbox Directions
  speedMPerMin: number; // recurso p/ ETA quando não há rota
  offRouteM: number;    // desvio ao traçado que dispara re-traçado
}> = {
  walk: { label: "A pé",  adverbial: "a pé",         profile: "walking",         speedMPerMin: 80,  offRouteM: 40 },
  bike: { label: "Bici",  adverbial: "de bicicleta", profile: "cycling",         speedMPerMin: 260, offRouteM: 55 },
  moto: { label: "Moto",  adverbial: "de mota",      profile: "driving",         speedMPerMin: 550, offRouteM: 70 },
  car:  { label: "Carro", adverbial: "de carro",     profile: "driving-traffic", speedMPerMin: 550, offRouteM: 80 },
};

// ── polyline (Mapbox/Google, precisão 5) → pontos ────────────
function decodePolyline(str: string, precision = 5): LatLng[] {
  const factor = Math.pow(10, precision);
  let index = 0, lat = 0, lng = 0;
  const out: LatLng[] = [];
  while (index < str.length) {
    let result = 0, shift = 0, b: number;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    result = 0; shift = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    out.push({ lat: lat / factor, lng: lng / factor });
  }
  return out;
}
// distância acumulada de cada vértice até ao FIM do traçado.
function suffixLengths(pts: LatLng[]): number[] {
  const s = new Array<number>(pts.length).fill(0);
  for (let i = pts.length - 2; i >= 0; i--) {
    const a = pts[i], c = pts[i + 1];
    if (!a || !c) continue;
    s[i] = (s[i + 1] ?? 0) + haversine(a, c);
  }
  return s;
}
// distância REAL que falta percorrer ao longo do caminho + desvio à rota.
// Projeta a posição atual sobre o traçado já obtido — atualiza em direto, sem
// nova chamada à API.
function remainingAlong(pts: LatLng[], suffixM: number[], p: LatLng): { remainingM: number; offM: number } {
  if (pts.length < 2) return { remainingM: suffixM[0] ?? 0, offM: 0 };
  let best = { off: Infinity, rem: suffixM[0] ?? 0 };
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i], B = pts[i + 1];
    if (!A || !B) continue;
    const mLat = 111320, mLng = 111320 * Math.cos(toRad(A.lat));
    const bx = (B.lng - A.lng) * mLng, by = (B.lat - A.lat) * mLat;
    const px = (p.lng - A.lng) * mLng, py = (p.lat - A.lat) * mLat;
    const len2 = bx * bx + by * by;
    const t = len2 > 0 ? Math.max(0, Math.min(1, (px * bx + py * by) / len2)) : 0;
    const off = Math.hypot(px - t * bx, py - t * by);
    if (off < best.off) best = { off, rem: (suffixM[i + 1] ?? 0) + (1 - t) * Math.sqrt(len2) };
  }
  return { remainingM: best.rem, offM: best.off };
}
// ETA em minutos: usa a duração real da rota (proporcional ao que falta) ou,
// em recurso, a velocidade típica do meio escolhido.
function etaMinFrom(remainingM: number, totalM: number, durationS: number, t: Transport): number {
  if (totalM > 0 && durationS > 0) return Math.max(1, Math.round((remainingM / (totalM / durationS)) / 60));
  return Math.max(1, Math.round(remainingM / TRANSPORT[t].speedMPerMin));
}

type Bucket = "far" | "near" | "close" | "veryclose" | "arrived";
const META: Record<Bucket, { color: string; glow: string; phrase: string; sweep: number }> = {
  far: { color: "#D4A853", glow: "#D4A85355", phrase: "A caminho", sweep: 4.2 },
  near: { color: "#E07B2C", glow: "#E07B2C55", phrase: "A aproximar-se", sweep: 3.2 },
  close: { color: "#E8C97A", glow: "#E8C97A66", phrase: "Muito perto", sweep: 2.2 },
  veryclose: { color: "#5BC48E", glow: "#5BC48E66", phrase: "Quase lá", sweep: 1.4 },
  arrived: { color: "#2F7A57", glow: "#5BC48E88", phrase: "Chegou", sweep: 1.0 },
};
const bucketOf = (d: number): Bucket => d < 15 ? "arrived" : d < 60 ? "veryclose" : d < 250 ? "close" : d < 1000 ? "near" : "far";

// ── trajeto a pé (Mapbox Directions) + marcos de referência ──
interface Step { text: string; distanceM: number; kind: "turn" | "straight" | "arrive" | "start"; }
interface Route { steps: Step[]; polyline: string | null; pts: LatLng[]; suffixM: number[]; totalM: number; durationS: number; }
const EMPTY_ROUTE: Route = { steps: [], polyline: null, pts: [], suffixM: [], totalM: 0, durationS: 0 };
function landmarkTerm(cls: string, name?: string): { noun: string; fem: boolean } | null {
  const c = (cls || "").toLowerCase(); const n = name ? ` ${name}` : "";
  const has = (...k: string[]) => k.some((x) => c.includes(x));
  if (has("worship", "church", "religio")) return { noun: `igreja${n}`, fem: true };
  if (has("police")) return { noun: "esquadra da polícia", fem: true };
  if (has("school", "college", "education")) return { noun: name ? `escola ${name}` : "escola", fem: true };
  if (has("hospital", "health", "clinic")) return { noun: `posto de saúde${n}`, fem: false };
  if (has("pharm")) return { noun: `farmácia${n}`, fem: true };
  if (has("fuel", "gas_station")) return { noun: `bomba de combustível${n}`, fem: true };
  if (has("market")) return { noun: `mercado${n}`, fem: false };
  if (has("bank", "finance")) return { noun: `banco${n}`, fem: false };
  if (has("food", "restaurant", "bar", "cafe")) return { noun: name ?? "restaurante", fem: false };
  if (has("commercial", "shop", "store", "grocery", "retail")) return { noun: name ? `loja ${name}` : "loja", fem: true };
  return name ? { noun: name, fem: false } : null;
}
function verbOf(type?: string, mod?: string): string {
  if (type === "depart") return "siga em frente";
  const m = mod ?? "";
  if (m.includes("left")) return m.includes("slight") ? "vire ligeiramente à esquerda" : "vire à esquerda";
  if (m.includes("right")) return m.includes("slight") ? "vire ligeiramente à direita" : "vire à direita";
  return "siga em frente";
}
interface MbStep { distance?: number; maneuver?: { type?: string; modifier?: string; location?: number[] } }
interface MbFeature { properties?: { name?: string; class?: string; maki?: string } }
async function fetchRoute(origin: LatLng, dest: LatLng, token: string, profile = "walking"): Promise<Route> {
  try {
    const dir = await (await fetch(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?geometries=polyline&steps=true&language=pt&access_token=${token}`)).json();
    const route = dir?.routes?.[0];
    const polyline: string | null = route?.geometry ?? null;
    const pts = polyline ? decodePolyline(polyline) : [];
    const suffixM = suffixLengths(pts);
    const totalM: number = route?.distance ?? (suffixM[0] ?? 0);
    const durationS: number = route?.duration ?? 0;
    const raw = (route?.legs?.[0]?.steps ?? []) as MbStep[];
    const sig = raw.filter((s, i) => i === 0 || i === raw.length - 1 || (s.distance ?? 0) >= 25).slice(0, 9);
    const out: Step[] = [];
    for (let i = 0; i < sig.length; i++) {
      const s = sig[i];
      if (!s) continue;
      const t = s.maneuver?.type, mod = s.maneuver?.modifier, loc = s.maneuver?.location;
      if (t === "arrive") { out.push({ text: "Chegou ao seu destino.", distanceM: 0, kind: "arrive" }); continue; }
      const v = verbOf(t, mod); let text = v.charAt(0).toUpperCase() + v.slice(1) + ".";
      const kind: Step["kind"] = i === 0 ? "start" : v.includes("vire") ? "turn" : "straight";
      if (loc && i > 0) {
        try {
          const tq = await (await fetch(`https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${loc[0]},${loc[1]}.json?radius=45&limit=5&layers=poi_label&access_token=${token}`)).json();
          const f = (tq?.features || []).find((x: MbFeature) => x.properties?.name) || (tq?.features || [])[0];
          const lm = f?.properties ? landmarkTerm(f.properties.class || f.properties.maki, f.properties.name) : null;
          if (lm) text = v === "siga em frente" ? `À frente d${lm.fem ? "a" : "o"} ${lm.noun}, siga em frente.` : `${lm.fem ? "Na" : "No"} ${lm.noun}, ${v}.`;
        } catch { /* mantém genérico */ }
      }
      out.push({ text, distanceM: Math.round(s.distance ?? 0), kind });
    }
    return { steps: out, polyline, pts, suffixM, totalM, durationS };
  } catch { return EMPTY_ROUTE; }
}

// ── hooks (portáveis) ────────────────────────────────────────
function useLivePosition(): LatLng | null {
  const [pos, setPos] = useState<LatLng | null>(null);
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return pos;
}
function useHeading(): { heading: number | null; requestCompass: () => void } {
  const [heading, setHeading] = useState<number | null>(null);
  const handler = useRef((e: DeviceOrientationEvent) => {
    const h = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) % 360 : null);
    if (h != null && !Number.isNaN(h)) setHeading(h);
  });
  useEffect(() => {
    const h = handler.current;
    window.addEventListener("deviceorientationabsolute", h as EventListener, true);
    window.addEventListener("deviceorientation", h as EventListener, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", h as EventListener, true);
      window.removeEventListener("deviceorientation", h as EventListener, true);
    };
  }, []);
  const requestCompass = () => {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (D && typeof D.requestPermission === "function") D.requestPermission().catch(() => {});
  };
  return { heading, requestCompass };
}
function useCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null, cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); setOn(true); }
      } catch (e) {
        setOn(false);
        const name = (e as { name?: string } | null)?.name;
        setError(name === "NotAllowedError" ? "Permita o acesso à câmara para a RA." : "Câmara indisponível neste dispositivo.");
      }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); setOn(false); };
  }, [active]);
  return { videoRef, on, error };
}

// ── util UI ──────────────────────────────────────────────────
function proximityPill(bucket: Bucket, eta: number, transport: Transport) {
  const m = META[bucket];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#17150F", border: `1px solid ${m.color}44`, borderRadius: 20, padding: "8px 16px" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
      <span style={{ font: "700 14px system-ui,Inter,sans-serif", color: "#F8F5F0" }}>{m.phrase}</span>
      {bucket !== "arrived" && <span style={{ font: "400 13px system-ui,sans-serif", color: "#8A8073" }}>· ~{eta} min {TRANSPORT[transport].adverbial}</span>}
    </span>
  );
}
// Ícone do meio de locomoção (linha, herda a cor via currentColor).
function TransportIcon({ t }: { t: Transport }) {
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (t === "walk") return <svg {...p}><circle cx="13" cy="4" r="1.6" /><path d="M13 22l-1-6-3-2 1.5-5 3 2 2.5 1M9 22l2-4" /></svg>;
  if (t === "bike") return <svg {...p}><circle cx="5.8" cy="17" r="3.2" /><circle cx="18.2" cy="17" r="3.2" /><path d="M5.8 17l4-7h3.5M10 10l3.5 7M13 8h3.2l1.5 3.5" /></svg>;
  if (t === "moto") return <svg {...p}><circle cx="5.5" cy="17.5" r="2.7" /><circle cx="18.5" cy="17.5" r="2.7" /><path d="M5.5 17.5h5l3-3.5h3.5M13 8.5h3l1.2 3.2" /></svg>;
  return <svg {...p}><path d="M4 12l2-4.5h9l3 4.5" /><path d="M3 16.5h18v-3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" /><circle cx="7.5" cy="16.5" r="1.8" /><circle cx="16.5" cy="16.5" r="1.8" /></svg>;
}
function StepsList({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;
  return (
    <>
      <div style={{ font: "700 10px system-ui,sans-serif", letterSpacing: ".12em", color: "#6f665b", margin: "2px 2px 8px" }}>MARCOS NO CAMINHO</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((st, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#141210", border: `1px solid ${st.kind === "arrive" ? "#2F7A5766" : "#241f19"}`, borderRadius: 12, padding: "10px 12px" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", background: st.kind === "arrive" ? "#2F7A57" : "#2E2720", color: st.kind === "arrive" ? "#fff" : "#E8C97A", display: "flex", alignItems: "center", justifyContent: "center", font: "700 10px ui-monospace,monospace" }}>{st.kind === "arrive" ? "★" : i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: "600 13px system-ui,Inter,sans-serif", color: "#F8F5F0", lineHeight: 1.35 }}>{st.text}</div>
              {st.distanceM > 0 && <div style={{ font: "400 11px system-ui,sans-serif", color: "#8A8073", marginTop: 1 }}>{fmtDist(st.distanceM)}</div>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── modo RADAR ───────────────────────────────────────────────
function RadarView({ geomDist, showM, eta, transport, rel, heading, bucket, live, steps }: { geomDist: number; showM: number; eta: number; transport: Transport; rel: number; heading: number | null; bucket: Bucket; live: boolean; steps: Step[] }) {
  const m = META[bucket];
  const RAD = 128;
  const geom = useMemo(() => {
    const norm = Math.min(1, Math.log10(Math.max(geomDist, 1) + 1) / Math.log10(2001));
    const r = bucket === "arrived" ? 0 : Math.max(10, norm * RAD);
    const a = (rel * Math.PI) / 180;
    return { bx: 150 + r * Math.sin(a), by: 150 - r * Math.cos(a) };
  }, [geomDist, rel, bucket]);
  return (
    <>
      <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
        <div style={{ position: "relative", width: 300, height: 300 }}>
          <svg width="300" height="300" viewBox="0 0 300 300">
            {[RAD, RAD * 0.66, RAD * 0.33].map((rr, i) => (
              <circle key={i} cx="150" cy="150" r={rr} fill="none" stroke="#2A2620" strokeWidth="1.5" />
            ))}
            <line x1="150" y1="22" x2="150" y2="278" stroke="#201D18" strokeWidth="1" />
            <line x1="22" y1="150" x2="278" y2="150" stroke="#201D18" strokeWidth="1" />
            {/* bússola: cardeais N/E/S/O rodam com a direção real do telemóvel */}
            {[0, 90, 180, 270].map((b) => {
              const a = ((b - (heading ?? 0)) * Math.PI) / 180;
              const s = Math.sin(a), c = Math.cos(a);
              const isN = b === 0;
              const lbl = b === 0 ? "N" : b === 90 ? "E" : b === 180 ? "S" : "O";
              return (
                <g key={b} opacity={heading == null && !isN ? 0.45 : 1}>
                  <line x1={150 + 128 * s} y1={150 - 128 * c} x2={150 + 119 * s} y2={150 - 119 * c} stroke={isN ? m.color : "#3A342B"} strokeWidth={isN ? 2.4 : 1.5} strokeLinecap="round" />
                  <text x={150 + 141 * s} y={150 - 141 * c} textAnchor="middle" dominantBaseline="central" fill={isN ? m.color : "#8A8073"} style={{ font: `700 ${isN ? 15 : 12}px system-ui,sans-serif` }}>{lbl}</text>
                </g>
              );
            })}
            <g style={{ transformOrigin: "150px 150px", animation: `aflg-sweep ${m.sweep}s linear infinite` }}>
              <defs>
                <linearGradient id="aflg-sw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={m.color} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={m.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M150 150 L150 ${150 - RAD} A ${RAD} ${RAD} 0 0 1 ${150 + RAD * Math.sin(Math.PI / 4)} ${150 - RAD * Math.cos(Math.PI / 4)} Z`} fill="url(#aflg-sw)" />
            </g>
            <circle cx="150" cy="150" r="5.5" fill="#F8F5F0" />
            <circle cx="150" cy="150" r="10" fill="none" stroke="#F8F5F033" strokeWidth="1.5" />
            <circle cx={geom.bx} cy={geom.by} r={geomDist < 60 ? 16 : 30} fill={m.color} opacity="0.14" style={{ transformOrigin: `${geom.bx}px ${geom.by}px`, animation: "aflg-ripple 1.6s ease-out infinite" }} />
            <circle cx={geom.bx} cy={geom.by} r="9" fill={m.color} style={{ animation: "aflg-blip 1.4s ease-in-out infinite", filter: `drop-shadow(0 0 8px ${m.color})` }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ font: "700 34px ui-monospace,'Space Mono',monospace", color: m.color, marginTop: 78, textShadow: `0 0 18px ${m.glow}` }}>
              {bucket === "arrived" ? "Aqui" : fmtDist(showM)}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "6px 24px 6px", textAlign: "center" }}>{proximityPill(bucket, eta, transport)}</div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "2px 20px 14px" }}>
        {steps.length > 0 ? <StepsList steps={steps} /> : (
          <div style={{ font: "400 12px system-ui,sans-serif", color: "#6f665b", textAlign: "center", padding: "10px 8px", lineHeight: 1.5 }}>
            Caminhe para trazer o ponto ao centro. {live ? "A rodar pela bússola." : "Ative a bússola no telemóvel para rodar com a direção."}
          </div>
        )}
      </div>
    </>
  );
}

// ── modo RA (câmara) ─────────────────────────────────────────
const FOV = 64;
function ArView({ showM, eta, transport, relSigned, bucket, live, active }: { showM: number; eta: number; transport: Transport; relSigned: number; bucket: Bucket; live: boolean; active: boolean }) {
  const { videoRef, on, error } = useCamera(active);
  const m = META[bucket];
  const onScreen = Math.abs(relSigned) <= FOV / 2;
  const xPct = Math.max(4, Math.min(96, 50 + (relSigned / (FOV / 2)) * 46));
  const side = relSigned < 0 ? "left" : "right";
  const scale = bucket === "arrived" ? 1.5 : bucket === "veryclose" ? 1.3 : bucket === "close" ? 1.1 : 1;
  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden", background: on ? "#000" : "linear-gradient(180deg,#141b24 0%,#0b0f14 55%,#0a0a0a 100%)" }}>
      <video ref={videoRef} playsInline muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: on ? 1 : 0 }} />
      {!on && <div style={{ position: "absolute", left: 0, right: 0, top: "55%", height: 1, background: "#ffffff14" }} />}
      {/* retículo central */}
      <div style={{ position: "absolute", top: "44%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 5 }}>
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" stroke="#ffffff55" strokeWidth="1.5"><path d="M21 4v8M21 30v8M4 21h8M30 21h8" /><circle cx="21" cy="21" r="3" /></svg>
      </div>
      {onScreen ? (
        <div style={{ position: "absolute", top: "44%", left: `${xPct}%`, transform: `translate(-50%,-50%) scale(${scale})`, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ position: "absolute", width: 70, height: 70, borderRadius: "50%", background: m.color, opacity: 0.2, animation: "aflg-ar-ripple 1.8s ease-out infinite" }} />
            <span style={{ width: 46, height: 46, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 22px ${m.color}`, animation: "aflg-ar-pulse 1.5s ease-in-out infinite" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12100c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
            </span>
          </div>
          <div style={{ marginTop: 8, background: "rgba(12,11,10,.82)", border: `1px solid ${m.color}`, borderRadius: 12, padding: "6px 12px", textAlign: "center" }}>
            <div style={{ font: "700 16px ui-monospace,'Space Mono',monospace", color: m.color }}>{bucket === "arrived" ? "Aqui" : fmtDist(showM)}</div>
            <div style={{ font: "600 10px system-ui,Inter,sans-serif", color: "#C9BCA6" }}>{m.phrase}</div>
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", top: "44%", [side === "left" ? "left" : "right"]: 16, transform: "translateY(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, pointerEvents: "none" } as React.CSSProperties}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: side === "left" ? "none" : "scaleX(-1)", filter: `drop-shadow(0 0 8px ${m.color})` }}><path d="M15 6l-6 6 6 6" /></svg>
          <span style={{ font: "700 11px system-ui,Inter,sans-serif", color: "#F8F5F0", background: "rgba(0,0,0,.55)", borderRadius: 8, padding: "4px 8px" }}>Rode para a {side === "left" ? "esquerda" : "direita"}</span>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 20, padding: "18px 18px 16px", background: "linear-gradient(180deg, transparent, rgba(0,0,0,.75) 45%)", textAlign: "center", font: "400 12px system-ui,Inter,sans-serif", color: "#C9BCA6", lineHeight: 1.5 }}>
        {bucket === "arrived"
          ? "Chegou ao ponto."
          : error
            ? error
            : on
              ? (live ? `Siga na direção do marcador · ~${eta} min ${TRANSPORT[transport].adverbial}` : "Ative a bússola para o marcador seguir a direção real.")
              : "Aponte o telemóvel ao mundo (câmara + bússola) para ver o ponto no espaço."}
      </div>
    </div>
  );
}

// ── modo MAPA (Mapbox Static Images API) ─────────────────────
function MapView({ pos, target, route, token, eta, transport, bucket }: { pos: LatLng | null; target: LatLng; route: Route; token?: string; eta: number; transport: Transport; bucket: Bucket }) {
  const url = useMemo(() => {
    if (!token) return null;
    const parts: string[] = [];
    if (route.polyline) parts.push(`path-5+f97316-0.9(${encodeURIComponent(route.polyline)})`);
    if (pos) parts.push(`pin-s+3b82f6(${pos.lng},${pos.lat})`);
    parts.push(`pin-l-star+2f7a57(${target.lng},${target.lat})`);
    const overlay = parts.join(",");
    const auto = !!(route.polyline || pos);
    const view = auto ? "auto" : `${target.lng},${target.lat},14`;
    const pad = auto ? "padding=56&" : ""; // padding só é válido com 'auto'
    return `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/static/${overlay}/${view}/640x420@2x?${pad}access_token=${token}`;
  }, [pos, target, route.polyline, token]);
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "640 / 420", background: "#141210", flex: "none" }}>
        {url ? (
          <img src={url} alt="Mapa do trajeto" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: "400 12px system-ui,sans-serif", color: "#6f665b", padding: 20, textAlign: "center" }}>
            Mapa indisponível (sem chave Mapbox). O radar e a RA continuam a funcionar.
          </div>
        )}
        <div style={{ position: "absolute", left: 12, bottom: 12 }}>{proximityPill(bucket, eta, transport)}</div>
      </div>
      <div style={{ padding: "12px 20px 16px" }}>
        {route.steps.length > 0
          ? <StepsList steps={route.steps} />
          : <div style={{ font: "400 12px system-ui,sans-serif", color: "#6f665b", textAlign: "center", padding: "8px", lineHeight: 1.5 }}>Ative a localização para traçar o trajeto a pé até ao ponto.</div>}
      </div>
    </div>
  );
}

// ── componente principal (Radar) ─────────────────────────────
const MODE_LABEL: Record<GuideMode, string> = { radar: "Radar", ar: "RA", map: "Mapa" };
export default function AfrolocRadar({ target, title, subtitle, onClose, mapboxToken, initialMode = "radar", style }: AfrolocRadarProps) {
  const pos = useLivePosition();
  const { heading, requestCompass } = useHeading();
  const [mode, setMode] = useState<GuideMode>(initialMode);
  const [transport, setTransport] = useState<Transport>("walk");
  const [route, setRoute] = useState<Route>(EMPTY_ROUTE);
  const lastBucket = useRef<Bucket | null>(null);
  const routeRef = useRef<Route>(route);
  const lastRouteRef = useRef<{ origin: LatLng; profile: string; at: number } | null>(null);

  useEffect(() => { requestCompass(); }, []); // eslint-disable-line
  useEffect(() => { routeRef.current = route; }, [route]);
  // Traça e RE-TRAÇA o trajeto: quando muda o meio de locomoção, quando a pessoa
  // anda o suficiente, ou quando sai do caminho. Entre re-traçados, o "restante"
  // desce em direto pela projeção sobre o polyline já obtido (sem novas chamadas).
  useEffect(() => {
    if (!mapboxToken || !pos) return;
    const profile = TRANSPORT[transport].profile;
    const last = lastRouteRef.current;
    const now = Date.now();
    const r = routeRef.current;
    const profChanged = !last || last.profile !== profile;
    const movedFar = !last || haversine(pos, last.origin) > 150;
    const offRoute = r.pts.length > 1 && remainingAlong(r.pts, r.suffixM, pos).offM > TRANSPORT[transport].offRouteM;
    const cooled = !last || now - last.at > 6000;
    if (profChanged || ((movedFar || offRoute) && cooled)) {
      lastRouteRef.current = { origin: pos, profile, at: now };
      fetchRoute(pos, target, mapboxToken, profile).then(setRoute);
    }
  }, [mapboxToken, pos, transport, target]);

  // Seed enquanto não há GPS (orienta de imediato).
  const cur = pos ?? { lat: target.lat - 0.0015, lng: target.lng - 0.0012 };
  const straight = haversine(cur, target);            // linha reta — geometria/direção
  const prog = route.pts.length > 1 ? remainingAlong(route.pts, route.suffixM, cur) : null;
  const travel = prog ? prog.remainingM : straight;   // distância REAL restante a percorrer
  const brg = bearing(cur, target);
  const rel = heading != null ? (brg - heading + 360) % 360 : brg;
  const relSigned = heading != null ? ((brg - heading + 540) % 360) - 180 : (brg > 180 ? brg - 360 : brg);
  const live = heading != null;
  // Chegada é física (linha reta ao ponto); caso contrário, cor/frase pela distância real.
  const bucket = straight < 15 ? "arrived" : bucketOf(travel);
  const eta = etaMinFrom(travel, route.totalM, route.durationS, transport);

  useEffect(() => {
    if (lastBucket.current && lastBucket.current !== bucket) {
      try { navigator.vibrate?.(bucket === "arrived" ? [40, 60, 40, 60, 120] : [30]); } catch { /* */ }
    }
    lastBucket.current = bucket;
  }, [bucket]);

  const m = META[bucket];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 480, display: "flex", flexDirection: "column", color: "#F8F5F0", background: mode === "ar" ? "#000" : `radial-gradient(120% 80% at 50% 28%, ${m.glow} 0%, #0C0B0A 60%)`, ...style }}>
      <style>{`
        @keyframes aflg-sweep { to { transform: rotate(360deg) } }
        @keyframes aflg-blip { 0%,100%{opacity:1} 50%{opacity:.7} }
        @keyframes aflg-ripple { 0%{transform:scale(.2);opacity:.8} 100%{transform:scale(1);opacity:0} }
        @keyframes aflg-ar-pulse { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.12);opacity:1} }
        @keyframes aflg-ar-ripple { 0%{transform:scale(.4);opacity:.7} 100%{transform:scale(1.6);opacity:0} }
      `}</style>

      {/* cabeçalho + seletor de modo */}
      <div style={{ position: "relative", zIndex: 30, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 8px" }}>
        {onClose && (
          <button onClick={onClose} aria-label="Fechar" style={{ all: "unset", cursor: "pointer", width: 36, height: 36, borderRadius: 10, background: "rgba(26,24,20,.85)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F8F5F0" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12" /></svg>
          </button>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ font: "700 10px system-ui,Inter,sans-serif", letterSpacing: ".18em", color: "#8A8073" }}>RADAR AFROLOC</div>
          <div style={{ font: "700 12px ui-monospace,'Space Mono',monospace", color: "#E8C97A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title ?? "Destino"}</div>
          {subtitle && <div style={{ font: "400 11px system-ui,sans-serif", color: "#8A8073", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 30, display: "flex", gap: 6, padding: "0 16px 10px" }}>
        {(["radar", "ar", "map"] as GuideMode[]).map((md) => {
          const activeMode = md === mode;
          return (
            <button key={md} onClick={() => setMode(md)} style={{ all: "unset", cursor: "pointer", flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 11, font: "700 12.5px system-ui,Inter,sans-serif", color: activeMode ? "#12100c" : "#C9BCA6", background: activeMode ? "linear-gradient(135deg,#E8C97A,#D4A853)" : "rgba(255,255,255,.05)", border: `1px solid ${activeMode ? "transparent" : "#2A2620"}` }}>
              {MODE_LABEL[md]}
            </button>
          );
        })}
      </div>
      {/* seletor de meio de locomoção — muda o perfil de rota e o ETA */}
      <div style={{ position: "relative", zIndex: 30, display: "flex", gap: 6, padding: "0 16px 10px" }}>
        {TRANSPORT_ORDER.map((t) => {
          const on = t === transport;
          return (
            <button key={t} onClick={() => setTransport(t)} aria-label={TRANSPORT[t].label} aria-pressed={on} style={{ all: "unset", cursor: "pointer", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 0", borderRadius: 10, color: on ? "#E8C97A" : "#8A8073", background: on ? "rgba(232,201,122,.10)" : "rgba(255,255,255,.03)", border: `1px solid ${on ? "#E8C97A55" : "#241f19"}` }}>
              <TransportIcon t={t} />
              <span style={{ font: "700 10px system-ui,Inter,sans-serif" }}>{TRANSPORT[t].label}</span>
            </button>
          );
        })}
      </div>

      {mode === "radar" && <RadarView geomDist={straight} showM={travel} eta={eta} transport={transport} rel={rel} heading={heading} bucket={bucket} live={live} steps={route.steps} />}
      {mode === "ar" && <ArView showM={travel} eta={eta} transport={transport} relSigned={relSigned} bucket={bucket} live={live} active={mode === "ar"} />}
      {mode === "map" && <MapView pos={pos} target={target} route={route} token={mapboxToken} eta={eta} transport={transport} bucket={bucket} />}
    </div>
  );
}
