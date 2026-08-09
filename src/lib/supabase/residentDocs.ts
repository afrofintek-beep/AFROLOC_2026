// Documentos de prova da relação de um co-residente — backend real do AFROLOC:
// bucket Storage `resident-documents` + tabela `afroloc_resident_documents`.
// Igual ao oficial: a prova (certidão de nascimento p/ filho, casamento p/
// cônjuge, contrato p/ inquilino…) é submetida e fica a aguardar validação.
import { supabase } from "./client";

export type ResidentDocType =
  | "birth_certificate" | "marriage_certificate" | "identity_card" | "passport"
  | "rental_contract" | "residence_declaration" | "property_deed";

export const DOC_TYPES: { value: ResidentDocType; label: string }[] = [
  { value: "birth_certificate", label: "Certidão de nascimento" },
  { value: "marriage_certificate", label: "Certidão de casamento" },
  { value: "identity_card", label: "Bilhete de identidade / Cédula" },
  { value: "passport", label: "Passaporte" },
  { value: "rental_contract", label: "Contrato de arrendamento" },
  { value: "residence_declaration", label: "Declaração de residência" },
  { value: "property_deed", label: "Título de propriedade" },
];

/** Documento de prova sugerido por parentesco. */
export function suggestedDocFor(relationship: string): ResidentDocType {
  switch (relationship) {
    case "child": case "parent": case "sibling": return "birth_certificate";
    case "spouse": return "marriage_certificate";
    case "tenant": return "rental_contract";
    case "owner": return "property_deed";
    default: return "residence_declaration";
  }
}

export interface ResidentDocRow {
  id: string;
  document_type: string;
  file_name: string;
  status: string;
  created_at: string;
}

export async function listResidentDocs(residentId: string): Promise<ResidentDocRow[]> {
  const { data, error } = await supabase
    .from("afroloc_resident_documents")
    .select("id,document_type,file_name,status,created_at")
    .eq("resident_id", residentId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ResidentDocRow[];
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/**
 * Carrega um ficheiro de prova para o Storage e regista-o. Faz a prova avançar
 * o co-residente de "aguarda documentos" para "aguarda o titular".
 */
export async function uploadResidentDoc(
  residentId: string,
  docType: ResidentDocType,
  file: File
): Promise<{ ok: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sessão necessária." };

  const path = `${user.id}/${residentId}/${Date.now()}_${safeName(file.name)}`;
  const up = await supabase.storage.from("resident-documents").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (up.error) return { ok: false, message: "Falha no envio do ficheiro: " + up.error.message };

  const { error: insErr } = await supabase.from("afroloc_resident_documents").insert({
    resident_id: residentId,
    document_type: docType,
    file_name: file.name,
    file_path: path,
    file_size: file.size,
    mime_type: file.type || null,
    status: "pending",
    user_id: user.id,
  } as never);
  if (insErr) return { ok: false, message: insErr.message };

  // Prova submetida → avança o co-residente (só se ainda "aguarda documentos").
  await supabase
    .from("afroloc_residents")
    .update({ status: "pending_primary" } as never)
    .eq("id", residentId)
    .eq("status", "pending_documents");

  return { ok: true, message: "Documento enviado. Fica a aguardar validação." };
}
