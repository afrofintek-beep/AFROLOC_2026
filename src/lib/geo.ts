// Geospatial helpers for wayfinding: distance, initial bearing, cardinal.

const R = 6_371_000; // Earth radius (m)
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance between two coordinates, in metres. */
export function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Initial bearing from A to B, degrees clockwise from north (0–360). */
export function bearingDeg(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const φ1 = toRad(aLat);
  const φ2 = toRad(bLat);
  const Δλ = toRad(bLng - aLng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const SHORT = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
const FULL = ["norte", "nordeste", "este", "sudeste", "sul", "sudoeste", "oeste", "noroeste"];

export function cardinalShort(deg: number): string {
  return SHORT[Math.round(((deg % 360) / 45)) % 8];
}
export function cardinalFull(deg: number): string {
  return FULL[Math.round(((deg % 360) / 45)) % 8];
}

/** Human distance: "240 m" or "1.3 km". */
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

/** Rough walking time at ~5 km/h, in minutes (min 1). */
export function walkMinutes(m: number): number {
  return Math.max(1, Math.round(m / 83.3));
}

/** Destination point given a start, distance (m) and bearing (deg from north). */
export function destinationPoint(
  lat: number,
  lng: number,
  distM: number,
  bearing: number,
): { lat: number; lng: number } {
  const δ = distM / R;
  const θ = toRad(bearing);
  const φ1 = toRad(lat);
  const λ1 = toRad(lng);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: toDeg(φ2), lng: ((toDeg(λ2) + 540) % 360) - 180 };
}
