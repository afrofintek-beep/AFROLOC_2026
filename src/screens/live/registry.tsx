import type { ComponentType } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CATALOG } from "../../data/catalog";
import { LoginScreen } from "../auth/LoginScreen";
import { RegisterScreen } from "../auth/RegisterScreen";
import { PhoneLoginScreen } from "../auth/PhoneLoginScreen";
import { OtpScreen } from "../auth/OtpScreen";
import { WelcomeScreen } from "../auth/WelcomeScreen";
import { Page, LiveHomeScreen, LiveAddressesScreen, LiveDetailScreen, LiveMapScreen, LiveLookupScreen, LiveProfileScreen, LiveCreateScreen, ServicesScreen, PendingScreen, RecoveryScreen } from "./LiveScreens";

// Explicit operational routes. Unlisted prototypes cannot perform mutations or show seeded records.
export const LIVE: Record<string, ComponentType> = {
  welcome: WelcomeScreen, login: LoginScreen, register: RegisterScreen, presignup: RegisterScreen,
  phoneLogin: PhoneLoginScreen, otp: OtpScreen, forgotPassword: RecoveryScreen,
  services: ServicesScreen, home: LiveHomeScreen, empty: LiveHomeScreen,
  addresses: LiveAddressesScreen, detail: LiveDetailScreen, share: LiveDetailScreen,
  identitiesMap: LiveMapScreen, publicLookup: LiveLookupScreen, profile: LiveProfileScreen,
  type: LiveCreateScreen, location: LiveCreateScreen, adminDivision: LiveCreateScreen,
  qgsq: LiveCreateScreen, building: LiveCreateScreen, informal: LiveCreateScreen,
};
export const SOURCE_ROUTES: Record<string, string> = {
  certificate: "/my-addresses", changePhone: "/profile/change-phone", trustedDevices: "/trusted-devices",
  validatorInbox: "/validate-address", validatorReview: "/validate-address", authorityGps: "/authority/gps-validation",
  validationsDashboard: "/validations-dashboard", aflRequests: "/afroloc-requests", adminDash: "/dashboard",
  adminLogin: "/admin/login", admin2fa: "/admin/2fa", countryConfig: "/admin/country-config",
  users: "/admin/user-management", roleApprovals: "/admin/role-approvals", security: "/admin/security",
  securityAudit: "/admin/security-audit", reports: "/admin/reports", regionalMgmt: "/admin/regional-management",
  fraudFlags: "/admin/fraud-flags", telecomOperators: "/admin/telecom-operators", cellTowers: "/admin/cell-towers",
  importDivisions: "/admin/import-divisions", importUrbanZones: "/admin/import-urban-zones", gridMgmt: "/grid-management",
  certificationKpis: "/certification-kpis", kpisExport: "/kpis-export", tempAddress: "/temp-address-manager",
  documentsHub: "/documents", adminDocLibrary: "/admin/document-library", contractDownloads: "/admin/contract-downloads",
  apiDocs: "/api-docs", yamiooApi: "/yamioo-api", adminYamiooAgents: "/admin/yamioo-agents",
};
export function LinkedServiceScreen() {
  const { screenId = "" } = useParams();
  const name = CATALOG.flatMap(g => g.screens).find(s => s.id === screenId)?.label || "Serviço AFROLOC";
  if (screenId === "witnesses" || screenId === "confirmWitness") return <Page title={name}><div className="live-card"><p>Para a Feira de Natal, utilize o percurso com três testemunhas e revisão oficial.</p><a className="live-button primary" href="/feira/">Validação da feira</a><p>Para outros endereços, abra a morada na plataforma de origem.</p><a className="live-button" href="https://afroloc.ao/my-addresses">As minhas moradas em afroloc.ao</a></div></Page>;
  const path = SOURCE_ROUTES[screenId];
  if (!path) return <PendingScreen />;
  return <Page title={name}><div className="live-card"><span className="live-tag">Abre em afroloc.ao</span><p>Este percurso utiliza a plataforma de origem. Poderá ter de iniciar sessão; as permissões são verificadas pelo serviço.</p><a className="live-button primary" href={"https://afroloc.ao" + path}>Abrir {name.toLowerCase()}</a></div></Page>;
}
export function ServiceStatusScreen() {
  const navigate = useNavigate();
  return <Page title="Estado das funcionalidades"><p>“Ligado” identifica percursos com chamadas ao registo. O teste com utilizadores reais e a publicação são etapas distintas.</p>{CATALOG.map(g => <section key={g.title} className="live-card"><h2>{g.title}</h2>{g.screens.map(s => <button key={s.id} className="live-button" onClick={() => navigate("/" + s.id)}>{s.label}<br /><small>{LIVE[s.id] ? "Ligado" : SOURCE_ROUTES[s.id] ? "Abre na plataforma de origem" : ["witnesses", "confirmWitness"].includes(s.id) ? "Percurso da feira disponível" : "Integração pendente"}</small></button>)}</section>)}</Page>;
}
