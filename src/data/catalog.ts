// Screen catalog — groups the 95 screens for the side index, mirroring the
// design handoff README structure. Order within groups follows the spec.
export interface CatalogGroup {
  title: string;
  screens: { id: string; label: string }[];
}

export const CATALOG: CatalogGroup[] = [
  {
    title: "Identidade & acesso",
    screens: [
      { id: "welcome", label: "Boas-vindas" },
      { id: "otp", label: "Verificação OTP" },
      { id: "login", label: "Entrar" },
      { id: "presignup", label: "Registo" },
      { id: "forgotPassword", label: "Recuperar palavra-passe" },
      { id: "howitworks", label: "Como funciona" },
      { id: "empty", label: "Estado inicial" },
    ],
  },
  {
    title: "Criar morada",
    screens: [
      { id: "type", label: "Tipo de morada" },
      { id: "location", label: "Localização / GPS" },
      { id: "adminDivision", label: "País / divisão" },
      { id: "qgsq", label: "Célula QGSQ" },
      { id: "building", label: "Edifício" },
      { id: "buildingDir", label: "Diretório do edifício" },
      { id: "informal", label: "Morada informal" },
      { id: "witnesses", label: "Testemunhas" },
      { id: "confirmWitness", label: "Confirmar testemunha" },
      { id: "tenancy", label: "Vínculo de ocupação" },
    ],
  },
  {
    title: "Estrangeiros & arrendamento",
    screens: [
      { id: "foreigner", label: "Residente estrangeiro" },
      { id: "lease", label: "Contrato de arrendamento" },
      { id: "authorityDeclaration", label: "Declaração SME" },
    ],
  },
  {
    title: "Agregado & censo",
    screens: [
      { id: "household", label: "Agregado" },
      { id: "householdCensus", label: "Censo do agregado" },
      { id: "addMember", label: "Adicionar membro" },
      { id: "deceased", label: "Registar óbito" },
    ],
  },
  {
    title: "A minha AFROLOC",
    screens: [
      { id: "home", label: "Início" },
      { id: "detail", label: "Detalhe da morada" },
      { id: "certificate", label: "Certificado" },
      { id: "addresses", label: "As minhas moradas" },
      { id: "identitiesMap", label: "Mapa de moradas" },
      { id: "wayfinding", label: "Guia (sem ruas)" },
      { id: "share", label: "Partilhar" },
      { id: "profile", label: "Perfil" },
      { id: "publicLookup", label: "Consulta pública" },
      { id: "language", label: "Idioma" },
    ],
  },
  {
    title: "Verificação & risco",
    screens: [
      { id: "reverify", label: "Reverificação" },
      { id: "riskAlerts", label: "Alertas de risco" },
      { id: "gpsHistory", label: "Histórico GPS" },
      { id: "witnessRep", label: "Reputação de testemunha" },
      { id: "appeal", label: "Recurso" },
      { id: "notifications", label: "Notificações" },
    ],
  },
  {
    title: "Campo (offline)",
    screens: [
      { id: "offline", label: "Captura offline" },
      { id: "operator", label: "Operador de campo" },
    ],
  },
  {
    title: "Validador",
    screens: [
      { id: "validatorInbox", label: "Caixa do validador" },
      { id: "validatorReview", label: "Rever submissão" },
      { id: "aflRequests", label: "Pedidos AFROLOC" },
      { id: "validationsDashboard", label: "Painel de validações" },
      { id: "authorityGps", label: "GPS de autoridade" },
      { id: "witnessProximity", label: "Proximidade (1 km)" },
    ],
  },
  {
    title: "Administração",
    screens: [
      { id: "adminLogin", label: "Login da consola" },
      { id: "adminSetup", label: "Setup super-admin" },
      { id: "admin2fa", label: "2FA" },
      { id: "adminDash", label: "Painel admin" },
      { id: "users", label: "Utilizadores" },
      { id: "roleApprovals", label: "Aprovação de papéis" },
      { id: "reports", label: "Relatórios" },
      { id: "security", label: "Segurança" },
      { id: "securityAudit", label: "Auditoria" },
      { id: "fraudFlags", label: "Sinais de fraude" },
      { id: "regionalMgmt", label: "Gestão regional" },
      { id: "setup", label: "Configuração do sistema" },
      { id: "countryConfig", label: "Config. por país" },
      { id: "translationValidation", label: "Validação de traduções" },
    ],
  },
  {
    title: "Telecom & grelha",
    screens: [
      { id: "telecomOperators", label: "Operadores telecom" },
      { id: "cellTowers", label: "Torres & triangulação" },
      { id: "importUrbanZones", label: "Importar zonas urbanas" },
      { id: "gridMgmt", label: "Gestão da grelha QGSQ" },
      { id: "importDivisions", label: "Importar divisões" },
      { id: "continentalCoverage", label: "Cobertura continental" },
    ],
  },
  {
    title: "Métricas & testes",
    screens: [
      { id: "certificationKpis", label: "KPIs de certificação" },
      { id: "kpisExport", label: "Exportar KPIs" },
      { id: "testEnvironment", label: "Ambiente de testes" },
      { id: "addressTest", label: "Resolver código" },
      { id: "tempAddress", label: "Moradas temporárias" },
    ],
  },
  {
    title: "API & parceiros",
    screens: [
      { id: "apiDocs", label: "Documentação API" },
      { id: "yamiooApi", label: "Integração Yamioo" },
      { id: "adminYamiooAgents", label: "Agentes de entrega" },
    ],
  },
  {
    title: "Instalar & descarregar",
    screens: [
      { id: "install", label: "Instalar PWA" },
      { id: "appDownload", label: "Descarregar app" },
      { id: "sourceDownload", label: "Código-fonte" },
      { id: "manualDownload", label: "Manuais" },
    ],
  },
  {
    title: "Site público (web)",
    screens: [
      { id: "landing", label: "Página inicial" },
      { id: "pricing", label: "Preços" },
      { id: "about", label: "Sobre" },
      { id: "faq", label: "FAQ" },
      { id: "contact", label: "Contacto" },
    ],
  },
  {
    title: "Documentação & PI (web)",
    screens: [
      { id: "documentsHub", label: "Hub de documentos" },
      { id: "adminDocLibrary", label: "Biblioteca" },
      { id: "contractDownloads", label: "Contratos" },
      { id: "ipDocumentation", label: "Propriedade intelectual" },
      { id: "ipDrawings", label: "Figuras de patente" },
      { id: "patentClaims", label: "Reivindicações" },
      { id: "gridSystemPdf", label: "Especificação (PDF)" },
      { id: "brandGuidelines", label: "Manual de marca" },
    ],
  },
];
