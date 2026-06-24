// Address-creation orchestrator — the call chain of spec §1:
// validate → GPS/EXIF integrity → QG engine → SQ engine → sequence → ATS.
// This is the deterministic offline path the SDK runs client-side (spec §9).
import { validateGpsIntegrity, validateRequest, type PhotoMetadata } from "./gps";
import { qgEncode, sqEncode, type AdminCodes } from "./engines";
import { computeAts, type AtsResult } from "./ats";
import type { Zone } from "./sdk";

export interface CreateAddressInput {
  latitude: number;
  longitude: number;
  accuracy: number;
  countryCode: string;
  zone: Zone;
  admin?: AdminCodes;
  registrationType?: "formal" | "digital";
  photoMetadata?: PhotoMetadata;
  // ATS trust signals
  hasPhoto?: boolean;
  witnessesConfirmed?: number;
  witnessesRequired?: number;
  validatorConfirmed?: boolean;
  authorityGps?: boolean;
  /** Certifications already in the QG cell (drives SQ subdivision). */
  densityCount?: number;
}

export interface CreateAddressResult {
  success: boolean;
  error?: string;
  flags?: string[];
  warnings?: string[];
  afrolocCode?: string; // final visible code, incl. local sequence
  qgCodeLegacy?: string;
  nomenclatureCode?: string;
  sqCode?: string;
  subdivisionType?: string;
  cellType?: Zone;
  gridM?: number;
  sequence?: number;
  status?: "draft";
  ats?: AtsResult;
  bbox?: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  centroid?: { lat: number; lon: number };
}

// Client-side local sequence per (fullCode + sq sub-cell). Server reconciles on
// sync; here it stands in for the DB COUNT(...) of spec §6.1.
const localSequence = new Map<string, number>();

export function createAfrolocAddress(input: CreateAddressInput): CreateAddressResult {
  // 1. Structural validation
  const req = validateRequest(input);
  if (!req.valid) return { success: false, error: req.error };

  // 2. GPS / EXIF anti-spoofing — blocking flags stop creation (spec §3)
  const gps = validateGpsIntegrity({
    latitude: input.latitude,
    longitude: input.longitude,
    countryCode: input.countryCode,
    accuracy: input.accuracy,
    photoMetadata: input.photoMetadata,
  });
  if (!gps.valid) {
    return {
      success: false,
      error: `GPS validation failed: ${gps.flags.join("; ")}. Address creation blocked for security.`,
      flags: gps.flags,
      warnings: gps.warnings,
    };
  }

  const registrationType = input.registrationType ?? "formal";

  // 3. QG Engine — national grid cell + nomenclature code
  const qg = qgEncode(input.latitude, input.longitude, input.countryCode, input.zone, input.admin ?? {}, registrationType);

  // 4. SQ Engine — adaptive subdivision by density
  const sq = sqEncode(qg.afroloc, input.latitude, input.longitude, qg.bbox, input.densityCount ?? 0);

  // 5. Local sequence scoped to the SQ sub-cell
  const seqKey = `${sq.fullCode}#${sq.sqCode}`;
  const sequence = (localSequence.get(seqKey) ?? 0) + 1;
  localSequence.set(seqKey, sequence);
  const afrolocCode = `${sq.fullCode}-${sequence.toString().padStart(4, "0")}`;

  // 6. ATS Engine — trust score + certification
  const adminLevels = [
    input.admin?.provinceCode,
    input.admin?.municipalityCode,
    input.admin?.communeCode,
    input.admin?.neighborhoodCode,
  ].filter(Boolean).length;
  const ats = computeAts({
    accuracy: input.accuracy,
    exifCoherent: !!(input.photoMetadata?.exifLat != null && gps.flags.length === 0),
    hasPhoto: !!input.hasPhoto,
    adminLevels,
    witnessesConfirmed: input.witnessesConfirmed ?? 0,
    witnessesRequired: input.witnessesRequired ?? 0,
    validatorConfirmed: !!input.validatorConfirmed,
    authorityGps: input.authorityGps,
  });

  return {
    success: true,
    afrolocCode,
    qgCodeLegacy: qg.afrolocLegacy,
    nomenclatureCode: qg.afroloc,
    sqCode: sq.sqCode,
    subdivisionType: sq.subdivisionType,
    cellType: qg.zone,
    gridM: qg.grid_m,
    sequence,
    status: "draft",
    ats,
    bbox: qg.bbox,
    centroid: qg.centroid,
    warnings: gps.warnings,
  };
}
