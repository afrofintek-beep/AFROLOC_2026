// Nível de autorização REAL do utilizador, lido de `user_authorization_levels`
// (backend de produção ljcx) — a mesma fonte que o app AFROLOC real usa.
import { supabase } from "./client";

export interface AuthLevelInfo {
  level: number;
  levelTitle: string;
  jurisdiction: string | null;
}

/** Título por nível na hierarquia AFROLOC (1 cidadão → 5 nacional). */
export function titleForLevel(level: number): string {
  switch (level) {
    case 5: return "Administrador Nacional";
    case 4: return "Administrador Provincial";
    case 3: return "Administrador Municipal";
    case 2: return "Administrador Comunal";
    default: return "Cidadão";
  }
}

/** Lê o nível de autorização do utilizador (null se não existir/indisponível). */
export async function fetchAuthLevel(userId: string): Promise<AuthLevelInfo | null> {
  const { data, error } = await supabase
    .from("user_authorization_levels")
    .select(
      "current_level,jurisdiction_country,jurisdiction_level1_name,jurisdiction_level2_name,jurisdiction_level3_name,jurisdiction_level4_name"
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const jurisdiction =
    [data.jurisdiction_level2_name, data.jurisdiction_level1_name, data.jurisdiction_country]
      .filter(Boolean)
      .join(" · ") || null;
  return {
    level: data.current_level ?? 1,
    levelTitle: titleForLevel(data.current_level ?? 1),
    jurisdiction,
  };
}
