import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { bootstrapPodp } from "./lib/podp/bootstrap";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Proof of Daily Presence — silent background sampler. No-op in preview/dev.
bootstrapPodp();
