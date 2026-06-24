// AFROLOC — Proof of Daily Presence (PoDP): config + KPI computation.
// Faithful to the internal spec (podp-rollup formula). The KPI reinforces the
// ATS by up to +5 without changing the public ATS formula. Holder-silent.

export interface PodpConfig {
  sampleIntervalMinutes: number; // 15  (1–240)
  toleranceRadiusUrbanM: number; // 75  (10–1000)
  toleranceRadiusRuralM: number; // 250 (25–5000)
  minHoursPerDay: number; // 6.0 (0–24)
  minValidDaysRatio: number; // 0.70 (0–1)
  cycleLengthDays: number; // 14  (1–365)
  maxGpsAccuracyM: number; // 100 (5–1000)
  enabled: boolean;
}

export const DEFAULT_PODP_CONFIG: PodpConfig = {
  sampleIntervalMinutes: 15,
  toleranceRadiusUrbanM: 75,
  toleranceRadiusRuralM: 250,
  minHoursPerDay: 6.0,
  minValidDaysRatio: 0.7,
  cycleLengthDays: 14,
  maxGpsAccuracyM: 100,
  enabled: true,
};

/** Per-day rollup entry (one day of the cycle window). */
export interface PodpDay {
  day: string; // YYYY-MM-DD
  valid: boolean;
  hours: number;
  samples: number;
}

export interface PodpKpi {
  verifiedPct: number; // % of valid days (1 dec)
  validDays: number;
  totalDays: number;
  longestStreak: number;
  currentStreak: number;
  avgHoursPerDay: number;
  avgHoursValidDay: number;
  totalHours: number;
  totalSamples: number;
  consistency: number; // 0..1
  /** podp_score = round(base_score*100) — feeds the ATS audit reinforcement. */
  podpScore: number;
  streakBonusPct: number;
  /** final_score = weighted composite (0..100). */
  finalScore: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute the cycle KPI from a per-day series (spec §3 / podp-rollup).
 * The series should cover the whole cycle window; missing days count as invalid.
 */
export function computeCycleKpi(series: PodpDay[], cfg: PodpConfig): PodpKpi {
  const cycleDays = cfg.cycleLengthDays;
  const minHours = Number(cfg.minHoursPerDay);

  const validDays = series.filter((s) => s.valid).length;
  const verifiedPct = Math.round((validDays / cycleDays) * 1000) / 10;
  const totalHours = series.reduce((a, s) => a + s.hours, 0);
  const avgHoursPerDay = r2(totalHours / cycleDays);
  const avgHoursValidDay =
    validDays > 0 ? r2(series.filter((s) => s.valid).reduce((a, s) => a + s.hours, 0) / validDays) : 0;
  const totalSamples = series.reduce((a, s) => a + s.samples, 0);

  let longestStreak = 0;
  let cur = 0;
  for (const s of series) {
    if (s.valid) {
      cur++;
      if (cur > longestStreak) longestStreak = cur;
    } else cur = 0;
  }
  let currentStreak = 0;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].valid) currentStreak++;
    else break;
  }

  const mean = totalHours / cycleDays;
  const variance = series.reduce((a, s) => a + (s.hours - mean) ** 2, 0) / cycleDays;
  const stddev = Math.sqrt(variance);
  const consistency = Math.max(0, Math.min(1, 1 - stddev / Math.max(minHours, 1)));

  const baseScore = validDays / cycleDays;
  const streakBonus = Math.min(1, longestStreak / cycleDays);
  const finalScore = Math.round((baseScore * 0.7 + streakBonus * 0.2 + consistency * 0.1) * 100);
  const podpScore = Math.round(baseScore * 100);

  return {
    verifiedPct,
    validDays,
    totalDays: cycleDays,
    longestStreak,
    currentStreak,
    avgHoursPerDay,
    avgHoursValidDay,
    totalHours: r2(totalHours),
    totalSamples,
    consistency: r2(consistency),
    podpScore,
    streakBonusPct: Math.round(streakBonus * 100),
    finalScore,
  };
}

export interface PodpSampleLite {
  capturedAt: string; // ISO
  isWithinRadius: boolean;
}

/**
 * Roll up raw samples into the per-day series for the cycle ending at `endDay`
 * (local fallback for the server's daily rollup — spec §7.2).
 */
export function rollupSamplesToDays(samples: PodpSampleLite[], cfg: PodpConfig, endDay: Date): PodpDay[] {
  const validPerDay = new Map<string, number>();
  for (const s of samples) {
    if (!s.isWithinRadius) continue;
    const d = s.capturedAt.slice(0, 10);
    validPerDay.set(d, (validPerDay.get(d) ?? 0) + 1);
  }
  const series: PodpDay[] = [];
  const end = new Date(endDay.toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  for (let i = cfg.cycleLengthDays - 1; i >= 0; i--) {
    const day = new Date(end - i * 86400000).toISOString().slice(0, 10);
    const n = validPerDay.get(day) ?? 0;
    const hours = (n * cfg.sampleIntervalMinutes) / 60;
    series.push({ day, valid: hours >= cfg.minHoursPerDay, hours: r2(hours), samples: n });
  }
  return series;
}

/** ATS reinforcement from the PoDP score: up to +5, never exceeding the cap. */
export function podpAtsBonus(podpScore: number): number {
  return Math.round(5 * (Math.max(0, Math.min(100, podpScore)) / 100));
}

// Deterministic realistic cycle for the admin KPI preview (no live device data
// in this environment). Most days present ~7–9 h; a couple of weak/missed days.
const DEMO_HOURS = [8.2, 7.5, 9.0, 6.8, 0, 7.1, 8.6, 9.2, 7.9, 3.1, 8.0, 8.8, 7.4, 9.1];

export function demoSeries(cfg: PodpConfig): PodpDay[] {
  const out: PodpDay[] = [];
  const end = Date.now();
  for (let i = cfg.cycleLengthDays - 1; i >= 0; i--) {
    const hours = DEMO_HOURS[(cfg.cycleLengthDays - 1 - i) % DEMO_HOURS.length];
    const samples = Math.round((hours * 60) / cfg.sampleIntervalMinutes);
    out.push({
      day: new Date(end - i * 86400000).toISOString().slice(0, 10),
      valid: hours >= cfg.minHoursPerDay,
      hours,
      samples,
    });
  }
  return out;
}
