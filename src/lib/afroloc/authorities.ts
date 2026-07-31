// Autoridade emissora do certificado, POR PAÍS — apresenta-se em função da
// distribuição administrativa e da língua de cada país (como na demo, mas
// generalizado). Prioritários modelados: AO, MZ, NG, CD, CV; os restantes 49
// usam um fallback genérico derivado de africa-admin.json (nível 1 + língua).
//
// ⚠️ Nomes de nível e designações de autoridade a VALIDAR com fonte oficial de
// cada país antes de produção (ver aviso em africa-admin.json). Angola é o
// modelo autoritativo.
import { countryByIso } from "../../data/africaAdmin";
import type { Division } from "../../state/types";

export interface AuthorityConfig {
  /** Nomenclatura dos níveis administrativos, do 1 ao N (para apresentação). */
  niveis: string[];
  /** Índice (0-based) do nível que EMITE o certificado. */
  emissorNivel: number;
  /** Template do nome da autoridade emissora ({nome} = nome desse nível). */
  template: string;
  /** Designação oficial do Estado (arco de topo do selo/carimbo). */
  estado: string;
}

// Division só tem 3 slots de nome; mapeiam-se aos níveis 1–3 por ordem.
const LEVEL_FIELDS: (keyof Division)[] = ["province", "municipio", "comuna"];

export const AUTHORITIES: Record<string, AuthorityConfig> = {
  AO: {
    niveis: ["província", "município", "comuna"],
    emissorNivel: 1,
    template: "Administração Municipal de {nome}",
    estado: "REPÚBLICA DE ANGOLA",
  },
  MZ: {
    niveis: ["província", "distrito", "posto administrativo"],
    emissorNivel: 1,
    template: "Administração do Distrito de {nome}",
    estado: "REPÚBLICA DE MOÇAMBIQUE",
  },
  NG: {
    niveis: ["state", "Local Government Area", "ward"],
    emissorNivel: 1,
    template: "{nome} Local Government Council",
    estado: "FEDERAL REPUBLIC OF NIGERIA",
  },
  CD: {
    niveis: ["province", "ville / territoire", "commune"],
    emissorNivel: 1,
    template: "Mairie de {nome}",
    estado: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO",
  },
  CV: {
    // Cabo Verde: o nível 1 já É o concelho (município).
    niveis: ["concelho", "freguesia"],
    emissorNivel: 0,
    template: "Câmara Municipal de {nome}",
    estado: "REPÚBLICA DE CABO VERDE",
  },
};

export interface AuthorityResult {
  /** Nome completo da autoridade, ex.: "Administração Municipal de Talatona". */
  autoridade: string;
  /** Nomenclatura do nível emissor, ex.: "município" / "Local Government Area". */
  nivelEmissor: string;
  /** Nomenclatura de todos os níveis (para mostrar a hierarquia do país). */
  niveis: string[];
  /** Designação do Estado (arco de topo do selo). */
  estado: string;
  /** true = país modelado; false = fallback genérico (a validar). */
  preciso: boolean;
}

function nomeNoNivel(division: Division, idx: number): string | undefined {
  const f = LEVEL_FIELDS[idx];
  return f ? (division[f] as string | undefined) : undefined;
}

// Países ainda não modelados: autoridade genérica na língua oficial + nível 1.
function fallback(division: Division): AuthorityResult {
  const c = countryByIso(division.countryIso);
  const langs = (c?.linguas_oficiais ?? []).join(" ").toLowerCase();
  const nome = division.comuna || division.municipio || division.province || (c?.nivel1_tipo ?? "");
  let template: string;
  if (langs.includes("inglês") || langs.includes("ingles")) template = "{nome} Local Authority";
  else if (langs.includes("francês") || langs.includes("frances")) template = "Autorité locale de {nome}";
  else template = "Administração local de {nome}";
  const nivel1 = c?.nivel1_tipo ?? "nível 1";
  return {
    autoridade: template.replace("{nome}", nome || "—"),
    nivelEmissor: nivel1,
    niveis: [nivel1],
    estado: (c?.pais ?? division.countryName ?? "").toUpperCase(),
    preciso: false,
  };
}

/** Autoridade emissora do certificado para uma morada, por país. */
export function resolveAuthority(division: Division): AuthorityResult {
  const cfg = AUTHORITIES[division.countryIso];
  if (!cfg) return fallback(division);
  // Sem o nível emissor preenchido não se pode nomear a autoridade certa
  // (ex.: AO só com província) → cai no genérico, mas mantém o selo do Estado.
  const nome = nomeNoNivel(division, cfg.emissorNivel);
  if (!nome) return { ...fallback(division), estado: cfg.estado, niveis: cfg.niveis };
  return {
    autoridade: cfg.template.replace("{nome}", nome),
    nivelEmissor: cfg.niveis[cfg.emissorNivel] ?? "",
    niveis: cfg.niveis,
    estado: cfg.estado,
    preciso: true,
  };
}
