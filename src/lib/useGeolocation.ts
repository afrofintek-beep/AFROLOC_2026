import { useCallback, useState } from "react";

export interface GeoFix {
  lat: number;
  lng: number;
  accuracy: number;
}

export type GeoStatus = "idle" | "locating" | "ready" | "denied" | "unavailable";

interface GeoState {
  status: GeoStatus;
  fix: GeoFix | null;
  error: string | null;
}

/**
 * Real device GPS. Uses the Capacitor Geolocation plugin when available
 * (native Android/iOS) and falls back to the browser Geolocation API on web.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle", fix: null, error: null });

  const locate = useCallback(async () => {
    setState((s) => ({ ...s, status: "locating", error: null }));

    // Try the Capacitor plugin first (works on web too, native on device).
    try {
      const mod = await import("@capacitor/geolocation");
      const pos = await mod.Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10_000,
      });
      setState({
        status: "ready",
        fix: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy ?? 0),
        },
        error: null,
      });
      return;
    } catch (err) {
      // Fall through to the web API; only treat as denied if that fails too.
      void err;
    }

    if (!("geolocation" in navigator)) {
      setState({ status: "unavailable", fix: null, error: "GPS indisponível neste dispositivo." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "ready",
          fix: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          },
          error: null,
        });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          fix: null,
          error:
            err.code === err.PERMISSION_DENIED
              ? "Permissão de localização recusada."
              : "Não foi possível obter a localização.",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  }, []);

  return { ...state, locate };
}
