// AFROLOC geospatial core — Web Mercator (EPSG:3857) projection and the
// base36 coordinate codec. Implements the spec in
// "afroloc-logica-criacao-enderecos" §4 / §9.1 exactly so encode↔decode round-trip.

export const R = 6378137.0; // WGS84 radius used by Web Mercator
export const MAX_LAT = 85.05112878;

/** WGS84 lat/lon → Web Mercator metres. */
export function toMercator(lat: number, lon: number): { x: number; y: number } {
  const clampLat = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
  const x = R * (lon * (Math.PI / 180));
  const y = R * Math.log(Math.tan(Math.PI / 4 + (clampLat * (Math.PI / 180)) / 2));
  return { x, y };
}

/** Web Mercator metres → WGS84 lat/lon. */
export function fromMercator(x: number, y: number): { lat: number; lon: number } {
  const lon = (x / R) * (180 / Math.PI);
  const lat = (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * (180 / Math.PI);
  return { lat, lon };
}

// Tile indices can be negative (southern/western hemispheres). We zig-zag map
// the signed integer to an unsigned one before base36 so codes stay sign-free
// and deterministically reversible — matching the X.../Y... token style.
export function encodeCoord(n: number): string {
  const u = n >= 0 ? n * 2 : -n * 2 - 1;
  return u.toString(36).toUpperCase();
}

export function decodeCoord(s: string): number {
  const u = parseInt(s, 36);
  return u % 2 === 0 ? u / 2 : -(u + 1) / 2;
}

/** Great-circle distance in metres (spec §3.1). */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const Re = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Re * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
