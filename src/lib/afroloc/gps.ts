// GPS / EXIF anti-spoofing validation — spec §3 / §3.1.
import { AFRICAN_COUNTRIES } from "./sdk";
import { haversineDistance } from "./geo";

export const GPS_MAX_ACCURACY_METERS = 100; // reject if accuracy > 100 m
export const EXIF_GPS_MAX_DIVERGENCE_M = 500; // EXIF vs reported GPS max distance
export const EXIF_MAX_AGE_MINUTES = 30; // EXIF timestamp must be within 30 min

export interface PhotoMetadata {
  exifLat?: number | null;
  exifLon?: number | null;
  exifTimestamp?: string | null;
  deviceMake?: string;
  deviceModel?: string;
}

export interface AddressCreateRequest {
  latitude: number;
  longitude: number;
  countryCode: string;
  accuracy?: number;
  photoMetadata?: PhotoMetadata;
}

export interface GpsValidationResult {
  valid: boolean;
  warnings: string[];
  flags: string[];
}

/** Structural request validation (spec §3.1 validateRequest). */
export function validateRequest(body: Partial<AddressCreateRequest>): { valid: boolean; error?: string } {
  if (body.latitude == null || typeof body.latitude !== "number")
    return { valid: false, error: "latitude is required and must be a number" };
  if (body.longitude == null || typeof body.longitude !== "number")
    return { valid: false, error: "longitude is required and must be a number" };
  if (!body.countryCode || typeof body.countryCode !== "string")
    return { valid: false, error: "countryCode is required and must be a string" };
  if (!AFRICAN_COUNTRIES.has(body.countryCode.toUpperCase()))
    return { valid: false, error: "countryCode must be a valid African country code" };
  if (body.latitude < -90 || body.latitude > 90)
    return { valid: false, error: "latitude must be between -90 and 90" };
  if (body.longitude < -180 || body.longitude > 180)
    return { valid: false, error: "longitude must be between -180 and 180" };
  return { valid: true };
}

/** Anti-spoofing GPS/EXIF integrity check (spec §3.1 validateGpsIntegrity). */
export function validateGpsIntegrity(body: AddressCreateRequest): GpsValidationResult {
  const warnings: string[] = [];
  const flags: string[] = [];

  // 1. GPS accuracy
  if (body.accuracy != null && body.accuracy > GPS_MAX_ACCURACY_METERS) {
    flags.push(`gps_accuracy_too_low: ${Math.round(body.accuracy)}m (max ${GPS_MAX_ACCURACY_METERS}m)`);
  }

  const md = body.photoMetadata;
  if (md?.exifLat != null && md?.exifLon != null) {
    // 2. Cross-validate EXIF GPS vs reported GPS
    const exifDistance = haversineDistance(body.latitude, body.longitude, md.exifLat, md.exifLon);
    if (exifDistance > EXIF_GPS_MAX_DIVERGENCE_M) {
      flags.push(`exif_gps_divergence: ${Math.round(exifDistance)}m (max ${EXIF_GPS_MAX_DIVERGENCE_M}m)`);
    } else if (exifDistance > 100) {
      warnings.push(`exif_gps_distance: ${Math.round(exifDistance)}m`);
    }

    // 3. EXIF timestamp freshness
    if (md.exifTimestamp) {
      const exifTime = new Date(md.exifTimestamp).getTime();
      const now = Date.now();
      const ageMinutes = (now - exifTime) / (1000 * 60);
      if (ageMinutes > EXIF_MAX_AGE_MINUTES) {
        flags.push(`exif_timestamp_stale: ${Math.round(ageMinutes)} minutes old (max ${EXIF_MAX_AGE_MINUTES})`);
      }
      if (exifTime > now + 60000) {
        flags.push("exif_timestamp_future: photo timestamp is in the future");
      }
    }
  }

  // 4. Coordinate precision — suspiciously round coords indicate spoofing
  const latDecimals = (body.latitude.toString().split(".")[1] || "").length;
  const lonDecimals = (body.longitude.toString().split(".")[1] || "").length;
  if (latDecimals < 4 || lonDecimals < 4) {
    warnings.push(`low_coordinate_precision: lat=${latDecimals} lon=${lonDecimals} decimals`);
  }

  return { valid: flags.length === 0, warnings, flags };
}

/**
 * Human-readable pt-PT message for a GPS/EXIF flag or warning code. The raw
 * codes stay as-is for the audit log / webhooks (spec §8); this is for the UI.
 */
export function describeGpsCode(code: string): string {
  const [key, rest = ""] = code.split(":");
  const nums = rest.match(/-?\d+(\.\d+)?/g) || [];
  switch (key.trim()) {
    case "gps_accuracy_too_low":
      return `Precisão de GPS insuficiente (${nums[0] ?? "?"} m · máx. ${GPS_MAX_ACCURACY_METERS} m)`;
    case "exif_gps_divergence":
      return `Foto distante do ponto GPS (${nums[0] ?? "?"} m · máx. ${EXIF_GPS_MAX_DIVERGENCE_M} m)`;
    case "exif_gps_distance":
      return `Foto a ${nums[0] ?? "?"} m do ponto GPS`;
    case "exif_timestamp_stale":
      return `Foto demasiado antiga (${nums[0] ?? "?"} min · máx. ${EXIF_MAX_AGE_MINUTES} min)`;
    case "exif_timestamp_future":
      return "Data da foto está no futuro";
    case "low_coordinate_precision":
      return `Precisão de coordenadas baixa (lat ${nums[0] ?? "?"} · lon ${nums[1] ?? "?"} casas)`;
    default:
      return code;
  }
}

