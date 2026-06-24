import { supabase } from "./client";
import type { AddressInsert, AddressRow } from "./types";

/** Todas as moradas do utilizador autenticado, mais recentes primeiro. */
export async function listMyAddresses(): Promise<AddressRow[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AddressRow[];
}

/** Uma morada pelo código AFROLOC (apenas se for do utilizador). */
export async function getAddressByCode(code: string): Promise<AddressRow | null> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return data as AddressRow | null;
}

/** Insere uma nova morada (owner_id é validado pela RLS = auth.uid()). */
export async function insertAddress(row: AddressInsert): Promise<AddressRow> {
  const { data, error } = await supabase
    .from("addresses")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data as AddressRow;
}

/** Atualiza uma morada própria. */
export async function updateAddress(
  id: string,
  patch: Partial<AddressInsert>
): Promise<AddressRow> {
  const { data, error } = await supabase
    .from("addresses")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as AddressRow;
}

/** Apaga uma morada própria. */
export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}
