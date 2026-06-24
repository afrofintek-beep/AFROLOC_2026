// Tenancy / occupancy link — records the landlord↔tenant relationship for an
// address. Applies to NATIONALS as well as foreigners, feeding (a) address
// registration & updates and (b) tax-obligation registration.
//
// Tax figures here are STRUCTURAL and ILLUSTRATIVE only — the rates live in a
// per-jurisdiction config (see countryConfig) and DO NOT constitute tax advice.

export type Occupancy = "proprietario" | "inquilino" | "cedencia";

export interface Party {
  name: string;
  /** Their AFROLOC code, when they have one. */
  afroloc?: string;
  /** Fiscal ID (NIF) — required to register tax obligations. */
  nif: string;
  confirmed?: boolean;
}

export interface Tenancy {
  occupancy: Occupancy;
  landlord?: Party;
  /** Tenant fiscal ID (the citizen registering). */
  tenantNif: string;
  contractNumber: string;
  start: string; // "Fev 2026"
  end: string; // "Fev 2027"
  monthlyRent: number;
  currency: string; // "Kz"
  hasContractPdf: boolean;
}

export const OCCUPANCY_LABEL: Record<Occupancy, string> = {
  proprietario: "Proprietário",
  inquilino: "Inquilino",
  cedencia: "Cedência",
};

/** Whether this occupancy involves a landlord relationship to register. */
export function hasLandlord(o: Occupancy): boolean {
  return o === "inquilino" || o === "cedencia";
}

// Illustrative, configurable-per-jurisdiction tax model (Angola defaults shown).
export interface TaxConfig {
  /** Imposto Predial sobre rendas — responsibility of the landlord. */
  predialRate: number;
  /** Withholding on rent the tenant remits when acting as a withholding agent. */
  retentionRate: number;
  /** Stamp duty on the lease contract value. */
  stampRate: number;
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  predialRate: 0.25, // illustrative
  retentionRate: 0.15, // illustrative
  stampRate: 0.004, // illustrative
};

// Rent-tax rules vary by country, so the feature is enabled per jurisdiction.
// For now ONLY Angola (AO) is supported; other countries register the tenancy
// link but no tax obligations are computed until their config is added.
export const TAX_CONFIG_BY_COUNTRY: Record<string, TaxConfig> = {
  AO: DEFAULT_TAX_CONFIG,
};

export function isRentTaxSupported(countryIso: string): boolean {
  return countryIso in TAX_CONFIG_BY_COUNTRY;
}

export function taxConfigFor(countryIso: string): TaxConfig | null {
  return TAX_CONFIG_BY_COUNTRY[countryIso] ?? null;
}

export interface Obligation {
  key: string;
  title: string;
  party: "Senhorio" | "Arrendatário";
  /** Annual taxable base used for the illustrative amount. */
  base: number;
  rate: number;
  amount: number;
  note: string;
}

export function formatKz(v: number): string {
  return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(Math.round(v)) + " Kz";
}

/**
 * Derive the tax obligations arising from a tenancy in a given jurisdiction.
 * Returns an empty list for owner-occupied addresses, and for countries whose
 * rent-tax rules are not yet enabled (currently only Angola — see
 * TAX_CONFIG_BY_COUNTRY).
 */
export function taxObligations(t: Tenancy, cfg: TaxConfig | null): Obligation[] {
  if (!cfg || !hasLandlord(t.occupancy)) return [];
  const annual = t.monthlyRent * 12;
  return [
    {
      key: "predial",
      title: "Imposto Predial sobre rendas",
      party: "Senhorio",
      base: annual,
      rate: cfg.predialRate,
      amount: annual * cfg.predialRate,
      note: "Declarado pelo senhorio sobre o rendimento de renda anual.",
    },
    {
      key: "retencao",
      title: "Retenção na fonte sobre a renda",
      party: "Arrendatário",
      base: annual,
      rate: cfg.retentionRate,
      amount: annual * cfg.retentionRate,
      note: "Quando o arrendatário é entidade obrigada a reter e entregar ao Estado.",
    },
    {
      key: "selo",
      title: "Imposto de Selo do contrato",
      party: "Arrendatário",
      base: annual,
      rate: cfg.stampRate,
      amount: annual * cfg.stampRate,
      note: "Sobre o valor do contrato de arrendamento.",
    },
  ];
}
