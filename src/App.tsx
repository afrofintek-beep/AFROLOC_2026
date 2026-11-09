import { HashRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { SCREENS, SCREEN_ORDER } from "./data/screens";
import { SideIndex } from "./components/SideIndex";
import { PhoneFrame } from "./components/PhoneFrame";
import { LIVE, LinkedServiceScreen, ServiceStatusScreen } from "./screens/live/registry";
import { CreateFlowProvider } from "./state/createFlow";
import { JurisdictionConfigProvider } from "./state/jurisdictionConfig";
import { useAuth } from "./state/auth";
import { Logo } from "./components/Logo";
import { RecordsProvider } from "./state/records";

// Ecrãs acessíveis sem sessão iniciada (fluxo de entrada + marketing/ajuda).
const PUBLIC_SCREENS = new Set([
  "welcome", "login", "register", "phoneLogin", "presignup", "otp", "forgotPassword", "howitworks",
  // páginas web públicas
  "landing", "pricing", "about", "faq", "contact", "install", "appDownload",
  "sourceDownload", "manualDownload", "publicLookup",
  "services", "serviceStatus",
]);

// Mal autenticado, estes ecrãs de entrada reencaminham para o início.
const ENTRY_SCREENS = new Set(["welcome", "login", "register", "phoneLogin", "presignup", "otp"]);

function renderScreen(screenId: string) {
  const Screen = screenId === "serviceStatus" ? ServiceStatusScreen : LIVE[screenId] || LinkedServiceScreen;
  return (
    <PhoneFrame format="phone">
      <Screen />
    </PhoneFrame>
  );
}

function Splash() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0EADE" }}>
      <Logo size={64} />
    </div>
  );
}

/** App real do cidadão — ecrã único centrado, com proteção de rotas. */
function AppScreen() {
  const { screenId = "welcome" } = useParams();
  const { ready, configured, user, profile, refreshProfile, signOut } = useAuth();

  // Enquanto a sessão inicial não resolve (só quando há Supabase ligado).
  if (configured && !ready) return <Splash />;
  if (!configured) return <div className="live-card"><h1>Ligação AFROLOC indisponível</h1><p>Esta versão precisa da configuração do serviço para apresentar os seus registos.</p></div>;

  if (configured) {
    const isPublic = PUBLIC_SCREENS.has(screenId);
    if (!user && !isPublic) return <Navigate to="/login" replace />;
    if (user && ENTRY_SCREENS.has(screenId)) return <Navigate to="/home" replace />;
    if (user && !isPublic && profile?.approval_status !== "approved") return <div className="live-card"><h1>{profile ? "Conta a aguardar aprovação" : "A carregar o perfil"}</h1><p>{profile ? "O acesso depende da aprovação registada pela AFROLOC." : "Se esta mensagem persistir, atualize o perfil ou volte a iniciar sessão."}</p><button className="live-button" onClick={() => void refreshProfile()}>Atualizar</button><button className="live-button" onClick={() => void signOut()}>Sair</button></div>;
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px 8px", background: "#15120F" }}>
      {renderScreen(screenId)}
    </div>
  );
}

/** Entrada raiz: início se autenticado, senão boas-vindas. */
function RootRedirect() {
  const { configured, user, ready } = useAuth();
  if (configured && !ready) return <Splash />;
  return <Navigate to={configured && user ? "/home" : "/welcome"} replace />;
}

// ────────────────────────────────────────────────────────────
// Galeria de programador (todos os 95 ecrãs com índice lateral).
// Mantida em /gallery para referência de design — não é a app pública.
// ────────────────────────────────────────────────────────────
function GalleryView() {
  const { screenId = "welcome" } = useParams();
  const navigate = useNavigate();
  const screen = SCREENS[screenId];
  const idx = SCREEN_ORDER.indexOf(screenId);
  const prev = idx > 0 ? SCREEN_ORDER[idx - 1] : null;
  const next = idx > -1 && idx < SCREEN_ORDER.length - 1 ? SCREEN_ORDER[idx + 1] : null;

  return (
    <div className="afl-stage">
      <SideIndex current={screenId} basePath="/gallery" />
      <main className="afl-canvas">
        <div className="afl-canvas__bar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="afl-btn-ghost" onClick={() => navigate(-1)}>← Voltar</button>
            <button className="afl-btn-ghost" disabled={!prev} onClick={() => prev && navigate("/gallery/" + prev)}>‹ Anterior</button>
            <button className="afl-btn-ghost" disabled={!next} onClick={() => next && navigate("/gallery/" + next)}>Seguinte ›</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>{idx > -1 ? idx + 1 : "—"} / {SCREEN_ORDER.length}</span>
            {(
              <span style={{ font: "700 10px Inter", letterSpacing: ".08em", color: "#2D2519", background: "var(--afl-grad-glow)", borderRadius: 6, padding: "3px 7px" }}>DESENHO ORIGINAL · EXEMPLOS FICTÍCIOS · SEM OPERAÇÕES</span>
            )}
            <span className="afl-canvas__id">{screenId}{screen?.format === "web" ? " · web" : ""}</span>
          </div>
        </div>
        <PhoneFrame format={screen?.format ?? "phone"}>
          <div {...{ inert: "" }} aria-label="Desenho de referência sem operações" dangerouslySetInnerHTML={{ __html: screen?.html || "Ecrã de referência indisponível." }} />
        </PhoneFrame>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RecordsProvider><CreateFlowProvider>
      <JurisdictionConfigProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            {/* Galeria de programador */}
            <Route path="/gallery" element={<Navigate to="/gallery/welcome" replace />} />
            <Route path="/gallery/:screenId" element={<GalleryView />} />
            {/* App real do cidadão */}
            <Route path="/:screenId" element={<AppScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </JurisdictionConfigProvider>
    </CreateFlowProvider></RecordsProvider>
  );
}
