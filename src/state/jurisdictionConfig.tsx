import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_TAX_CONFIG, TAX_CONFIG_BY_COUNTRY, type TaxConfig } from "../data/tenancy";
import { DEFAULT_PODP_CONFIG, type PodpConfig } from "../lib/podp/kpi";

interface CountryRules {
  /** Whether rent-tax obligations are active for this jurisdiction. */
  enabled: boolean;
  tax: TaxConfig;
}

// Seed from the static defaults (Angola enabled). Editing in the admin console
// (countryConfig) mutates this store, and the tenancy screen reads from it.
function seed(): Record<string, CountryRules> {
  const out: Record<string, CountryRules> = {};
  for (const iso of Object.keys(TAX_CONFIG_BY_COUNTRY)) {
    out[iso] = { enabled: true, tax: { ...TAX_CONFIG_BY_COUNTRY[iso] } };
  }
  return out;
}

interface JurisdictionConfigValue {
  isEnabled: (iso: string) => boolean;
  taxFor: (iso: string) => TaxConfig;
  setEnabled: (iso: string, enabled: boolean) => void;
  setRate: (iso: string, key: keyof TaxConfig, value: number) => void;
  /** Global PoDP config — editable only by admin level ≥ 4 (spec §2). */
  podp: PodpConfig;
  setPodp: (patch: Partial<PodpConfig>) => void;
}

const Ctx = createContext<JurisdictionConfigValue | null>(null);

export function JurisdictionConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, CountryRules>>(seed);
  const [podp, setPodpState] = useState<PodpConfig>({ ...DEFAULT_PODP_CONFIG });

  const ensure = (prev: Record<string, CountryRules>, iso: string): CountryRules =>
    prev[iso] ?? { enabled: false, tax: { ...DEFAULT_TAX_CONFIG } };

  const isEnabled = useCallback((iso: string) => configs[iso]?.enabled ?? false, [configs]);
  const taxFor = useCallback((iso: string) => configs[iso]?.tax ?? DEFAULT_TAX_CONFIG, [configs]);

  const setEnabled = useCallback((iso: string, enabled: boolean) => {
    setConfigs((prev) => ({ ...prev, [iso]: { ...ensure(prev, iso), enabled } }));
  }, []);

  const setRate = useCallback((iso: string, key: keyof TaxConfig, value: number) => {
    setConfigs((prev) => {
      const base = ensure(prev, iso);
      return { ...prev, [iso]: { ...base, tax: { ...base.tax, [key]: value } } };
    });
  }, []);

  const setPodp = useCallback((patch: Partial<PodpConfig>) => setPodpState((p) => ({ ...p, ...patch })), []);

  const value = useMemo(
    () => ({ isEnabled, taxFor, setEnabled, setRate, podp, setPodp }),
    [isEnabled, taxFor, setEnabled, setRate, podp, setPodp],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJurisdictionConfig(): JurisdictionConfigValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useJurisdictionConfig must be used within JurisdictionConfigProvider");
  return v;
}
