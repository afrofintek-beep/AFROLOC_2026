// Domain types for the AFROLOC create-address flow.
import type { Tenancy } from "../data/tenancy";
import type { CreateAddressResult } from "../lib/afroloc/createAddress";

export type AddressType = "formal" | "informal" | "digital";

export interface Division {
  countryIso: string;
  countryName: string;
  /** Level-1 nomenclature for the chosen country, e.g. "província", "wilaya". */
  level1Type: string;
  province?: string; // level-1 unit name
  municipio?: string;
  comuna?: string;
}

export interface Coords {
  lat: number;
  lng: number;
  /** GPS accuracy in metres. */
  accuracy: number;
}

export interface QgsqCell {
  code: string; // real AFROLOC cell code (Web Mercator grid)
  sizeM: 10 | 25; // 10 m urban / 25 m rural (spec §4)
  zone: "urbana" | "rural";
}

export interface BuildingInfo {
  bloco: string;
  piso: string;
  fracao: string;
}

export interface Landmark {
  id: string;
  label: string;
}

export type WitnessStatus = "confirmed" | "awaiting" | "optional";

export interface Witness {
  id: string;
  name: string;
  afrolocCode: string;
  distanceM: number;
  status: WitnessStatus;
}

/** The in-progress address being created across the flow. */
export interface AddressDraft {
  type: AddressType;
  division: Division;
  coords: Coords;
  cell: QgsqCell;
  building?: BuildingInfo;
  noNumber: boolean;
  arrivalDescription: string;
  landmarks: Landmark[];
  hasEntryPhoto: boolean;
  witnesses: Witness[];
  /** Occupancy / landlord–tenant link (nationals and foreigners alike). */
  tenancy: Tenancy;
  /** Result of the AFROLOC creation pipeline (set on submission). */
  generated?: CreateAddressResult;
}

/** Witnesses required by address type (formal = 2, informal = 3). */
export function requiredWitnesses(type: AddressType): number {
  return type === "informal" ? 3 : 2;
}

/** Verification cycle in months (complete = 6, incomplete/informal = 3). */
export function verificationCycleMonths(type: AddressType): number {
  return type === "formal" ? 6 : 3;
}
