import { supabase } from "./client";
import type { ProfileRow } from "./types";

/** Lê o perfil do utilizador autenticado (ou null). */
export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,full_name,phone,created_at,updated_at,approval_status")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  // Legacy display fields are never used by the operational profile screen.
  return data ? { id: data.user_id, name: data.full_name, phone: data.phone,
    created_at: data.created_at, updated_at: data.updated_at, approval_status: data.approval_status } as ProfileRow : null;
}

/** Atualiza campos do perfil próprio. */
export async function updateProfile(
  userId: string,
  patch: Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: patch.name })
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return { id: data.user_id, name: data.full_name, phone: data.phone, created_at: data.created_at, updated_at: data.updated_at } as ProfileRow;
}
