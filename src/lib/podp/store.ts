// PoDP local store — IndexedDB outbox + sample archive + local rollup. Stands
// in for the backend (podp-sample / podp-rollup) so the silent pipeline runs
// client-side; in production these uploads go to the edge functions instead.
import { computeCycleKpi, rollupSamplesToDays, type PodpConfig, type PodpKpi, type PodpSampleLite } from "./kpi";

const DB_NAME = "afroloc-podp";
const OUTBOX = "outbox";
const ARCHIVE = "samples";
const DB_VERSION = 1;

export interface OutboxRecord {
  clientGeneratedId: string;
  afrolocRecordId: string;
  lat: number;
  lon: number;
  accuracy?: number;
  capturedAt: string;
  isWithinRadius?: boolean;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(OUTBOX)) db.createObjectStore(OUTBOX, { keyPath: "clientGeneratedId" });
      if (!db.objectStoreNames.contains(ARCHIVE)) db.createObjectStore(ARCHIVE, { keyPath: "clientGeneratedId" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | void> {
  return openDb().then(
    (db) =>
      new Promise<T | void>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        const req = fn(s);
        t.oncomplete = () => {
          resolve(req && "result" in req ? (req.result as T) : undefined);
          db.close();
        };
        t.onerror = () => {
          reject(t.error);
          db.close();
        };
      }),
  );
}

export async function enqueueSample(rec: OutboxRecord): Promise<void> {
  await tx(OUTBOX, "readwrite", (s) => s.put(rec));
}

export async function drainOutbox(max = 50): Promise<OutboxRecord[]> {
  const all = (await tx<OutboxRecord[]>(OUTBOX, "readonly", (s) => s.getAll())) as OutboxRecord[];
  return (all ?? []).slice(0, max);
}

export async function removeFromOutbox(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await tx(OUTBOX, "readwrite", (s) => {
    for (const id of ids) s.delete(id);
  });
}

/** Local "upload": archive the accepted samples (the server would INSERT them). */
export async function archiveSamples(recs: OutboxRecord[]): Promise<void> {
  await tx(ARCHIVE, "readwrite", (s) => {
    for (const r of recs) s.put(r);
  });
}

async function archivedFor(recordId: string): Promise<PodpSampleLite[]> {
  const all = (await tx<OutboxRecord[]>(ARCHIVE, "readonly", (s) => s.getAll())) as OutboxRecord[];
  return (all ?? [])
    .filter((r) => r.afrolocRecordId === recordId)
    .map((r) => ({ capturedAt: r.capturedAt, isWithinRadius: !!r.isWithinRadius }));
}

const KPI_KEY = "afroloc-podp-kpi";

function readKpiCache(): Record<string, PodpKpi> {
  try {
    return JSON.parse(localStorage.getItem(KPI_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Local daily rollup + cycle KPI for a record (spec §7.2, client fallback). */
export async function runLocalRollup(recordId: string, cfg: PodpConfig, endDay: Date): Promise<PodpKpi> {
  const samples = await archivedFor(recordId);
  const series = rollupSamplesToDays(samples, cfg, endDay);
  const kpi = computeCycleKpi(series, cfg);
  const cache = readKpiCache();
  cache[recordId] = kpi;
  try {
    localStorage.setItem(KPI_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  return kpi;
}

export function getCachedKpi(recordId: string): PodpKpi | null {
  return readKpiCache()[recordId] ?? null;
}
