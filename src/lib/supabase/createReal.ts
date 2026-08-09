// ────────────────────────────────────────────────────────────
// Criação REAL de uma morada no backend de produção do AFROLOC (ljcx).
//
// Replica exatamente o que o app oficial (afroc_app26 · CreateIdentity) faz:
//   1. resolve os códigos administrativos de PRODUÇÃO por nome
//      (administrative_divisions) — ex.: Luanda→AO-LDA, Belas→AO-LDA-BELAS;
//   2. gera o código AFROLOC pela mesma edge function `qg-engine` (código e
//      célula X/Y idênticos aos de produção — nada de códigos "de brincar");
//   3. grava em `afroloc_records` com estado `draft`.
//
// A escrita corre com a sessão do próprio utilizador (RLS: user_id = auth.uid()).
// ────────────────────────────────────────────────────────────
import { supabase } from "./client";
import type { AfrolocRecord } from "./afrolocRecords";
import type { AddressDraft } from "../../state/types";

interface Div {
  code: string;
  name: string;
}

/** Código curto (últimas 3 letras da última parte) — para os args do qg-engine. */
function shortCode(code: string): string {
  const parts = (code || "").split("-").filter(Boolean);
  return (parts[parts.length - 1] || "").substring(0, 3).toUpperCase();
}

/** Segmento canónico de nomenclatura (MAIÚSCULAS, sem acentos/espaços). */
function canonSeg(s: string | null | undefined): string {
  return (s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "") || "GEN";
}

/** Resolve uma divisão administrativa de produção por nome (nível + pai). */
async function resolveDivision(
  country: string,
  level: number,
  name: string | undefined,
  parentCode?: string
): Promise<Div | null> {
  if (!name) return null;
  let q = supabase
    .from("administrative_divisions")
    .select("code,name")
    .eq("country_code", country)
    .eq("level", level)
    .ilike("name", name)
    .limit(1);
  if (parentCode) q = q.eq("parent_code", parentCode);
  const { data } = await q;
  return data && data[0] ? (data[0] as Div) : null;
}

/**
 * Cria uma morada real a partir do rascunho do fluxo de criação do demo.
 * Devolve o registo inserido (formato `afroloc_records`).
 */
export async function createRealAddress(draft: AddressDraft, label = "Casa"): Promise<AfrolocRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão necessária para criar uma morada.");

  const country = draft.division.countryIso;
  const lat = draft.coords.lat;
  const lon = draft.coords.lng;
  if (lat == null || lon == null) throw new Error("Localização necessária.");

  // 1) Códigos administrativos de PRODUÇÃO. Se o utilizador os escolheu da lista
  //    real (LocationScreen com sessão), já vêm no rascunho; senão, resolve por nome.
  const d = draft.division;
  const l1: Div | null = d.level1Code
    ? { code: d.level1Code, name: d.province ?? "" }
    : await resolveDivision(country, 1, d.province);
  const l2: Div | null = d.level2Code
    ? { code: d.level2Code, name: d.municipio ?? "" }
    : l1 ? await resolveDivision(country, 2, d.municipio, l1.code) : null;
  const l3: Div | null = d.level3Code
    ? { code: d.level3Code, name: d.comuna ?? "" }
    : l2 ? await resolveDivision(country, 3, d.comuna, l2.code) : null;
  if (!l1 || !l2) {
    throw new Error("Escolha a província e o município na lista oficial antes de criar.");
  }

  const prov = shortCode(l1.code);
  const mun = shortCode(l2.code);
  const com = l3 ? shortCode(l3.code) : mun;
  const isDigital = draft.type !== "formal";
  const nbh = isDigital ? "DIG" : com;

  // 2) Código AFROLOC pela mesma edge function de produção.
  const { data: qg, error: qgErr } = await supabase.functions.invoke("qg-engine", {
    body: {
      action: "encode",
      latitude: lat,
      longitude: lon,
      countryCode: country,
      provinceCode: prov,
      municipalityCode: mun,
      communeCode: com,
      neighborhoodCode: nbh,
      registrationType: isDigital ? "digital" : "formal",
      cellType: "auto",
    },
  });
  if (qgErr) throw qgErr;
  const raw = (qg as { afroloc?: string })?.afroloc;
  if (!raw) throw new Error("A geração do código AFROLOC não devolveu resultado.");

  // Nomenclatura CANÓNICA do ecossistema: mantém a grelha X/Y do codec protegido
  // (G10/G25 em diante) mas reconstrói o prefixo a partir das divisões OFICIAIS —
  // província (ex.: LDA) + MUNICÍPIO POR EXTENSO (ex.: BELAS) + comuna/GEN.
  // Alinha com a app original e com a Yamioo (matchAoAdmin), evitando "AO-LUA-…".
  const gridTail = (raw.match(/G[12]0-.*/) || [raw.split("-").slice(-2).join("-")])[0];
  const provSeg = canonSeg(l1.code.split("-").pop() || l1.name); // "LDA"
  const munSeg = canonSeg(l2.name || l2.code.split("-").pop());   // "BELAS" (por extenso)
  const baiSeg = l3 ? canonSeg(l3.name) : "GEN";                  // comuna por extenso, ou GEN
  const code = `${country}-${provSeg}-${munSeg}-${baiSeg}-${gridTail}`;

  // 3) Gravar o registo real (estado `draft`, como no app oficial).
  const { data: rec, error: insErr } = await supabase
    .from("afroloc_records")
    .insert({
      code,
      country,
      level1_code: l1.code,
      level1_name: l1.name,
      level2_code: l2.code,
      level2_name: l2.name,
      level3_code: l3?.code ?? null,
      level3_name: l3?.name ?? null,
      geo_lat: lat,
      geo_lon: lon,
      address_type: isDigital ? "digital" : "formal",
      property_type: draft.propertyType ?? "house",
      property_name: label,
      user_id: user.id,
      status: "draft",
      // Residente estrangeiro: a validade da AFROLOC acompanha a autorização de
      // residência — a próxima verificação cai quando a autorização expira.
      ...(draft.foreigner?.permitValidUntil
        ? { next_verification_due: draft.foreigner.permitValidUntil }
        : {}),
    })
    .select("*")
    .single();
  if (insErr) throw insErr;
  return rec as unknown as AfrolocRecord;
}
