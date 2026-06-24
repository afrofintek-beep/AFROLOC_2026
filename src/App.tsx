import { HashRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { SCREENS, SCREEN_ORDER } from "./data/screens";
import { SideIndex } from "./components/SideIndex";
import { PhoneFrame } from "./components/PhoneFrame";
import { ScreenHost } from "./components/ScreenHost";
import { IDIOMATIC } from "./screens/registry";
import { CreateFlowProvider } from "./state/createFlow";
import { JurisdictionConfigProvider } from "./state/jurisdictionConfig";

function ScreenView() {
  const { screenId = "welcome" } = useParams();
  const navigate = useNavigate();
  const screen = SCREENS[screenId];
  const Idiomatic = IDIOMATIC[screenId];
  const idx = SCREEN_ORDER.indexOf(screenId);
  const prev = idx > 0 ? SCREEN_ORDER[idx - 1] : null;
  const next = idx > -1 && idx < SCREEN_ORDER.length - 1 ? SCREEN_ORDER[idx + 1] : null;

  return (
    <div className="afl-stage">
      <SideIndex current={screenId} />
      <main className="afl-canvas">
        <div className="afl-canvas__bar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="afl-btn-ghost" onClick={() => navigate(-1)}>
              ← Voltar
            </button>
            <button
              className="afl-btn-ghost"
              disabled={!prev}
              onClick={() => prev && navigate("/" + prev)}
            >
              ‹ Anterior
            </button>
            <button
              className="afl-btn-ghost"
              disabled={!next}
              onClick={() => next && navigate("/" + next)}
            >
              Seguinte ›
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>
              {idx > -1 ? idx + 1 : "—"} / {SCREEN_ORDER.length}
            </span>
            {Idiomatic && (
              <span
                style={{
                  font: "700 10px Inter",
                  letterSpacing: ".08em",
                  color: "#2D2519",
                  background: "var(--afl-grad-glow)",
                  borderRadius: 6,
                  padding: "3px 7px",
                }}
              >
                REACT
              </span>
            )}
            <span className="afl-canvas__id">
              {screenId}
              {screen?.format === "web" ? " · web" : ""}
            </span>
          </div>
        </div>
        <PhoneFrame format={screen?.format ?? "phone"}>
          {Idiomatic ? <Idiomatic /> : <ScreenHost screenId={screenId} />}
        </PhoneFrame>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CreateFlowProvider>
      <JurisdictionConfigProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/:screenId" element={<ScreenView />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </HashRouter>
      </JurisdictionConfigProvider>
    </CreateFlowProvider>
  );
}
