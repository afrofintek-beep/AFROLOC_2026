// Tipos da base de dados AFROLOC (espelham supabase/migrations/0001_init.sql).

export interface ProfileRow {
  id: string;
  name: string | null;
  phone: string | null;
  language: string;
  level: number;
  level_title: string;
  auth_confidence: number;
  jurisdiction: string | null;
  reputation_tier: "Bronze" | "Prata" | "Ouro";
  reputation_score: number;
  testimonials: number;
  frauds: number;
  created_at: string;
  updated_at: string;
}

export type AddressStatus = "RASCUNHO" | "PENDENTE" | "ACTIVO";

export interface AtsFactorJson {
  label: string;
  value: number;
  tone: "green" | "gold";
}

export interface AddressRow {
  id: string;
  owner_id: string;
  label: string;
  code: string;
  country_code: string;
  qgsq_cell: string | null;
  nomenclature_code: string | null;
  sq_code: string | null;
  subdivision_type: string | null;
  cell_type: string | null;
  grid_m: number | null;
  sequence: number | null;
  address_line: string | null;
  location_line: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  status: AddressStatus;
  ats: number;
  ats_label: string | null;
  ats_factors: AtsFactorJson[];
  validator: string | null;
  cycle_months: number;
  verified_at: string | null;
  next_verify_at: string | null;
  issued_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Campos que o cliente envia ao criar uma morada (resto tem defaults na BD). */
export type AddressInsert = Omit<
  AddressRow,
  "id" | "created_at" | "updated_at"
>;
