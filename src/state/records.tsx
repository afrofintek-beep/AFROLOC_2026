import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { canonical, errorText, type CanonicalAddress } from "../lib/supabase/canonical";

const Context = createContext<{ records: CanonicalAddress[]; loading: boolean; error: string; refresh: () => Promise<void> } | null>(null);
export function RecordsProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const [records, setRecords] = useState<CanonicalAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recordOwner, setRecordOwner] = useState<string | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    setRecords([]); setError(""); setRecordOwner(user?.id || null);
    if (!user || !configured) { setLoading(false); return; }
    setLoading(true);
    try { const rows = await canonical.list(); if (current === generation.current) setRecords(rows); }
    catch (e) { if (current === generation.current) setError(errorText(e)); }
    finally { if (current === generation.current) setLoading(false); }
  }, [user?.id, configured]);
  useEffect(() => { void refresh(); return () => { ++generation.current; }; }, [refresh]);
  const sameOwner = recordOwner === (user?.id || null);
  return <Context.Provider value={{ records: sameOwner ? records : [], loading: loading || !sameOwner, error: sameOwner ? error : "", refresh }}>{children}</Context.Provider>;
}
export function useRecords() { const v = useContext(Context); if (!v) throw new Error("RecordsProvider required"); return v; }
