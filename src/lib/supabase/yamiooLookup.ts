// Resolução de códigos AFROLOC no catálogo PÚBLICO da Yamioo (estabelecimentos).
//
// A Consulta AFROLOC procura primeiro no registo do cidadão (`afroloc_records`,
// backend ljcx). Se não encontrar, cai aqui: um código pode ser de um
// ESTABELECIMENTO publicado na Yamioo (base de dados própria da Yamioo). Como é
// um local público, pode revelar coordenadas → permite abrir o Radar para lá
// chegar. (Moradas de cidadão NUNCA revelam coordenadas — ver PublicLookupScreen.)
//
// A Yamioo vive noutro projeto Supabase (oltqppftxvhnkzqshsqx). Só leitura
// pública (RLS: status=active + privacy=public), com a chave ANON pública.
import { createClient } from "@supabase/supabase-js";

const YAMIOO_URL =
  (import.meta.env.VITE_YAMIOO_URL as string | undefined) ||
  "https://oltqppftxvhnkzqshsqx.supabase.co";

// ⬇️ Chave ANON PÚBLICA da Yamioo. Cola a "anon public" (eyJ…) do projeto
// Supabase oltqppftxvhnkzqshsqx (ou define VITE_YAMIOO_ANON_KEY no .env.local).
const YAMIOO_ANON_KEY =
  (import.meta.env.VITE_YAMIOO_ANON_KEY as string | undefined) || "";

// Só cria o cliente se houver chave — senão, o fallback fica inativo (a consulta
// AFROLOC continua a funcionar; simplesmente não resolve estabelecimentos).
const yamioo = YAMIOO_ANON_KEY
  ? createClient(YAMIOO_URL, YAMIOO_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export interface YamiooPlace {
  source: "yamioo";
  code: string;
  title: string;
  city: string | null;
  country: string | null;
  type: string | null;
  url: string | null;
  lat: number;
  lng: number;
}

/**
 * Resolve um código AFROLOC no catálogo público da Yamioo (ou null).
 * Passa por uma função SECURITY DEFINER `yamioo_public_lookup` na Yamioo, porque
 * a tabela `entities` não é legível diretamente pelo anon (RLS). A função devolve
 * só estabelecimentos públicos (status=active, privacy=public).
 * SQL: docs/sql/yamioo_public_lookup.sql (aplicar no Supabase da Yamioo).
 */
export async function lookupYamiooEntity(code: string): Promise<YamiooPlace | null> {
  if (!yamioo) return null;
  const { data, error } = await yamioo.rpc("yamioo_public_lookup", { p_code: code.trim() });
  if (error) return null;
  const e = (Array.isArray(data) ? data[0] : data) as {
    afroloc_code: string | null; title: string | null; city: string | null;
    country: string | null; type: string | null; url: string | null;
    lat: number | null; lng: number | null;
  } | null;
  if (!e || e.lat == null || e.lng == null) return null;
  return {
    source: "yamioo",
    code: e.afroloc_code ?? code.trim(),
    title: e.title ?? "Estabelecimento",
    city: e.city,
    country: e.country,
    type: e.type,
    url: e.url,
    lat: Number(e.lat),
    lng: Number(e.lng),
  };
}
