// AFROLOC SDK — deterministic encode / decode / validate (spec §2.1, §9.1, §10).
// Identical algorithm client↔server, so offline-generated codes reconcile on sync.
import { COUNTRIES } from "../../data/africaAdmin";
import { MAX_LAT, decodeCoord, encodeCoord, fromMercator, toMercator } from "./geo";

export type Zone = "urban" | "rural";

/** The 54 African ISO-3166-1 alpha-2 codes (spec §3 — others are rejected). */
export const AFRICAN_COUNTRIES = new Set(COUNTRIES.map((c) => c.iso.toUpperCase()));

export const URBAN_CELL_SIZE = 10;
export const RURAL_CELL_SIZE = 25;

// CC-ZU-G10-Xxxxx-Yyyyy  (standard / legacy, spec §9.1)
export const STANDARD_PATTERN = /^([A-Z]{2})-(ZU|ZR)-(G10|G25)-X([0-9A-Z]+)-Y([0-9A-Z]+)$/;
// CC-PROV-MUN-COM-BAI-G10-Xxxxx-Yyyyy[-NNNN]  (nomenclature, spec §4.1)
export const NOMENCLATURE_PATTERN =
  /^([A-Z]{2})-([A-Z]{2,3})-([A-Z]{2,3})-([A-Z]{2,3})-([A-Z]{2,3})-(G10|G25)-X([0-9A-Z]+)-Y([0-9A-Z]+)(?:-\d{4})?$/;

export interface EncodeResult {
  code: string;
  zone: Zone;
  gridSize: number;
  ix: number;
  iy: number;
}

/** Encode coordinates into a standard AFROLOC grid code (spec §2.1). */
export function encode(lat: number, lon: number, countryCode: string, zone: Zone): EncodeResult {
  const cc = countryCode.toUpperCase();
  if (!AFRICAN_COUNTRIES.has(cc)) throw new Error(`Invalid African country code: ${countryCode}`);
  if (lat < -MAX_LAT || lat > MAX_LAT) throw new Error(`Latitude out of range: ${lat}`);
  if (lon < -180 || lon > 180) throw new Error(`Longitude out of range: ${lon}`);

  const gridSize = zone === "urban" ? URBAN_CELL_SIZE : RURAL_CELL_SIZE;
  const zoneTag = zone === "urban" ? "ZU" : "ZR";
  const gridTag = zone === "urban" ? "G10" : "G25";
  const { x, y } = toMercator(lat, lon);
  const ix = Math.floor(x / gridSize);
  const iy = Math.floor(y / gridSize);
  const code = `${cc}-${zoneTag}-${gridTag}-X${encodeCoord(ix)}-Y${encodeCoord(iy)}`;
  return { code, zone, gridSize, ix, iy };
}

export interface DecodeResult {
  countryCode: string;
  zone: Zone;
  gridSize: number;
  ix: number;
  iy: number;
  centroid: { lat: number; lon: number };
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

function cellGeometry(ix: number, iy: number, gridSize: number) {
  const minX = ix * gridSize;
  const minY = iy * gridSize;
  const minCorner = fromMercator(minX, minY);
  const maxCorner = fromMercator(minX + gridSize, minY + gridSize);
  const center = fromMercator(minX + gridSize / 2, minY + gridSize / 2);
  return {
    centroid: center,
    bbox: {
      minLat: minCorner.lat,
      maxLat: maxCorner.lat,
      minLon: minCorner.lon,
      maxLon: maxCorner.lon,
    },
  };
}

/** Decode an AFROLOC code (standard or nomenclature) to centroid + bbox (spec §9.1). */
export function decode(code: string): DecodeResult {
  const validated = validate(code);
  const normalized = validated.valid ? validated.normalizedCode ?? code : code;

  const std = normalized.match(STANDARD_PATTERN);
  if (std) {
    const [, cc, zoneStr, gridStr, xPart, yPart] = std;
    const zone: Zone = zoneStr === "ZU" ? "urban" : "rural";
    const gridSize = parseInt(gridStr.replace("G", ""), 10);
    const ix = decodeCoord(xPart);
    const iy = decodeCoord(yPart);
    return { countryCode: cc, zone, gridSize, ix, iy, ...cellGeometry(ix, iy, gridSize) };
  }

  const nom = normalized.match(NOMENCLATURE_PATTERN);
  if (nom) {
    const cc = nom[1];
    const gridStr = nom[6];
    const xPart = nom[7];
    const yPart = nom[8];
    const zone: Zone = gridStr === "G10" ? "urban" : "rural";
    const gridSize = parseInt(gridStr.replace("G", ""), 10);
    const ix = decodeCoord(xPart);
    const iy = decodeCoord(yPart);
    return { countryCode: cc, zone, gridSize, ix, iy, ...cellGeometry(ix, iy, gridSize) };
  }

  throw new Error(`Unrecognised AFROLOC code: ${code}`);
}

export interface ValidateResult {
  valid: boolean;
  normalizedCode?: string;
  format?: "standard" | "nomenclature";
  error?: string;
}

/** Validate / normalise a code; accepts standard and nomenclature formats (spec §10). */
export function validate(code: string): ValidateResult {
  const c = code.trim().toUpperCase();
  if (STANDARD_PATTERN.test(c)) return { valid: true, normalizedCode: c, format: "standard" };
  if (NOMENCLATURE_PATTERN.test(c)) return { valid: true, normalizedCode: c, format: "nomenclature" };
  return { valid: false, error: "Code does not match a known AFROLOC format" };
}

/** Distance between two codes' centroids, in metres (spec §10). */
export function distance(a: string, b: string): number {
  const ca = decode(a).centroid;
  const cb = decode(b).centroid;
  // reuse haversine via decode centroids
  const toRad = (d: number) => (d * Math.PI) / 180;
  const Re = 6371000;
  const dLat = toRad(cb.lat - ca.lat);
  const dLon = toRad(cb.lon - ca.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(ca.lat)) * Math.cos(toRad(cb.lat)) * Math.sin(dLon / 2) ** 2;
  return Re * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
