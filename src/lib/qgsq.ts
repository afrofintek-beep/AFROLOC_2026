// QGSQ cell helper — now backed by the real AFROLOC engine (Web Mercator grid,
// spec §4). Kept as a thin adapter so map components/screens consume the same
// shape while the codes and geometry come from the SDK.
import { qgEncode } from "./afroloc/engines";
import type { AdminCodes } from "./afroloc/engines";

export interface QgsqGeoCell {
  code: string; // real AFROLOC cell code, e.g. "AO-ZU-G10-X35O8-YN247T"
  sizeM: 10 | 25;
  zone: "urbana" | "rural";
  center: { lat: number; lng: number };
  /** Cell bounds as [south, west, north, east] for drawing on a map. */
  bounds: [number, number, number, number];
}

/**
 * Resolve the QG cell for coordinates. `sizeM` 10 → urban (10 m), otherwise
 * rural (25 m, per the updated spec). Pass `countryIso`/`admin` to embed the
 * nomenclature; otherwise the legacy standard cell code is returned.
 */
export function cellForCoords(
  lat: number,
  lng: number,
  sizeM: 10 | 25 = 10,
  countryIso = "AO",
  admin: AdminCodes = {},
): QgsqGeoCell {
  const zone = sizeM <= 10 ? "urban" : "rural";
  const qg = qgEncode(lat, lng, countryIso, zone, admin);
  return {
    // Use the legacy standard code as the human cell label (compact, stable).
    code: qg.afrolocLegacy,
    sizeM: zone === "urban" ? 10 : 25,
    zone: zone === "urban" ? "urbana" : "rural",
    center: { lat: qg.centroid.lat, lng: qg.centroid.lon },
    bounds: [qg.bbox.minLat, qg.bbox.minLon, qg.bbox.maxLat, qg.bbox.maxLon],
  };
}
