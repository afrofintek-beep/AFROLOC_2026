import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase/client";
import { fetchProfile } from "../lib/supabase/profiles";
import type { ProfileRow } from "../lib/supabase/types";

interface AuthState {
  ready: boolean;            // sessão inicial resolvida
  configured: boolean;       // Supabase tem chaves
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  refreshProfile: () => Promise<void>;
  /** Número (E.164) a aguardar verificação OTP, definido por sendPhoneOtp. */
  pendingPhone: string | null;
  // email — devolve se a conta precisa de confirmação por email antes de entrar
  signUpEmail: (email: string, password: string, name?: string) => Promise<{ needsConfirmation: boolean }>;
  signInEmail: (email: string, password: string) => Promise<void>;
  // telefone / OTP
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const profileRequest = useRef(0);

  const loadProfile = async (uid: string | undefined) => {
    const request = ++profileRequest.current;
    if (!uid || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }
    try {
      const result = await fetchProfile(uid);
      if (request === profileRequest.current) setProfile(result);
    } catch {
      if (request === profileRequest.current) setProfile(null);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user.id).finally(() => setReady(true));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      ++profileRequest.current;
      setProfile(null);
      // Avoid issuing Supabase requests inside the auth callback's lock.
      setTimeout(() => { void loadProfile(s?.user.id); }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    ready,
    configured: isSupabaseConfigured,
    session,
    user: session?.user ?? null,
    profile: profile?.id === session?.user.id ? profile : null,
    refreshProfile: () => loadProfile(session?.user.id),
    pendingPhone,
    async signUpEmail(email, password, name) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: name ? { full_name: name } : undefined },
      });
      if (error) throw error;
      // Sem sessão => o Supabase exige confirmação por email antes de entrar.
      return { needsConfirmation: !data.session };
    },
    async signInEmail(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async sendPhoneOtp(phone) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setPendingPhone(phone);
    },
    async verifyPhoneOtp(phone, token) {
      const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
      if (error) throw error;
      setPendingPhone(null);
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return v;
}
