import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { bootstrapPodp } from "./lib/podp/bootstrap";
import { AuthProvider } from "./state/auth";
import { CitizenDataProvider } from "./state/citizenData";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CitizenDataProvider>
        <App />
      </CitizenDataProvider>
    </AuthProvider>
  </StrictMode>,
);

// Proof of Daily Presence — silent background sampler. No-op in preview/dev.
bootstrapPodp();
