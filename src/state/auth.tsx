import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase/client";
import { fetchProfile } from "../lib/supabase/profiles";
import { fetchAuthLevel } from "../lib/supabase/authLevel";
import { fetchWitnessReputation } from "../lib/supabase/reputation";
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

  // Perfil mínimo a partir da conta autenticada. O backend real do AFROLOC
  // (ljcx) não tem tabela `profiles`; a identidade base vem do auth.users.
  const synthProfile = (u: User): ProfileRow => {
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    const name =
      (typeof meta.name === "string" && meta.name) ||
      (typeof meta.full_name === "string" && meta.full_name) ||
      (u.email ? u.email.split("@")[0] : "") ||
      "Cidadão";
    return {
      id: u.id,
      name,
      // Sem telefone guardado (Supabase devolve "" e não null), mostra o email
      // — é o contacto real da conta. `||` trata a string vazia como ausente.
      phone: u.phone || (typeof meta.phone === "string" ? meta.phone : "") || u.email || null,
      avatar_url: (typeof meta.avatar_url === "string" ? meta.avatar_url : null),
      language: "pt",
      level: 1,
      level_title: "Cidadão",
      auth_confidence: 50,
      jurisdiction: null,
      reputation_tier: "Bronze",
      reputation_score: 0,
      testimonials: 0,
      frauds: 0,
      created_at: u.created_at ?? "",
      updated_at: u.updated_at ?? u.created_at ?? "",
    };
  };

  const loadProfile = async (u: User | undefined) => {
    if (!u || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }
    // Identidade base: tabela `profiles` (pode não existir no backend real) →
    // senão, a identidade do auth.users.
    let base: ProfileRow;
    try {
      base = (await fetchProfile(u.id)) ?? synthProfile(u);
    } catch {
      base = synthProfile(u);
    }
    // Enriquece com o NÍVEL de autorização real (user_authorization_levels).
    try {
      const lvl = await fetchAuthLevel(u.id);
      if (lvl) {
        base = {
          ...base,
          level: lvl.level,
          level_title: lvl.levelTitle,
          jurisdiction: lvl.jurisdiction ?? base.jurisdiction,
        };
      }
    } catch {
      /* mantém a base */
    }
    // Enriquece com a REPUTAÇÃO real de testemunha (afroloc_witnesses).
    try {
      const rep = await fetchWitnessReputation(u.id);
      base = {
        ...base,
        reputation_score: rep.score,
        reputation_tier: rep.tier,
        testimonials: rep.testimonials,
        frauds: rep.frauds,
      };
    } catch {
      /* mantém a base */
    }
    setProfile(base);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user).finally(() => setReady(true));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      loadProfile(s?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    ready,
    configured: isSupabaseConfigured,
    session,
    user: session?.user ?? null,
    profile,
    refreshProfile: () => loadProfile(session?.user),
    pendingPhone,
    async signUpEmail(email, password, name) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: name ? { name } : undefined },
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
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return v;
}
