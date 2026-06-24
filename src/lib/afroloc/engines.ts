// QG Engine (national grid) + SQ Engine (adaptive subdivision) — spec §4 / §5.
import { encodeCoord, fromMercator, toMercator } from "./geo";
import { encode, type Zone } from "./sdk";

export interface AdminCodes {
  provinceCode?: string;
  municipalityCode?: string;
  communeCode?: string;
  neighborhoodCode?: string;
}

export interface QGResult {
  /** Nomenclature code when admin codes are present, else the legacy/standard code. */
  afroloc: string;
  afrolocLegacy: string;
  country: string;
  zone: Zone;
  grid_m: number;
  tile_ix: number;
  tile_iy: number;
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  centroid: { lat: number; lon: number };
  webMercator: { x: number; y: number };
}

/**
 * QG Engine — projects WGS84 → Web Mercator and computes the national grid cell
 * (10 m urban / 25 m rural). Builds the nomenclature code
 * CC-PROV-MUN-COM-BAI-G10-X-Y when admin codes are supplied (spec §4.1),
 * otherwise the legacy CC-ZU-G10-X-Y.
 */
export function qgEncode(
  latitude: number,
  longitude: number,
  countryCode: string,
  zone: Zone,
  admin: AdminCodes = {},
  registrationType: "formal" | "digital" = "formal",
): QGResult {
  const enc = encode(latitude, longitude, countryCode, zone);
  const cc = countryCode.toUpperCase();
  const gridTag = zone === "urban" ? "G10" : "G25";
  const xy = `X${encodeCoord(enc.ix)}-Y${encodeCoord(enc.iy)}`;

  const { provinceCode, municipalityCode, communeCode, neighborhoodCode } = admin;
  let afroloc = enc.code;
  // Nomenclature requires province + município + comuna; bairro only for formal.
  if (provinceCode && municipalityCode && communeCode) {
    const bai = registrationType === "formal" ? neighborhoodCode || "GEN" : "DIG";
    afroloc = [cc, provinceCode, municipalityCode, communeCode, bai, gridTag, xy].join("-");
  }

  const minX = enc.ix * enc.gridSize;
  const minY = enc.iy * enc.gridSize;
  const minCorner = fromMercator(minX, minY);
  const maxCorner = fromMercator(minX + enc.gridSize, minY + enc.gridSize);
  const center = fromMercator(minX + enc.gridSize / 2, minY + enc.gridSize / 2);
  const merc = toMercator(latitude, longitude);

  return {
    afroloc,
    afrolocLegacy: enc.code,
    country: cc,
    zone,
    grid_m: enc.gridSize,
    tile_ix: enc.ix,
    tile_iy: enc.iy,
    bbox: { minLat: minCorner.lat, maxLat: maxCorner.lat, minLon: minCorner.lon, maxLon: maxCorner.lon },
    centroid: { lat: center.lat, lon: center.lon },
    webMercator: { x: merc.x, y: merc.y },
  };
}

// ── SQ Engine ──────────────────────────────────────────────────────────────
export type DensityClass = "low" | "medium" | "high" | "very_high";
export type SubdivisionType = "2x2" | "3x3" | "4x4" | "5x5";

export const DENSITY_THRESHOLDS = { low: 10, medium: 50, high: 150 } as const;

export const SQ_LABELS: Record<SubdivisionType, string[]> = {
  "2x2": ["A", "B", "C", "D"],
  "3x3": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  "4x4": ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4", "D1", "D2", "D3", "D4"],
  "5x5": [
    "A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5",
    "C1", "C2", "C3", "C4", "C5", "D1", "D2", "D3", "D4", "D5",
    "E1", "E2", "E3", "E4", "E5",
  ],
};

export function classifyDensity(count: number): DensityClass {
  if (count <= DENSITY_THRESHOLDS.low) return "low";
  if (count <= DENSITY_THRESHOLDS.medium) return "medium";
  if (count <= DENSITY_THRESHOLDS.high) return "high";
  return "very_high";
}

const TIER_FOR_CLASS: Record<DensityClass, SubdivisionType> = {
  low: "2x2",
  medium: "3x3",
  high: "4x4",
  very_high: "5x5",
};

export function subdivisionForCount(count: number): SubdivisionType {
  return TIER_FOR_CLASS[classifyDensity(count)];
}

export interface CellBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface SQResult {
  sqCode: string;
  fullCode: string;
  subdivisionType: SubdivisionType;
  subCellIndex: string;
  subCellBounds: CellBounds;
  densityMetrics: {
    certificationCount: number;
    densityClass: DensityClass;
    cacheHit: boolean;
  };
}

/**
 * SQ Engine — subdivides the QG cell into A–D / 1–9 / A1–D4 / A1–E5 by the
 * certification density already recorded in the cell (spec §5). The sub-cell
 * scopes the final local sequence.
 */
export function sqEncode(
  qgAfroloc: string,
  latitude: number,
  longitude: number,
  cellBounds: CellBounds,
  certificationCount: number,
  cacheHit = false,
): SQResult {
  const subdivisionType = subdivisionForCount(certificationCount);
  const n = parseInt(subdivisionType[0], 10);
  const labels = SQ_LABELS[subdivisionType];

  const lonSpan = cellBounds.maxLon - cellBounds.minLon || 1e-9;
  const latSpan = cellBounds.maxLat - cellBounds.minLat || 1e-9;
  const col = Math.max(0, Math.min(n - 1, Math.floor(((longitude - cellBounds.minLon) / lonSpan) * n)));
  // Row 0 is the top (maxLat).
  const row = Math.max(0, Math.min(n - 1, Math.floor(((cellBounds.maxLat - latitude) / latSpan) * n)));
  const index = row * n + col;
  const sqCode = labels[index] ?? labels[0];

  const cellW = lonSpan / n;
  const cellH = latSpan / n;
  const subMinLon = cellBounds.minLon + col * cellW;
  const subMaxLat = cellBounds.maxLat - row * cellH;
  const subCellBounds: CellBounds = {
    minLon: subMinLon,
    maxLon: subMinLon + cellW,
    maxLat: subMaxLat,
    minLat: subMaxLat - cellH,
  };

  return {
    sqCode,
    // fullCode = QG nomenclature code; the visible address appends the sequence.
    fullCode: qgAfroloc,
    subdivisionType,
    subCellIndex: sqCode,
    subCellBounds,
    densityMetrics: { certificationCount, densityClass: classifyDensity(certificationCount), cacheHit },
  };
}
