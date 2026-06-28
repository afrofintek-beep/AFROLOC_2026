// AFROLOC — Score de Risco & Verificação Periódica.
// Implementação fiel do documento técnico AFROFINTEK
// "AFROLOC_Score_Risco_Verificacao_Periodica": Score de Risco 0–100 a partir de
// 6 fatores (peso total 100) → nível de risco → frequência de visitas/ciclo.

export type RiskLevel = "very_low" | "low" | "medium" | "high" | "very_high";
export type CycleState = "verified" | "upcoming" | "urgent" | "overdue";
export type PropertyType =
  | "residencia" | "comercial" | "terreno" | "construcao" | "temporario" | "informal";

export interface AddressRiskInput {
  /** Completude */
  hasStreetName: boolean;
  hasNumber: boolean;
  hasStreetCode: boolean;
  isDigitalOnly: boolean; // sem rua/número (digital ou informal)
  /** Propriedade */
  propertyType: PropertyType;
  /** Localização */
  hasGps: boolean;
  gpsAuthorityValidated: boolean;
  exifDiscrepant: boolean; // GPS e EXIF divergem > ~100 m
  /** Testemunhas */
  witnessCount: number;
  confirmedWitnessCount: number;
  /** ATS 0–100 */
  atsScore: number;
  /** Histórico */
  lastVerifiedAt: string | null;
}

export interface RiskFactor { key: string; label: string; weight: number; value: number; }

export interface RiskResult {
  score: number;            // 0–100
  level: RiskLevel;
  color: string;            // cor do badge
  verificationsPerYear: number;
  cycleMonths: number;
  factors: RiskFactor[];
  mitigations: string[];    // translation keys (UI multilingue)
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// ── 6 Fatores (documento §3) ──────────────────────────────────────────────
function f1Completude(i: AddressRiskInput): number {
  if (!i.isDigitalOnly && i.hasStreetCode) return 0; // Formal + streetCode
  if (i.hasStreetName && i.hasNumber) return 5;       // Formal
  if (i.hasStreetName) return 10;                     // só rua
  return 20;                                          // só digital
}
function f2Propriedade(i: AddressRiskInput): number {
  return { residencia: 4, comercial: 6, terreno: 9, construcao: 11, temporario: 14, informal: 15 }[i.propertyType];
}
function f3Gps(i: AddressRiskInput): number {
  let v: number;
  if (!i.hasGps) v = 15;
  else if (i.gpsAuthorityValidated && !i.exifDiscrepant) v = 0;
  else v = 10; // GPS presente mas sem validação oficial
  if (i.exifDiscrepant) v = Math.min(15, v + 5); // penalização EXIF
  return v;
}
function f4Testemunhas(i: AddressRiskInput): number {
  if (i.confirmedWitnessCount >= 2) return 0;
  if (i.confirmedWitnessCount === 1) return 5;
  if (i.witnessCount > 0) return 10; // registadas mas por confirmar
  return 15;
}
function f5Ats(i: AddressRiskInput): number {
  const a = i.atsScore;
  if (a >= 80) return 0;
  if (a >= 60) return 5;
  if (a >= 40) return 10;
  if (a >= 20) return 15;
  return 20;
}
function f6Historico(i: AddressRiskInput): number {
  if (!i.lastVerifiedAt) return 15; // nunca verificado
  const d = daysSince(i.lastVerifiedAt);
  if (d <= 90) return 0;
  if (d <= 180) return 5;
  if (d <= 365) return 10;
  return 15;
}

// ── Classificação (documento §4) ──────────────────────────────────────────
function classify(score: number): Pick<RiskResult, "level" | "color" | "verificationsPerYear" | "cycleMonths"> {
  if (score < 15) return { level: "very_low", color: "#2F7A57", verificationsPerYear: 1, cycleMonths: 12 };
  if (score < 35) return { level: "low", color: "#2F7A57", verificationsPerYear: 2, cycleMonths: 6 };
  if (score < 55) return { level: "medium", color: "#2D6CC0", verificationsPerYear: 3, cycleMonths: 4 };
  if (score < 75) return { level: "high", color: "#D99A3A", verificationsPerYear: 4, cycleMonths: 3 };
  return { level: "very_high", color: "#D14B3A", verificationsPerYear: 6, cycleMonths: 2 };
}

// ── Sugestões de mitigação (documento §7) — translation keys ──────────────
function mitigationsFor(i: AddressRiskInput): string[] {
  const m: string[] = [];
  if (i.hasStreetName && !i.hasNumber) m.push("mitigation_add_house_number");
  if (i.isDigitalOnly) m.push("mitigation_digital_frequent_verification");
  if (["terreno", "construcao", "temporario"].includes(i.propertyType)) m.push("mitigation_property_monitoring");
  if (i.hasGps && !i.gpsAuthorityValidated) m.push("mitigation_gps_authority_validation");
  if (!i.hasGps) m.push("mitigation_gps_required");
  if (i.exifDiscrepant) m.push("mitigation_gps_exif_discrepancy");
  if (i.witnessCount === 0) m.push("mitigation_add_witnesses");
  else if (i.confirmedWitnessCount === 1) m.push("mitigation_add_more_witnesses");
  else if (i.confirmedWitnessCount === 0) m.push("mitigation_witnesses_pending");
  if (i.atsScore < 20) m.push("mitigation_complete_ats");
  else if (i.atsScore < 40) m.push("mitigation_low_ats");
  else if (i.atsScore < 60) m.push("mitigation_improve_ats");
  if (!i.lastVerifiedAt) m.push("mitigation_never_verified");
  else if (daysSince(i.lastVerifiedAt) > 365) m.push("mitigation_over_1_year");
  else if (daysSince(i.lastVerifiedAt) > 180) m.push("mitigation_over_6_months");
  return m;
}

/** Calcula o Score de Risco completo de um endereço (documento §3–§4, §7). */
export function computeRisk(input: AddressRiskInput): RiskResult {
  const factors: RiskFactor[] = [
    { key: "completude", label: "Completude do endereço", weight: 20, value: f1Completude(input) },
    { key: "propriedade", label: "Estabilidade da propriedade", weight: 15, value: f2Propriedade(input) },
    { key: "gps", label: "Validação GPS", weight: 15, value: f3Gps(input) },
    { key: "testemunhas", label: "Qualidade das testemunhas", weight: 15, value: f4Testemunhas(input) },
    { key: "ats", label: "Score ATS", weight: 20, value: f5Ats(input) },
    { key: "historico", label: "Histórico de verificação", weight: 15, value: f6Historico(input) },
  ];
  const score = Math.min(100, factors.reduce((s, f) => s + f.value, 0));
  return { score, ...classify(score), factors, mitigations: mitigationsFor(input) };
}

/** Estado operacional do ciclo a partir do progresso 0–100 (documento §6). */
export function cycleStateFor(progressPct: number): CycleState {
  if (progressPct >= 100) return "overdue";
  if (progressPct >= 85) return "urgent";
  if (progressPct >= 60) return "upcoming";
  return "verified";
}

export interface CyclePosition {
  progressPct: number;
  state: CycleState;
  daysRemaining: number;
}

/** Posição no ciclo a partir da próxima verificação e da duração (documento §5–§6). */
export function cyclePosition(cycleMonths: number, nextVerifyAtIso: string | null): CyclePosition | null {
  if (!nextVerifyAtIso || !cycleMonths) return null;
  const end = new Date(nextVerifyAtIso);
  const start = new Date(nextVerifyAtIso);
  start.setMonth(start.getMonth() - cycleMonths);
  const total = end.getTime() - start.getTime();
  const now = Date.now();
  const progressPct = total > 0 ? Math.max(0, Math.min(200, ((now - start.getTime()) / total) * 100)) : 0;
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now) / 86_400_000));
  return { progressPct, state: cycleStateFor(progressPct), daysRemaining };
}

/** Rótulo, cor e ação por estado do ciclo (documento §6). */
export const CYCLE_STATE_META: Record<CycleState, { label: string; color: string; bg: string; action: string }> = {
  verified: { label: "Em dia", color: "#2F7A57", bg: "#EBF1ED", action: "Dentro do prazo" },
  upcoming: { label: "Aproxima-se", color: "#B0831F", bg: "#F4EAD6", action: "Agendar visita preventiva" },
  urgent: { label: "Urgente", color: "#C2410C", bg: "#FBE8DD", action: "Visita prioritária esta semana" },
  overdue: { label: "Em atraso", color: "#D14B3A", bg: "#FBEAE7", action: "Reverificar para manter o certificado" },
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  very_low: "Muito Baixo",
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
  very_high: "Muito Alto",
};
