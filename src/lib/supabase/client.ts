import { createClient } from "@supabase/supabase-js";

// Lidas de variáveis de ambiente Vite (ver .env.example).
// No Vercel: Settings → Environment Variables.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True quando as chaves Supabase estão configuradas. */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Aviso de programador — a app corre em modo demo até ligares o Supabase.
  console.warn(
    "[AFROLOC] Supabase não configurado — a correr em modo demo. " +
      "Define VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local"
  );
}

// Cliente único. Em modo demo (sem chaves) usamos placeholders inertes para
// não rebentar o import; nenhuma chamada deve ser feita sem isSupabaseConfigured.
export const supabase = createClient(
  url ?? "https://demo.invalid",
  anonKey ?? "demo-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
