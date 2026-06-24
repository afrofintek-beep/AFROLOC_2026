import { supabase } from "./client";
import type { ProfileRow } from "./types";

/** Lê o perfil do utilizador autenticado (ou null). */
export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

/** Atualiza campos do perfil próprio. */
export async function updateProfile(
  userId: string,
  patch: Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as ProfileRow;
}
