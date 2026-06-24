import type { CapacitorConfig } from "@capacitor/cli";

// AFROLOC native shell (Android/iOS) — wraps the same Vite PWA build.
const config: CapacitorConfig = {
  appId: "com.afrofintek.afroloc",
  appName: "AFROLOC",
  webDir: "dist",
  backgroundColor: "#1A1814",
  server: {
    androidScheme: "https",
  },
};

export default config;
