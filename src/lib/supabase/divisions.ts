// Divisões administrativas REAIS do AFROLOC (produção ljcx), tabela
// `administrative_divisions`. É a MESMA fonte que o app oficial usa nos
// seletores de criação — garante que o que o utilizador escolhe bate certo
// com a estrutura de produção (ex.: Luanda → Belas → comuna).
import { supabase } from "./client";

export interface DivOption {
  code: string;
  name: string;
}

/**
 * Lista as divisões de um nível (1=província, 2=município, 3=comuna) para um
 * país; `parentCode` filtra pelos filhos de uma divisão. Ordenadas por nome.
 */
export async function listDivisions(
  country: string,
  level: number,
  parentCode?: string
): Promise<DivOption[]> {
  let q = supabase
    .from("administrative_divisions")
    .select("code,name")
    .eq("country_code", country)
    .eq("level", level)
    .order("name");
  if (parentCode) q = q.eq("parent_code", parentCode);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as DivOption[];
}
