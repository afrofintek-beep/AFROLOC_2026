// Mapbox — o MESMO provedor/estilo que a Yamioo usa na navegação "Como chegar".
// Token PÚBLICO (pk.) da afrofintek — seguro no cliente (é desenhado para ir no
// bundle web). Vem de `VITE_MAPBOX_TOKEN` (.env.local, cozido no build) para não
// ficar hard-coded no repositório.
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

export interface RouteStep {
  /** Instrução por MARCO ("Na loja X, vire à esquerda"), pronta a mostrar. */
  text: string;
  /** Distância deste passo em metros. */
  distanceM: number;
  kind: "start" | "turn" | "straight" | "arrive";
}

export interface RouteResult {
  /** Geometria da rota em [lat, lng] (formato que o NavMap espera). */
  coords: [number, number][];
  /** true = fallback em linha reta (sem rota do serviço). */
  straight: boolean;
  distanceM: number;
  /** Passos por marcos de referência ao longo do caminho. */
  steps: RouteStep[];
}

/**
 * Rota a pé entre dois pontos pela Mapbox Directions API (igual à Yamioo).
 * Se o serviço falhar, cai numa linha reta origem→destino.
 */
export async function fetchWalkingRoute(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): Promise<RouteResult> {
  try {
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/walking/` +
      `${origin.lng},${origin.lat};${dest.lng},${dest.lat}` +
      `?geometries=geojson&overview=full&steps=true&language=pt&access_token=${MAPBOX_TOKEN}`;
    const r = await fetch(url);
    const j = await r.json();
    const route = j?.routes?.[0];
    const line = route?.geometry?.coordinates as [number, number][] | undefined;
    if (line && line.length > 1) {
      const rawSteps = (route?.legs?.[0]?.steps ?? []) as MbStep[];
      const steps = await buildLandmarkSteps(rawSteps);
      return {
        coords: line.map(([ln, la]) => [la, ln] as [number, number]),
        straight: false,
        distanceM: route.distance ?? 0,
        steps,
      };
    }
  } catch {
    /* cai na linha reta */
  }
  return {
    coords: [[origin.lat, origin.lng], [dest.lat, dest.lng]],
    straight: true,
    distanceM: 0,
    steps: [{ text: "Siga a bússola na direção do destino.", distanceM: 0, kind: "start" }],
  };
}

// ── Direções por MARCOS de referência ───────────────────────
// Converte as manobras da rota em instruções por marco: em cada viragem,
// procura o POI mais próximo (igreja, loja, esquadra, escola…) e forma a frase
// ("Na loja X, vire à esquerda" · "À frente da igreja, siga em frente").

interface MbStep {
  distance?: number;
  maneuver?: { location?: [number, number]; type?: string; modifier?: string; instruction?: string };
}

/** Termo em PT para uma classe de POI do Mapbox (por substring; com género). */
function landmarkTerm(cls: string, name?: string): { noun: string; fem: boolean } | null {
  const c = (cls || "").toLowerCase();
  const n = name ? ` ${name}` : "";
  const has = (...k: string[]) => k.some((x) => c.includes(x));
  if (has("worship", "religio", "church")) return { noun: `igreja${n}`, fem: true };
  if (has("police")) return { noun: "esquadra da polícia", fem: true };
  if (has("school", "college", "university", "education", "kindergarten")) return { noun: name ? `escola ${name}` : "escola", fem: true };
  if (has("hospital", "health", "clinic", "medical")) return { noun: `posto de saúde${n}`, fem: false };
  if (has("pharm")) return { noun: `farmácia${n}`, fem: true };
  if (has("fuel", "gas_station")) return { noun: `bomba de combustível${n}`, fem: true };
  if (has("market")) return { noun: `mercado${n}`, fem: false };
  if (has("bank", "finance")) return { noun: `banco${n}`, fem: false };
  if (has("food", "restaurant", "bar", "cafe", "coffee")) return { noun: name ?? "restaurante", fem: false };
  if (has("commercial", "shop", "store", "grocery", "convenience", "retail", "supermarket")) return { noun: name ? `loja ${name}` : "loja", fem: true };
  if (has("park", "garden", "pitch", "stadium")) return { noun: `parque${n}`, fem: false };
  // POI com nome mas classe genérica → usa o nome (assume masculino "no").
  return name ? { noun: name, fem: false } : null;
}

/** POI de referência mais próximo de um ponto (Mapbox Tilequery, ≤45 m). */
async function nearestLandmark(lng: number, lat: number): Promise<{ cls: string; name?: string } | null> {
  try {
    const url =
      `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json` +
      `?radius=45&limit=6&dedupe=true&layers=poi_label&access_token=${MAPBOX_TOKEN}`;
    const r = await fetch(url);
    const j = await r.json();
    const feats = (j?.features ?? []) as { properties?: Record<string, unknown> }[];
    // Prefere POIs com nome; senão, o mais próximo com classe reconhecível.
    const named = feats.find((f) => typeof f.properties?.name === "string" && (f.properties?.name as string).length > 1);
    const pick = named ?? feats[0];
    if (!pick?.properties) return null;
    const cls = (pick.properties.class as string) || (pick.properties.maki as string) || (pick.properties.type as string) || "";
    const name = typeof pick.properties.name === "string" ? (pick.properties.name as string) : undefined;
    return { cls, name };
  } catch {
    return null;
  }
}

/** Manobra → verbo em PT. */
function maneuverVerb(type?: string, modifier?: string): string {
  if (type === "arrive") return "chegou";
  if (type === "depart") return "siga em frente";
  const m = modifier ?? "";
  if (m.includes("left")) return m.includes("slight") ? "vire ligeiramente à esquerda" : "vire à esquerda";
  if (m.includes("right")) return m.includes("slight") ? "vire ligeiramente à direita" : "vire à direita";
  if (m === "uturn") return "inverta o sentido";
  return "siga em frente";
}

async function buildLandmarkSteps(raw: MbStep[]): Promise<RouteStep[]> {
  // Limita a ~9 manobras significativas (evita passos triviais e muitos pedidos).
  const significant = raw.filter((s, i) => i === 0 || i === raw.length - 1 || (s.distance ?? 0) >= 25).slice(0, 10);
  const out: RouteStep[] = [];
  for (let i = 0; i < significant.length; i++) {
    const s = significant[i];
    const type = s.maneuver?.type;
    const modifier = s.maneuver?.modifier;
    const loc = s.maneuver?.location;
    if (type === "arrive") {
      out.push({ text: "Chegou ao seu destino.", distanceM: 0, kind: "arrive" });
      continue;
    }
    const verb = maneuverVerb(type, modifier);
    let text = verb.charAt(0).toUpperCase() + verb.slice(1) + ".";
    let kind: RouteStep["kind"] = i === 0 ? "start" : verb.includes("vire") ? "turn" : "straight";
    // Enriquecer com marco (exceto o arranque, que fica genérico).
    if (loc && i > 0) {
      const lm = await nearestLandmark(loc[0], loc[1]);
      const term = lm ? landmarkTerm(lm.cls, lm.name) : null;
      if (term) {
        text =
          verb === "siga em frente"
            ? `À frente d${term.fem ? "a" : "o"} ${term.noun}, siga em frente.`
            : `${term.fem ? "Na" : "No"} ${term.noun}, ${verb}.`;
        kind = verb.includes("vire") ? "turn" : "straight";
      }
    }
    out.push({ text, distanceM: Math.round(s.distance ?? 0), kind });
  }
  return out;
}
