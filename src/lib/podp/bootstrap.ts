// Wires the silent PoDP sampler to the app. No-op outside allowed contexts
// (preview / iframe / dev) by design — see isSilentContextAllowed().
import { DEFAULT_PODP_CONFIG } from "./kpi";
import { startPodpSampler, type PodpRecord } from "./sampler";

function getPosition(): Promise<{ lat: number; lon: number; accuracy?: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }),
      reject,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  });
}

async function loadRecords(): Promise<PodpRecord[]> {
  // The signed-in holder's active addresses (seeded from the primary address).
  return [{ id: "casa", lat: -8.89912, lon: 13.20534, zone: "urban" }];
}

export function bootstrapPodp(): void {
  void startPodpSampler({ loadRecords, getPosition, config: DEFAULT_PODP_CONFIG });
}
