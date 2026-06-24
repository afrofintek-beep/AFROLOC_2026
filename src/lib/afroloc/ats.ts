// ATS Engine — Address Trust Score (0–100) and certification level (spec §7).
// Recomputed on every relevant event (witness confirmed, authority GPS, etc.).

export type CertificationLevel = "none" | "bronze" | "silver" | "gold" | "platinum";

export interface AtsInput {
  /** GPS accuracy in metres (lower is better). */
  accuracy: number;
  /** EXIF present and within the divergence threshold. */
  exifCoherent: boolean;
  hasPhoto: boolean;
  /** Admin hierarchy levels filled (0–4: province/município/comuna/bairro). */
  adminLevels: number;
  witnessesConfirmed: number;
  witnessesRequired: number;
  /** Confirmed by an authorised validator. */
  validatorConfirmed: boolean;
  /** On-site high-precision authority GPS capture (max-trust signal). */
  authorityGps?: boolean;
  /**
   * PoDP score (0–100) — Proof of Daily Presence. A silent complementary input
   * that reinforces the ATS by up to +5 without changing the public 6-factor
   * formula (spec §9). Holder-invisible; sourced from metadata.podp.
   */
  podpScore?: number;
}

export interface AtsFactorScore {
  key: string;
  label: string;
  weight: number;
  value: number; // 0..weight contribution
}

export interface AtsResult {
  total: number; // 0..100 (includes the PoDP reinforcement)
  /** Base score from the 6 public factors, before the PoDP reinforcement. */
  baseTotal: number;
  /** PoDP reinforcement actually applied (0..5). */
  podpBonus: number;
  certificationLevel: CertificationLevel;
  factors: AtsFactorScore[];
}

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

export function certificationFor(total: number): CertificationLevel {
  if (total >= 90) return "platinum";
  if (total >= 75) return "gold";
  if (total >= 55) return "silver";
  if (total >= 35) return "bronze";
  return "none";
}

export const CERT_LABEL: Record<CertificationLevel, string> = {
  none: "Sem certificação",
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
};

/** Compute the ATS score from the trust signals (spec §7). */
export function computeAts(i: AtsInput): AtsResult {
  // GPS precision: full at ≤10 m, zero at ≥100 m.
  const gpsScore = clamp((100 - i.accuracy) / 90) * 25;
  const exifScore = (i.exifCoherent ? 1 : 0) * 15;
  const photoScore = (i.hasPhoto ? 1 : 0) * 10;
  const adminScore = clamp(i.adminLevels / 4) * 20;
  const witnessScore = clamp(i.witnessesRequired ? i.witnessesConfirmed / i.witnessesRequired : 0) * 20;
  // Validator/authority confirmation: authority on-site GPS counts as full.
  const validatorScore = (i.authorityGps ? 1 : i.validatorConfirmed ? 1 : 0) * 10;

  const factors: AtsFactorScore[] = [
    { key: "gps", label: "Precisão GPS", weight: 25, value: gpsScore },
    { key: "exif", label: "EXIF coerente", weight: 15, value: exifScore },
    { key: "photo", label: "Fotografia da propriedade", weight: 10, value: photoScore },
    { key: "admin", label: "Hierarquia administrativa", weight: 20, value: adminScore },
    { key: "witness", label: "Testemunhas", weight: 20, value: witnessScore },
    { key: "validator", label: "Validador autorizado", weight: 10, value: validatorScore },
  ];

  const baseTotal = Math.round(factors.reduce((s, f) => s + f.value, 0));
  // PoDP reinforcement: up to +5 from the presence score, never above the 100 cap.
  const podpBonus = i.podpScore != null ? Math.round(5 * (Math.max(0, Math.min(100, i.podpScore)) / 100)) : 0;
  const total = Math.min(100, baseTotal + podpBonus);
  return { total, baseTotal, podpBonus, certificationLevel: certificationFor(total), factors };
}
