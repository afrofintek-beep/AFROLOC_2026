// The signed-in citizen and their primary (active) AFROLOC address.
// Seeded from the design mock (Ana Cardoso · AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001 · ATS 86).
// Shared by the `home` and `detail` screens.

export interface AtsFactor {
  label: string;
  /** 0–100 contribution to the Address Trust Score. */
  value: number;
  tone: "green" | "gold";
}

export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
  tone: "green" | "gold";
}

export interface PrimaryAddress {
  label: string; // "Casa"
  code: string; // "AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001"
  countryChip: string; // "AO"
  addressLine: string; // "Rua da Samba, 14 · Belas"
  locationLine: string; // "Belas · Luanda · Angola"
  status: "ACTIVO" | "PENDENTE" | "RASCUNHO";
  verifiedDaysAgo: number;
  nextVerifyDays: number;
  nextVerifyDate: string; // "24 Out 2026"
  cycleMonths: number; // 6
  ats: number; // 86
  atsLabel: string; // "Elevado · baixo risco"
  validator: string; // "Validador Regional · Belas"
  qgsqCell: string; // "AO-ZU-G10-X6AUQ-Y49HV"
  issued: string; // certificate issue date, "24 Out 2026"
  factors: AtsFactor[];
}

export interface CurrentUser {
  name: string;
  initials: string;
  phone: string;
  level: number; // 1–5 authority tier
  levelTitle: string; // "Administrador Municipal"
  authConfidence: number; // 0–100
  jurisdiction: string;
  reputationTier: "Bronze" | "Prata" | "Ouro";
  reputationScore: number; // 0–100
  testimonials: number;
  frauds: number;
  language: string;
}

/** Authority tiers (Level 1 field → Level 5 national super-admin). */
export const AUTHORITY_TIERS = [
  "Operador de campo",
  "Validador comunal",
  "Administrador Municipal",
  "Administrador Provincial",
  "Super-admin nacional",
] as const;

export const currentUser: CurrentUser = {
  name: "Ana Cardoso",
  initials: "AC",
  phone: "+244 923 303 030",
  level: 3,
  levelTitle: "Administrador Municipal",
  authConfidence: 64,
  jurisdiction:
    "Jurisdição: Município de Belas. Pode criar administradores comunais (Nível 2).",
  reputationTier: "Prata",
  reputationScore: 72,
  testimonials: 12,
  frauds: 0,
  language: "Português",
};

// Canonical AFROLOC code in the current format (spec §1):
// CC-PROV-MUN-COM-BAI-G10-X-Y-NNNN. Derived for the seeded Belas point.
export const PRIMARY_CODE = "AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001";
export const PRIMARY_CELL = "AO-ZU-G10-X6AUQ-Y49HV";

export const primaryAddress: PrimaryAddress = {
  label: "Casa",
  code: PRIMARY_CODE,
  countryChip: "AO",
  addressLine: "Rua da Samba, 14 · Belas",
  locationLine: "Belas · Luanda · Angola",
  status: "ACTIVO",
  verifiedDaysAgo: 56,
  nextVerifyDays: 124,
  nextVerifyDate: "24 Out 2026",
  cycleMonths: 6,
  ats: 86,
  atsLabel: "Elevado · baixo risco",
  validator: "Validador Regional · Belas",
  qgsqCell: PRIMARY_CELL,
  issued: "24 Out 2026",
  factors: [
    { label: "GPS verificado", value: 92, tone: "green" },
    { label: "Testemunhas 2/2", value: 100, tone: "green" },
    { label: "Histórico estável", value: 64, tone: "gold" },
    { label: "Operadora confirmada", value: 88, tone: "green" },
  ],
};

export const recentActivity: ActivityItem[] = [
  { id: "a1", title: "Testemunha confirmada", meta: "Tomás Munga · há 2 dias", tone: "green" },
  { id: "a2", title: "Verificação concluída", meta: "Validador Regional · há 56 dias", tone: "gold" },
];

/** Verifiable public link encoded in the address QR code. */
export function addressUrl(code: string): string {
  return `https://afroloc.ao/a/${code}`;
}
