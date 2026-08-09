// ────────────────────────────────────────────────────────────
// Consulta pública de um AFROLOC por código.
//
// `afroloc_records` está protegida por RLS (dono-apenas), por isso o anon não a
// pode ler diretamente. A consulta pública passa por uma função SECURITY DEFINER
// no backend — `afroloc_public_lookup(p_code)` — que devolve APENAS campos NÃO
// pessoais (localização administrativa, estado, ATS, certificação, última
// verificação) e só para moradas em estado divulgável (approved/verified/
// certified). Nunca titular, nunca coordenadas, nunca rua/número.
//
// SQL da função em: docs/sql/afroloc_public_lookup.sql (aplicar no Supabase ljcx).
// ────────────────────────────────────────────────────────────
import { supabase } from "./client";

export interface PublicAfroloc {
  code: string;
  provincia: string | null;
  municipio: string | null;
  status: string;
  ats_score: number | null;
  certification_level: number | null;
  last_verified_at: string | null;
}

const CERT: Record<number, string> = { 1: "Bronze", 2: "Prata", 3: "Ouro", 4: "Platina" };

/** Rótulo da certificação (só quando há nível). */
export function certLabel(level: number | null): string | null {
  return level ? CERT[level] ?? null : null;
}

/** Faixa de confiança a partir do ATS. */
export function atsBand(score: number | null): string {
  const s = score ?? 0;
  return s >= 70 ? "Elevado" : s >= 40 ? "Médio" : "Baixo";
}

/** "há X dias" a partir de uma data ISO. */
export function sinceLabel(iso: string | null): string {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "hoje";
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}

/** Localização "Município · Província" (campos não pessoais). */
export function placeLine(r: PublicAfroloc): string {
  return [r.municipio, r.provincia].filter(Boolean).join(" · ") || "—";
}

/**
 * Consulta pública por código. Devolve o registo público, ou `null` quando não
 * existe / não é divulgável / a função ainda não está aplicada no backend.
 */
export async function lookupPublicAfroloc(code: string): Promise<PublicAfroloc | null> {
  const { data, error } = await supabase.rpc("afroloc_public_lookup", { p_code: code.trim() });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as PublicAfroloc) ?? null;
}
