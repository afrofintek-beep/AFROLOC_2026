// ────────────────────────────────────────────────────────────
// Conjunto de ecrãs da APP DE USO INDIVIDUAL (cidadão).
//
// O demo (design handoff) contém os 95 ecrãs de todos os papéis. A app pública
// é uma *seleção* desses mesmos ecrãs — sem redesenho — restrita ao percurso
// individual: gerir e consultar as minhas AFROLOC e tudo o que lhes está
// associado. Os ecrãs institucionais (validador, admin, campo, telecom/grelha,
// métricas, API, docs/PI) continuam intactos, acessíveis só em `/gallery` como
// referência de design.
//
// Fonte única de verdade: App.tsx (gating de rotas) e ServicesScreen (hub "Mais")
// leem daqui.
// ────────────────────────────────────────────────────────────

/** Ecrãs acessíveis sem sessão iniciada (entrada + páginas públicas/marketing). */
export const PUBLIC_SCREENS = new Set<string>([
  "welcome", "login", "register", "phoneLogin", "presignup", "otp",
  "forgotPassword", "howitworks",
  // páginas web públicas
  "landing", "pricing", "about", "faq", "contact", "install", "appDownload",
  "sourceDownload", "manualDownload", "publicLookup", "radarPreview",
]);

/** Mal autenticado, estes ecrãs de entrada reencaminham para o início. */
export const ENTRY_SCREENS = new Set<string>([
  "welcome", "login", "register", "phoneLogin", "presignup", "otp",
]);

/**
 * Ecrãs do cidadão autenticado (não-públicos). São os mesmos componentes do
 * demo — apenas o conjunto navegável foi podado para o uso individual.
 */
export const INDIVIDUAL_SCREENS = new Set<string>([
  // Início & identidade da morada
  "home", "detail", "addresses", "identitiesMap", "profile", "empty",
  // Criar / gerir uma morada
  "type", "location", "adminDivision", "qgsq", "building", "buildingDir",
  "informal", "witnesses", "confirmWitness", "tenancy",
  // Estrangeiros & arrendamento (o próprio residente)
  "foreigner", "lease", "authorityDeclaration",
  // Agregado & pessoas
  "household", "householdCensus", "addMember", "deceased", "residentDocs",
  // Documentos & partilha da morada
  "certificate", "share", "wayfinding", "beacon", "arView",
  // Verificação, risco & avisos (do titular)
  "reverify", "riskAlerts", "gpsHistory", "witnessRep", "appeal", "notifications",
  // Testemunhas reais da morada
  "myWitnesses",
  // Definições da conta
  "language", "changePhone", "trustedDevices", "docs",
  // Hub de acesso a "tudo o associado"
  "services",
]);

/** Tudo o que a app individual pode renderizar em `/:screenId`. */
export const APP_SCREENS = new Set<string>([
  ...PUBLIC_SCREENS,
  ...INDIVIDUAL_SCREENS,
]);

/** Um ecrã pertence à app individual (público ou de cidadão)? */
export function isAppScreen(screenId: string): boolean {
  return APP_SCREENS.has(screenId);
}

// ────────────────────────────────────────────────────────────
// Hub "Mais / Serviços" — agrupa os ecrãs associados já existentes, com o
// mesmo estilo do demo. Cada item é um ecrã do INDIVIDUAL_SCREENS.
// ────────────────────────────────────────────────────────────
export interface ServiceItem {
  id: string;
  label: string;
  desc: string;
}
export interface ServiceGroup {
  title: string;
  items: ServiceItem[];
}

export const SERVICES_GROUPS: ServiceGroup[] = [
  {
    title: "A minha morada",
    items: [
      { id: "certificate", label: "Certificado", desc: "Documento verificável com QR e PDF" },
      { id: "share", label: "Partilhar morada", desc: "Entregas, banca, serviços, emergência" },
      { id: "wayfinding", label: "Guia até à morada", desc: "Chegar sem rua nem número" },
      { id: "publicLookup", label: "Consulta pública", desc: "Localizar uma AFROLOC por código" },
    ],
  },
  {
    title: "Agregado & pessoas",
    items: [
      { id: "household", label: "Agregado familiar", desc: "Residentes e censo da residência" },
      { id: "addMember", label: "Adicionar residente", desc: "Co-residente por nome e parentesco" },
      { id: "tenancy", label: "Vínculo de ocupação", desc: "Senhorio ↔ arrendatário e obrigações" },
      { id: "foreigner", label: "Residente estrangeiro", desc: "Passaporte e autorização de residência" },
    ],
  },
  {
    title: "Verificação & segurança",
    items: [
      { id: "reverify", label: "Reverificar morada", desc: "Renovar o ciclo de verificação" },
      { id: "riskAlerts", label: "Alertas de risco", desc: "Vencimentos e sinais a resolver" },
      { id: "notifications", label: "Notificações", desc: "Atividade e avisos da conta" },
      { id: "witnessRep", label: "Reputação de testemunha", desc: "Confiança acumulada e tiers" },
    ],
  },
];
