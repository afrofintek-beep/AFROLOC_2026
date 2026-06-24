/**
 * AFROLOC — Proof of Daily Presence (PoDP) sampler (spec §8).
 *
 * Silent background GPS sampler — NOT exposed to the holder (no UI / toasts /
 * notifications). Stores samples in IndexedDB; the sync layer "uploads" them
 * (here: archives locally + local rollup, since there is no backend in this app).
 *
 * Activation: authenticated holder with ≥1 address, running in Capacitor native
 * or an INSTALLED PWA. Skips iframe / preview / dev to stay silent & battery-friendly.
 */
import { haversineDistance } from "../afroloc/geo";
import { DEFAULT_PODP_CONFIG, type PodpConfig } from "./kpi";
import { archiveSamples, drainOutbox, enqueueSample, removeFromOutbox, runLocalRollup } from "./store";

export interface PodpRecord {
  id: string;
  lat: number;
  lon: number;
  zone: "urban" | "rural";
}

interface SamplerDeps {
  /** Resolve the holder's active addresses (with coordinates). */
  loadRecords: () => Promise<PodpRecord[]>;
  /** Capture a GPS fix (low-accuracy, battery-friendly). */
  getPosition: () => Promise<{ lat: number; lon: number; accuracy?: number }>;
  config: PodpConfig;
}

/** Only run where the spec allows — silent contexts (native / installed PWA). */
export function isSilentContextAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.self !== window.top) return false; // iframe / preview
  } catch {
    return false;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host.startsWith("127.") || host.startsWith("preview")) return false;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true;
  return standalone;
}

let sampleTimer: number | null = null;
let syncTimer: number | null = null;
let started = false;

function localValidate(rec: PodpRecord, lat: number, lon: number, accuracy: number | undefined, cfg: PodpConfig) {
  // Anti-spoofing (spec §5): coordinate precision + accuracy.
  const latDec = (lat.toString().split(".")[1] || "").length;
  const lonDec = (lon.toString().split(".")[1] || "").length;
  if (latDec < 4 || lonDec < 4) return { within: false, reason: "low_precision" };
  if (accuracy != null && accuracy > cfg.maxGpsAccuracyM) return { within: false, reason: "low_accuracy" };
  const distance = haversineDistance(rec.lat, rec.lon, lat, lon);
  const radius = rec.zone === "urban" ? cfg.toleranceRadiusUrbanM : cfg.toleranceRadiusRuralM;
  return { within: distance <= radius, reason: null as string | null, distance };
}

async function takeSample(deps: SamplerDeps, records: PodpRecord[]): Promise<void> {
  if (!records.length) return;
  try {
    const { lat, lon, accuracy } = await deps.getPosition();
    const capturedAt = new Date().toISOString();
    for (const rec of records) {
      const v = localValidate(rec, lat, lon, accuracy, deps.config);
      await enqueueSample({
        clientGeneratedId: `${rec.id}-${capturedAt}`,
        afrolocRecordId: rec.id,
        lat,
        lon,
        accuracy,
        capturedAt,
        isWithinRadius: v.within,
      });
    }
    void syncOnce(records, deps.config);
  } catch {
    /* sample skipped — silent */
  }
}

async function syncOnce(records: PodpRecord[], cfg: PodpConfig): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    const batch = await drainOutbox(50);
    if (!batch.length) return;
    // Production: POST batch to the `podp-sample` edge function.
    // Here: archive locally, then run the local daily rollup + cycle KPI.
    await archiveSamples(batch);
    await removeFromOutbox(batch.map((b) => b.clientGeneratedId));
    const today = new Date();
    for (const r of records) await runLocalRollup(r.id, cfg, today);
  } catch {
    /* silent */
  }
}

/** Start the silent sampler. No-op outside allowed contexts (keeps it silent). */
export async function startPodpSampler(deps: SamplerDeps): Promise<void> {
  if (started || !deps.config.enabled || !isSilentContextAllowed()) return;
  started = true;
  const records = await deps.loadRecords();
  const intervalMs = deps.config.sampleIntervalMinutes * 60 * 1000;
  // Stagger the first sample by a small random delay.
  window.setTimeout(() => void takeSample(deps, records), 30_000 + Math.floor(Math.random() * 30_000));
  sampleTimer = window.setInterval(() => void takeSample(deps, records), intervalMs);
  syncTimer = window.setInterval(() => void syncOnce(records, deps.config), 5 * 60 * 1000);
  window.addEventListener("online", () => void syncOnce(records, deps.config));
}

export function stopPodpSampler(): void {
  if (sampleTimer) window.clearInterval(sampleTimer);
  if (syncTimer) window.clearInterval(syncTimer);
  sampleTimer = syncTimer = null;
  started = false;
}

export { DEFAULT_PODP_CONFIG };
