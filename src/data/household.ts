// Household / census model — residents living at the primary AFROLOC.
// Seeded from the design (4/15 members, typology T3, recenseado 2026).

export type Relationship = "titular" | "conjuge" | "filho" | "progenitor" | "irmao" | "outro";

export interface Member {
  id: string;
  name: string;
  initials: string;
  age: number;
  relationship: Relationship;
  /** Short qualifier shown on the row (e.g. "residência primária", "menor"). */
  tag: string;
  primary?: boolean;
  hasOwnAfroloc?: boolean;
  minor?: boolean;
}

export const HOUSEHOLD_MAX = 15;

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  titular: "Titular",
  conjuge: "Cônjuge",
  filho: "Filho(a)",
  progenitor: "Progenitor",
  irmao: "Irmão(ã)",
  outro: "Outro",
};

export const householdMeta = {
  code: "AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001",
  holder: "Ana Cardoso",
  place: "Casa, Belas",
  typology: "T3",
  censusYear: 2026,
  occupancy: "Ocupação adequada",
};

export const members: Member[] = [
  { id: "m1", name: "Ana Cardoso", initials: "AC", age: 41, relationship: "titular", tag: "residência primária", primary: true },
  { id: "m2", name: "Tomás Cardoso", initials: "TC", age: 19, relationship: "filho", tag: "AFROLOC própria", hasOwnAfroloc: true },
  { id: "m3", name: "Lúcia Cardoso", initials: "LC", age: 12, relationship: "filho", tag: "menor", minor: true },
  { id: "m4", name: "Pedro Cardoso", initials: "PC", age: 8, relationship: "filho", tag: "menor", minor: true },
];
