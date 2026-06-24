import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// AFROLOC — offline-first PWA targeting Capacitor (Android/iOS) as well.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "/?source=pwa",
        name: "AFROLOC — Endereçamento Digital",
        short_name: "AFROLOC",
        description:
          "Um endereço digital, georreferenciado e validado pela comunidade, para cada cidadão.",
        lang: "pt-PT",
        start_url: "/?source=pwa",
        scope: "/",
        categories: ["government", "utilities", "navigation"],
        theme_color: "#1A1814",
        background_color: "#1A1814",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          // SVG kept as a scalable any-purpose fallback (Android Chrome).
          { src: "icon-512.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,json}"],
      },
      // Allow installing/testing the PWA during `npm run dev` too.
      devOptions: { enabled: true, type: "module" },
    }),
  ],
  server: { port: 5173, host: true },
});
