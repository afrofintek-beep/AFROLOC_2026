// Build the QG nomenclature admin codes (PROV/MUN/COM/BAI) from a draft
// division. Province code comes from africa-admin.json; deeper levels are
// slugged from their names (the reference dataset only carries level-1 codes).
import { countryByIso } from "../../data/africaAdmin";
import type { Division } from "../../state/types";
import type { AdminCodes } from "./engines";

function slug3(name?: string): string | undefined {
  if (!name) return undefined;
  const letters = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
  return letters.slice(0, 3) || undefined;
}

export function adminCodesFor(division: Division): AdminCodes {
  const country = countryByIso(division.countryIso);
  const province = country?.nivel1.find((u) => u.nome === division.province);
  return {
    provinceCode: province?.codigo ?? slug3(division.province),
    municipalityCode: slug3(division.municipio),
    communeCode: slug3(division.comuna),
    neighborhoodCode: undefined,
  };
}
