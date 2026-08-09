import { HashRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { biometricEnabled, unlockBiometric, disableBiometric } from "./lib/biometric";
import { SCREENS, SCREEN_ORDER } from "./data/screens";
import { SideIndex } from "./components/SideIndex";
import { PhoneFrame } from "./components/PhoneFrame";
import { ScreenHost } from "./components/ScreenHost";
import { IDIOMATIC } from "./screens/registry";
import { CreateFlowProvider } from "./state/createFlow";
import { JurisdictionConfigProvider } from "./state/jurisdictionConfig";
import { useAuth } from "./state/auth";
import { Logo } from "./components/Logo";
import { PUBLIC_SCREENS, ENTRY_SCREENS, APP_SCREENS } from "./data/appScreens";
import { usePhoneMode } from "./lib/usePhoneMode";

function renderScreen(screenId: string) {
  const screen = SCREENS[screenId];
  const Idiomatic = IDIOMATIC[screenId];
  return (
    <PhoneFrame format={screen?.format ?? "phone"}>
      {Idiomatic ? <Idiomatic /> : <ScreenHost screenId={screenId} />}
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
  const { ready, configured, user } = useAuth();
  const phone = usePhoneMode();

  // Enquanto a sessão inicial não resolve (só quando há Supabase ligado).
  if (configured && !ready) return <Splash />;

  // App de uso individual: ecrãs institucionais (validador, admin, campo,
  // telecom/grelha, métricas, API, docs/PI) não fazem parte do percurso do
  // cidadão — ficam disponíveis apenas em /gallery. Aqui, reencaminham para o
  // início. (O welcome cobre o caso de sessão ainda não iniciada.)
  if (!APP_SCREENS.has(screenId)) return <Navigate to="/home" replace />;

  if (configured) {
    const isPublic = PUBLIC_SCREENS.has(screenId);
    if (!user && !isPublic) return <Navigate to="/login" replace />;
    if (user && ENTRY_SCREENS.has(screenId)) return <Navigate to="/home" replace />;
  }

  return (
    <div style={phone
      ? { minHeight: "100dvh", background: "#15120F" }
      : { minHeight: "100dvh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px 8px", background: "#15120F" }}>
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
  const Idiomatic = IDIOMATIC[screenId];
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
            {Idiomatic && (
              <span style={{ font: "700 10px Inter", letterSpacing: ".08em", color: "#2D2519", background: "var(--afl-grad-glow)", borderRadius: 6, padding: "3px 7px" }}>REACT</span>
            )}
            <span className="afl-canvas__id">{screenId}{screen?.format === "web" ? " · web" : ""}</span>
          </div>
        </div>
        <PhoneFrame format={screen?.format ?? "phone"}>
          {Idiomatic ? <Idiomatic /> : <ScreenHost screenId={screenId} />}
        </PhoneFrame>
      </main>
    </div>
  );
}

/** Portão de bloqueio biométrico (Face ID/digital) — só quando ativo e com sessão. */
function BiometricGate({ children }: { children: ReactNode }) {
  const { user, ready, configured, signOut } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (configured && !ready) return <Splash />;
  if (!biometricEnabled() || !user || unlocked) return <>{children}</>;

  const unlock = async () => {
    setBusy(true);
    setErr(null);
    const ok = await unlockBiometric();
    setBusy(false);
    if (ok) setUnlocked(true);
    else setErr("Não reconhecido. Tenta novamente.");
  };
  const escape = async () => {
    if (configured) await signOut();
    disableBiometric();
    setUnlocked(true);
    window.location.hash = "#/welcome";
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, background: "#15120F", color: "#F8F5F0", padding: 24 }}>
      <Logo size={56} />
      <div style={{ textAlign: "center" }}>
        <div style={{ font: "700 18px Inter" }}>AFROLOC bloqueada</div>
        <div style={{ font: "400 13px Inter", color: "#A99E8C", marginTop: 6 }}>Desbloqueia com Face ID ou impressão digital.</div>
      </div>
      <button onClick={unlock} disabled={busy} style={{ border: "none", background: "var(--afl-grad-glow)", color: "#2D2519", font: "700 15px Inter", borderRadius: 14, padding: "14px 28px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
        {busy ? "A verificar…" : "Desbloquear"}
      </button>
      {err && <div style={{ font: "600 12px Inter", color: "#E8927E" }}>{err}</div>}
      <button onClick={escape} style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: "#8A8073" }}>Terminar sessão</button>
    </div>
  );
}

export default function App() {
  return (
    <CreateFlowProvider>
      <JurisdictionConfigProvider>
        <HashRouter>
          <BiometricGate>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            {/* Galeria de programador */}
            <Route path="/gallery" element={<Navigate to="/gallery/welcome" replace />} />
            <Route path="/gallery/:screenId" element={<GalleryView />} />
            {/* App real do cidadão */}
            <Route path="/:screenId" element={<AppScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BiometricGate>
        </HashRouter>
      </JurisdictionConfigProvider>
    </CreateFlowProvider>
  );
}
