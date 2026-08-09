// Agregado / residentes REAIS de uma morada, no backend de produção (ljcx),
// tabela `afroloc_residents`. Replica o app oficial (AddResidentDialog): um
// membro do agregado é apenas NOME + PARENTESCO (a prova documental é depois).
import { supabase } from "./client";
import type { Relationship } from "../../data/household";

export interface ResidentRow {
  id: string;
  full_name: string | null;
  relationship: string;
  is_primary: boolean;
  status: string;
  user_id: string | null;
}

/** Parentesco do demo → enum real de `resident_relationship`. */
const REL_TO_REAL: Record<Relationship, string> = {
  titular: "spouse", // não usado (o titular não se adiciona)
  conjuge: "spouse",
  filho: "child",
  progenitor: "parent",
  irmao: "sibling",
  outro: "other_family",
};

/** Residentes reais de uma morada (titular primeiro). */
export async function listResidents(recordId: string): Promise<ResidentRow[]> {
  const { data, error } = await supabase
    .from("afroloc_residents")
    .select("id,full_name,relationship,is_primary,status,user_id")
    .eq("afroloc_record_id", recordId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as ResidentRow[];
}

/**
 * Adiciona um membro do agregado (nome + parentesco). Fica em
 * `pending_documents` — a prova documental submete-se depois, como no oficial.
 */
export async function addResident(
  recordId: string,
  fullName: string,
  rel: Relationship
): Promise<{ ok: boolean; message: string }> {
  const name = fullName.trim();
  if (!name) return { ok: false, message: "Indique o nome completo." };
  const { error } = await supabase.from("afroloc_residents").insert({
    afroloc_record_id: recordId,
    user_id: null,
    full_name: name,
    relationship: REL_TO_REAL[rel],
    is_primary: false,
    status: "pending_documents",
  } as never);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Membro adicionado ao agregado." };
}

// ── Estado + gestão (igual ao ResidentsTab oficial) ──────────
export const REL_LABEL: Record<string, string> = {
  spouse: "Cônjuge", child: "Filho(a)", parent: "Progenitor", father: "Pai", mother: "Mãe",
  sibling: "Irmão(ã)", other_family: "Outro familiar", tenant: "Inquilino", cohabitant: "Coabitante", owner: "Proprietário",
};

export interface StatusMeta { label: string; tone: "green" | "amber" | "red"; }
export function statusMeta(status: string): StatusMeta {
  switch (status) {
    case "approved": case "active": return { label: "Aprovado", tone: "green" };
    case "pending_documents": return { label: "Aguarda documentos", tone: "amber" };
    case "pending_primary": return { label: "Aguarda o titular", tone: "amber" };
    case "pending_authority": return { label: "Aguarda autoridade", tone: "amber" };
    case "rejected": return { label: "Recusado", tone: "red" };
    case "revoked": return { label: "Revogado", tone: "red" };
    default: return { label: status, tone: "amber" };
  }
}
export const isApproved = (s: string) => s === "approved" || s === "active";
export const isPending = (s: string) => ["pending_documents", "pending_primary", "pending_authority"].includes(s);

/**
 * Avança a aprovação de um co-residente (mesma máquina de estados do oficial):
 * documentos → titular → autoridade → aprovado.
 */
export async function approveResident(id: string, status: string): Promise<{ ok: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sessão necessária." };
  const now = new Date().toISOString();
  let patch: Record<string, unknown>;
  if (status === "pending_documents") patch = { status: "pending_primary" };
  else if (status === "pending_primary") patch = { status: "pending_authority", primary_approved_at: now, primary_approved_by_user_id: user.id };
  else if (status === "pending_authority") patch = { status: "approved", valid_from: now, authority_approved_at: now, authority_approved_by_user_id: user.id };
  else return { ok: false, message: "Nada a aprovar." };
  const { error } = await supabase.from("afroloc_residents").update(patch as never).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: patch.status === "approved" ? "Residente aprovado." : "Passo aprovado." };
}

/** Remove (revoga) um co-residente da residência. */
export async function removeResident(id: string): Promise<{ ok: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sessão necessária." };
  const { error } = await supabase
    .from("afroloc_residents")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_by_user_id: user.id } as never)
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Co-residente removido." };
}
