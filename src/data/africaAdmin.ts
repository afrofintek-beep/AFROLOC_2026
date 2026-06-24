// Typed accessor over the continental reference data (54 countries, 834
// level-1 admin units, per-country nomenclature + languages). Seed the
// country/division pickers from this — see README "Reference data".
import raw from "./africa-admin.json";

export interface AdminUnit {
  nome: string;
  nome_norm: string;
  codigo: string;
}

export interface Country {
  iso: string;
  pais: string;
  flag: string;
  capital: string;
  /** Level-1 division nomenclature, e.g. "província", "wilaya", "departamento". */
  nivel1_tipo: string;
  linguas_oficiais: string[];
  linguas_faladas?: string[];
  nivel1: AdminUnit[];
}

export interface AfricaAdmin {
  meta: {
    fonte: string;
    aviso: string;
    n_paises: number;
    n_unidades_nivel1: number;
    n_bairros_piloto: number;
  };
  paises: Country[];
}

export const africaAdmin = raw as unknown as AfricaAdmin;

export const COUNTRIES: Country[] = africaAdmin.paises;

export function countryByIso(iso: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso === iso);
}

/** Total level-1 units across the continent (for coverage stats). */
export function totalLevel1(): number {
  return COUNTRIES.reduce((sum, c) => sum + c.nivel1.length, 0);
}
