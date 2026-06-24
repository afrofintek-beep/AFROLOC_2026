// The citizen's address book — seeded from the design (Casa / Escritório /
// Terreno). Shared by `addresses` and `identitiesMap`. Coordinates are real
// points around Luanda so the map plots them correctly.
import { primaryAddress } from "./account";

export type AddressStatus = "ACTIVO" | "PENDENTE" | "RASCUNHO";

export interface AddressSummary {
  id: string;
  name: string; // "Casa"
  place: string; // "Belas"
  code: string | null; // null while a draft
  status: AddressStatus;
  ats: number | null;
  note: string; // status line, e.g. "verif. em 124 d"
  lat: number;
  lng: number;
}

export const ADDRESSES: AddressSummary[] = [
  {
    id: "casa",
    name: "Casa",
    place: "Belas",
    code: primaryAddress.code,
    status: "ACTIVO",
    ats: primaryAddress.ats,
    note: `verif. em ${primaryAddress.nextVerifyDays} d`,
    lat: -8.899,
    lng: 13.205,
  },
  {
    id: "escritorio",
    name: "Escritório",
    place: "Luanda",
    code: "AO-LUA-LDA-MAI-CEN-G10-X6B14-Y49J3-0001",
    status: "PENDENTE",
    ats: 61,
    note: "A aguardar testemunhas",
    lat: -8.8383,
    lng: 13.2344,
  },
  {
    id: "terreno",
    name: "Terreno",
    place: "Catete",
    code: null,
    status: "RASCUNHO",
    ats: null,
    note: "Guardado offline",
    lat: -9.1069,
    lng: 13.6962,
  },
];

export const STATUS_COLOR: Record<AddressStatus, string> = {
  ACTIVO: "#2F7A57",
  PENDENTE: "#D4A853",
  RASCUNHO: "#A99E8C",
};
