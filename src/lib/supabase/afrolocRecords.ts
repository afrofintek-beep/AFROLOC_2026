// ────────────────────────────────────────────────────────────
// Ponte com o backend REAL do AFROLOC (ljcx): tabela `afroloc_records`.
//
// O demo foi desenhado à volta do seu próprio modelo `AddressRow` (code/status/
// ATS/qgsq/validator). O AFROLOC de produção guarda as moradas noutro formato
// (`afroloc_records`: níveis administrativos + code + ats_score + certification).
// Este adaptador lê os registos reais do utilizador autenticado e converte-os
// em `AddressRow`, para que os ecrãs do demo mostrem dados reais SEM mudar de
// aspeto. Fonte única da conversão record → UI.
// ────────────────────────────────────────────────────────────
import { supabase } from "./client";
import type { AddressRow, AddressStatus, AtsFactorJson } from "./types";

/** Subconjunto usado das colunas de `public.afroloc_records` (BD de produção). */
export interface AfrolocRecord {
  id: string;
  user_id: string;
  code: string;
  country: string | null;
  level1_name: string | null;
  level2_name: string | null;
  level3_name: string | null;
  level4_name: string | null;
  street_name: string | null;
  number: string | null;
  unit: string | null;
  property_name: string | null;
  geo_lat: number | null;
  geo_lon: number | null;
  ats_score: number | null;
  ats_breakdown: unknown;
  certification_level: number | null;
  status: string | null;
  is_primary_residence: boolean | null;
  last_verified_at: string | null;
  next_verification_due: string | null;
  gps_validated_at: string | null;
  street_code: string | null;
  approved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const CERT_BY_LEVEL: Record<number, string> = { 1: "Bronze", 2: "Prata", 3: "Ouro", 4: "Platina" };

/** Estado do AFROLOC real → estado do modelo do demo. */
function mapStatus(status: string | null): AddressStatus {
  switch (status) {
    case "certified":
    case "verified":
    case "approved":
      return "ACTIVO";
    case "draft":
    case "rejected":
      return "RASCUNHO";
    default:
      return "PENDENTE"; // pending / temporary / desconhecido
  }
}

/** ats_breakdown (JSON livre) → fatores do demo (defensivo; [] se não aplicável). */
function mapFactors(breakdown: unknown): AtsFactorJson[] {
  if (!Array.isArray(breakdown)) return [];
  return breakdown
    .map((f): AtsFactorJson | null => {
      if (!f || typeof f !== "object") return null;
      const o = f as Record<string, unknown>;
      const label = typeof o.label === "string" ? o.label : typeof o.name === "string" ? o.name : null;
      const value = typeof o.value === "number" ? o.value : typeof o.score === "number" ? o.score : null;
      if (label == null || value == null) return null;
      return { label, value, tone: value >= 70 ? "green" : "gold" };
    })
    .filter((x): x is AtsFactorJson => x !== null);
}

/** Registo real `afroloc_records` → `AddressRow` (modelo dos ecrãs do demo). */
export function recordToAddressRow(r: AfrolocRecord): AddressRow {
  const locationLine =
    [r.level2_name, r.level1_name].filter(Boolean).join(" · ") || r.country || "—";
  const addressLine =
    [r.street_name, r.number].filter(Boolean).join(" ") ||
    [r.level4_name, r.level3_name].filter(Boolean).join(", ") ||
    r.property_name ||
    locationLine;
  // Só rotula a certificação quando há pontuação real (evita "Platina" com ATS 0).
  const atsLabel =
    (r.ats_score ?? 0) > 0 && r.certification_level
      ? CERT_BY_LEVEL[r.certification_level] ?? null
      : null;

  return {
    id: r.id,
    owner_id: r.user_id,
    label: r.property_name || r.level4_name || "Casa",
    code: r.code,
    country_code: r.country ?? "—",
    qgsq_cell: r.street_code ?? null,
    nomenclature_code: null,
    sq_code: null,
    subdivision_type: null,
    cell_type: null,
    grid_m: null,
    sequence: null,
    address_line: addressLine,
    location_line: locationLine,
    latitude: r.geo_lat,
    longitude: r.geo_lon,
    accuracy: null,
    status: mapStatus(r.status),
    ats: r.ats_score ?? 0,
    ats_label: atsLabel,
    ats_factors: mapFactors(r.ats_breakdown),
    validator: null,
    cycle_months: 6,
    verified_at: r.last_verified_at ?? r.gps_validated_at ?? null,
    next_verify_at: r.next_verification_due ?? null,
    issued_at: r.approved_at ?? r.created_at ?? null,
    created_at: r.created_at ?? new Date(0).toISOString(),
    updated_at: r.updated_at ?? r.created_at ?? new Date(0).toISOString(),
  };
}

const SELECT_COLS =
  "id,user_id,code,country,level1_name,level2_name,level3_name,level4_name,street_name,number,unit,property_name,geo_lat,geo_lon,ats_score,ats_breakdown,certification_level,status,is_primary_residence,last_verified_at,next_verification_due,gps_validated_at,street_code,approved_at,created_at,updated_at";

/**
 * Moradas reais do utilizador autenticado (residência primária primeiro, depois
 * mais recentes). Só estados utilizáveis — coerente com o ecrã /my-afroloc real.
 */
export async function listMyAfrolocRecords(): Promise<AfrolocRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("afroloc_records")
    .select(SELECT_COLS)
    .eq("user_id", user.id)
    .in("status", ["approved", "pending", "verified", "certified"])
    .order("is_primary_residence", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AfrolocRecord[];
}
