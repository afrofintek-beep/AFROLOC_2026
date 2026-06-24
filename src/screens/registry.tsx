import type { ComponentType } from "react";
import { TypeScreen } from "./create/TypeScreen";
import { LocationScreen } from "./create/LocationScreen";
import { AdminDivisionScreen } from "./create/AdminDivisionScreen";
import { QgsqScreen } from "./create/QgsqScreen";
import { BuildingScreen } from "./create/BuildingScreen";
import { InformalScreen } from "./create/InformalScreen";
import { WitnessesScreen } from "./create/WitnessesScreen";
import { HomeScreen } from "./home/HomeScreen";
import { DetailScreen } from "./home/DetailScreen";
import { IdentitiesMapScreen } from "./home/IdentitiesMapScreen";
import { PublicLookupScreen } from "./home/PublicLookupScreen";
import { LanguageScreen } from "./home/LanguageScreen";
import { EmptyScreen } from "./home/EmptyScreen";
import { BuildingDirScreen } from "./create/BuildingDirScreen";
import { ChangePhoneScreen } from "./home/ChangePhoneScreen";
import { TrustedDevicesScreen } from "./home/TrustedDevicesScreen";
import { DocsSupportScreen } from "./home/DocsSupportScreen";
import { CertificateScreen } from "./home/CertificateScreen";
import { AddressesScreen } from "./home/AddressesScreen";
import { ProfileScreen } from "./home/ProfileScreen";
import { WayfindingScreen } from "./home/WayfindingScreen";
import { ShareScreen } from "./home/ShareScreen";
import { WitnessRepScreen } from "./home/WitnessRepScreen";
import { ReverifyScreen } from "./risk/ReverifyScreen";
import { RiskAlertsScreen } from "./risk/RiskAlertsScreen";
import { GpsHistoryScreen } from "./risk/GpsHistoryScreen";
import { NotificationsScreen } from "./risk/NotificationsScreen";
import { AppealScreen } from "./risk/AppealScreen";
import { WitnessProximityScreen } from "./risk/WitnessProximityScreen";
import { HouseholdScreen } from "./household/HouseholdScreen";
import { HouseholdCensusScreen } from "./household/HouseholdCensusScreen";
import { AddMemberScreen } from "./household/AddMemberScreen";
import { DeceasedScreen } from "./household/DeceasedScreen";
import { OperatorScreen } from "./field/OperatorScreen";
import { OfflineScreen } from "./field/OfflineScreen";
import { ValidatorInboxScreen } from "./validator/ValidatorInboxScreen";
import { ValidatorReviewScreen } from "./validator/ValidatorReviewScreen";
import { AflRequestsScreen } from "./validator/AflRequestsScreen";
import { ValidationsDashboardScreen } from "./validator/ValidationsDashboardScreen";
import { AuthorityGpsScreen } from "./validator/AuthorityGpsScreen";
import { ConfirmWitnessScreen } from "./validator/ConfirmWitnessScreen";
import { ForeignerScreen } from "./foreign/ForeignerScreen";
import { LeaseScreen } from "./foreign/LeaseScreen";
import { AuthorityDeclarationScreen } from "./foreign/AuthorityDeclarationScreen";
import { TenancyScreen } from "./tenancy/TenancyScreen";
import { OtpScreen } from "./auth/OtpScreen";
import { LoginScreen } from "./auth/LoginScreen";
import { PresignupScreen } from "./auth/PresignupScreen";
import { ForgotPasswordScreen } from "./auth/ForgotPasswordScreen";
import { HowItWorksScreen } from "./auth/HowItWorksScreen";
import { WelcomeScreen } from "./auth/WelcomeScreen";
import { TelecomOperatorsScreen } from "./grid/TelecomOperatorsScreen";
import { CellTowersScreen } from "./grid/CellTowersScreen";
import { ImportUrbanZonesScreen } from "./grid/ImportUrbanZonesScreen";
import { GridMgmtScreen } from "./grid/GridMgmtScreen";
import { ImportDivisionsScreen } from "./grid/ImportDivisionsScreen";
import { ContinentalCoverageScreen } from "./grid/ContinentalCoverageScreen";
import { CertificationKpisScreen } from "./metrics/CertificationKpisScreen";
import { KpisExportScreen } from "./metrics/KpisExportScreen";
import { TestEnvironmentScreen } from "./metrics/TestEnvironmentScreen";
import { AddressTestScreen } from "./metrics/AddressTestScreen";
import { TempAddressScreen } from "./metrics/TempAddressScreen";
import { ApiDocsScreen } from "./api/ApiDocsScreen";
import { YamiooApiScreen } from "./api/YamiooApiScreen";
import { AdminYamiooAgentsScreen } from "./api/AdminYamiooAgentsScreen";
import { LandingScreen } from "./web/LandingScreen";
import { PricingScreen } from "./web/PricingScreen";
import { AboutScreen } from "./web/AboutScreen";
import { FaqScreen } from "./web/FaqScreen";
import { ContactScreen } from "./web/ContactScreen";
import { InstallScreen } from "./dist/InstallScreen";
import { AppDownloadScreen } from "./dist/AppDownloadScreen";
import { SourceDownloadScreen } from "./dist/SourceDownloadScreen";
import { ManualDownloadScreen } from "./dist/ManualDownloadScreen";
import { DocumentsHubScreen } from "./docs/DocumentsHubScreen";
import { AdminDocLibraryScreen } from "./docs/AdminDocLibraryScreen";
import { ContractDownloadsScreen } from "./docs/ContractDownloadsScreen";
import { IpDocumentationScreen } from "./docs/IpDocumentationScreen";
import { IpDrawingsScreen } from "./docs/IpDrawingsScreen";
import { PatentClaimsScreen } from "./docs/PatentClaimsScreen";
import { GridSystemPdfScreen } from "./docs/GridSystemPdfScreen";
import { BrandGuidelinesScreen } from "./docs/BrandGuidelinesScreen";
import { CountryConfigScreen } from "./admin/CountryConfigScreen";
import { AdminDashScreen } from "./admin/AdminDashScreen";
import { UsersScreen } from "./admin/UsersScreen";
import { RoleApprovalsScreen } from "./admin/RoleApprovalsScreen";
import { SecurityAuditScreen } from "./admin/SecurityAuditScreen";
import { SecurityScreen } from "./admin/SecurityScreen";
import { FraudFlagsScreen } from "./admin/FraudFlagsScreen";
import { ReportsScreen } from "./admin/ReportsScreen";
import { AdminLoginScreen } from "./admin/AdminLoginScreen";
import { AdminSetupScreen } from "./admin/AdminSetupScreen";
import { Admin2faScreen } from "./admin/Admin2faScreen";
import { RegionalMgmtScreen } from "./admin/RegionalMgmtScreen";
import { SetupScreen } from "./admin/SetupScreen";
import { TranslationValidationScreen } from "./admin/TranslationValidationScreen";

/**
 * Screens refactored into idiomatic React components. Any id present here is
 * rendered as a real component; everything else falls back to the faithful
 * design markup via ScreenHost. Extend this map as more screens are rebuilt.
 */
export const IDIOMATIC: Record<string, ComponentType> = {
  welcome: WelcomeScreen,
  type: TypeScreen,
  location: LocationScreen,
  adminDivision: AdminDivisionScreen,
  qgsq: QgsqScreen,
  building: BuildingScreen,
  informal: InformalScreen,
  witnesses: WitnessesScreen,
  home: HomeScreen,
  detail: DetailScreen,
  identitiesMap: IdentitiesMapScreen,
  publicLookup: PublicLookupScreen,
  language: LanguageScreen,
  empty: EmptyScreen,
  buildingDir: BuildingDirScreen,
  changePhone: ChangePhoneScreen,
  trustedDevices: TrustedDevicesScreen,
  docs: DocsSupportScreen,
  certificate: CertificateScreen,
  addresses: AddressesScreen,
  profile: ProfileScreen,
  wayfinding: WayfindingScreen,
  share: ShareScreen,
  witnessRep: WitnessRepScreen,
  reverify: ReverifyScreen,
  riskAlerts: RiskAlertsScreen,
  gpsHistory: GpsHistoryScreen,
  notifications: NotificationsScreen,
  appeal: AppealScreen,
  witnessProximity: WitnessProximityScreen,
  household: HouseholdScreen,
  householdCensus: HouseholdCensusScreen,
  addMember: AddMemberScreen,
  deceased: DeceasedScreen,
  operator: OperatorScreen,
  offline: OfflineScreen,
  validatorInbox: ValidatorInboxScreen,
  validatorReview: ValidatorReviewScreen,
  aflRequests: AflRequestsScreen,
  validationsDashboard: ValidationsDashboardScreen,
  authorityGps: AuthorityGpsScreen,
  confirmWitness: ConfirmWitnessScreen,
  foreigner: ForeignerScreen,
  lease: LeaseScreen,
  authorityDeclaration: AuthorityDeclarationScreen,
  tenancy: TenancyScreen,
  countryConfig: CountryConfigScreen,
  otp: OtpScreen,
  login: LoginScreen,
  presignup: PresignupScreen,
  forgotPassword: ForgotPasswordScreen,
  howitworks: HowItWorksScreen,
  adminDash: AdminDashScreen,
  users: UsersScreen,
  roleApprovals: RoleApprovalsScreen,
  securityAudit: SecurityAuditScreen,
  security: SecurityScreen,
  fraudFlags: FraudFlagsScreen,
  reports: ReportsScreen,
  adminLogin: AdminLoginScreen,
  adminSetup: AdminSetupScreen,
  admin2fa: Admin2faScreen,
  regionalMgmt: RegionalMgmtScreen,
  setup: SetupScreen,
  translationValidation: TranslationValidationScreen,
  telecomOperators: TelecomOperatorsScreen,
  cellTowers: CellTowersScreen,
  importUrbanZones: ImportUrbanZonesScreen,
  gridMgmt: GridMgmtScreen,
  importDivisions: ImportDivisionsScreen,
  continentalCoverage: ContinentalCoverageScreen,
  certificationKpis: CertificationKpisScreen,
  kpisExport: KpisExportScreen,
  testEnvironment: TestEnvironmentScreen,
  addressTest: AddressTestScreen,
  tempAddress: TempAddressScreen,
  apiDocs: ApiDocsScreen,
  yamiooApi: YamiooApiScreen,
  adminYamiooAgents: AdminYamiooAgentsScreen,
  landing: LandingScreen,
  pricing: PricingScreen,
  about: AboutScreen,
  faq: FaqScreen,
  contact: ContactScreen,
  install: InstallScreen,
  appDownload: AppDownloadScreen,
  sourceDownload: SourceDownloadScreen,
  manualDownload: ManualDownloadScreen,
  documentsHub: DocumentsHubScreen,
  adminDocLibrary: AdminDocLibraryScreen,
  contractDownloads: ContractDownloadsScreen,
  ipDocumentation: IpDocumentationScreen,
  ipDrawings: IpDrawingsScreen,
  patentClaims: PatentClaimsScreen,
  gridSystemPdf: GridSystemPdfScreen,
  brandGuidelines: BrandGuidelinesScreen,
};
