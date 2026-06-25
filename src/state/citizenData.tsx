import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./auth";
import { listMyAddresses, insertAddress } from "../lib/supabase/addresses";
import { generatedToInsert } from "../lib/afroloc/addressMap";
import type { AddressRow } from "../lib/supabase/types";
import type { CreateAddressResult } from "../lib/afroloc/createAddress";
import type { AddressDraft } from "./types";

interface CitizenData {
  configured: boolean;
  loading: boolean;
  addresses: AddressRow[];
  /** Morada "principal": a primeira ACTIVO, senão a mais recente. */
  primary: AddressRow | null;
  refresh: () => Promise<void>;
  /** Grava o resultado da pipeline de criação na conta do utilizador. */
  saveGenerated: (result: CreateAddressResult, draft: AddressDraft, label?: string) => Promise<AddressRow | null>;
}

const Ctx = createContext<CitizenData | null>(null);

export function CitizenDataProvider({ children }: { children: ReactNode }) {
  const { configured, user } = useAuth();
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!configured || !user) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    try {
      setAddresses(await listMyAddresses());
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [configured, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveGenerated = useCallback<CitizenData["saveGenerated"]>(
    async (result, draft, label) => {
      if (!configured || !user || !result.success || !result.afrolocCode) return null;
      const row = await insertAddress(generatedToInsert(result, draft, user.id, label));
      setAddresses((prev) => [row, ...prev.filter((a) => a.id !== row.id)]);
      return row;
    },
    [configured, user]
  );

  const primary = addresses.find((a) => a.status === "ACTIVO") ?? addresses[0] ?? null;

  return (
    <Ctx.Provider value={{ configured, loading, addresses, primary, refresh, saveGenerated }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCitizenData(): CitizenData {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCitizenData deve ser usado dentro de <CitizenDataProvider>");
  return v;
}
