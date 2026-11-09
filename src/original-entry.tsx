import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { AuthProvider } from "./state/auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
        <App />
    </AuthProvider>
  </StrictMode>,
);

// Presence check-ins require an explicit user action and a real owned record.
