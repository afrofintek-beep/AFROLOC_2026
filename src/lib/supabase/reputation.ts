// Reputação REAL do utilizador como testemunha, a partir de `afroloc_witnesses`
// (backend de produção ljcx). Cada registo de testemunho carrega o score de
// reputação e o estado; agregamos para o perfil.
import { supabase } from "./client";

export interface ReputationInfo {
  score: number;
  tier: "Bronze" | "Prata" | "Ouro";
  testimonials: number;
  frauds: number;
}

export function tierForScore(score: number): ReputationInfo["tier"] {
  if (score >= 70) return "Ouro";
  if (score >= 40) return "Prata";
  return "Bronze";
}

/** Reputação do utilizador (0/Bronze se ainda não testemunhou nada). */
export async function fetchWitnessReputation(userId: string): Promise<ReputationInfo> {
  const { data, error } = await supabase
    .from("afroloc_witnesses")
    .select("witness_reputation_score,status")
    .eq("witness_user_id", userId);
  if (error || !data) return { score: 0, tier: "Bronze", testimonials: 0, frauds: 0 };
  const score = data.reduce((m, r) => Math.max(m, r.witness_reputation_score ?? 0), 0);
  const testimonials = data.filter((r) => r.status === "confirmed").length;
  const frauds = data.filter((r) => r.status === "rejected" || r.status === "fraud").length;
  return { score, tier: tierForScore(score), testimonials, frauds };
}
