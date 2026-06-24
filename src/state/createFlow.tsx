import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type {
  AddressDraft,
  AddressType,
  BuildingInfo,
  Coords,
  Division,
  Landmark,
  QgsqCell,
  Witness,
} from "./types";
import type { Tenancy } from "../data/tenancy";
import type { CreateAddressResult } from "../lib/afroloc/createAddress";

// Initial draft mirrors the design mock (Belas, Luanda, Angola — cell AO-ZU-G10-X6AUQ-Y49HV).
const initialDraft: AddressDraft = {
  type: "informal",
  division: {
    countryIso: "AO",
    countryName: "Angola",
    level1Type: "província",
    province: "Luanda",
    municipio: "Belas",
    comuna: "Ramiros",
  },
  coords: { lat: -8.89912, lng: 13.20534, accuracy: 4 },
  cell: { code: "AO-ZU-G10-X6AUQ-Y49HV", sizeM: 10, zone: "urbana" },
  building: undefined,
  noNumber: true,
  arrivalDescription:
    "Junto ao depósito de água azul, terceira casa à direita depois da Igreja Sant'Ana.",
  landmarks: [
    { id: "lm1", label: "Igreja Sant'Ana" },
    { id: "lm2", label: "Depósito de água" },
  ],
  hasEntryPhoto: false,
  witnesses: [
    { id: "w1", name: "Tomás Munga", afrolocCode: "AO-LUA-BEL-FUT-GEN-G10-X6AZ9-Y49M4-0001", distanceM: 120, status: "confirmed" },
    { id: "w2", name: "Joana Pereira", afrolocCode: "AO-LUA-BEL-RAM-GEN-G10-X6AV5-Y49K1-0002", distanceM: 240, status: "awaiting" },
  ],
  tenancy: {
    occupancy: "inquilino",
    landlord: { name: "João Bunga", afroloc: "AO-LUA-BEL-FUT-GEN-G10-X6AZ9-Y49M4-0001", nif: "005467234LA041", confirmed: true },
    tenantNif: "004821907LA033",
    contractNumber: "ARR-2026-1184",
    start: "Fev 2026",
    end: "Fev 2027",
    monthlyRent: 180000,
    currency: "Kz",
    hasContractPdf: true,
  },
};

type Action =
  | { type: "setType"; value: AddressType }
  | { type: "setDivision"; value: Partial<Division> }
  | { type: "setCoords"; value: Partial<Coords> }
  | { type: "setCell"; value: Partial<QgsqCell> }
  | { type: "setBuilding"; value: BuildingInfo | undefined }
  | { type: "setNoNumber"; value: boolean }
  | { type: "setArrival"; value: string }
  | { type: "addLandmark"; value: Landmark }
  | { type: "removeLandmark"; id: string }
  | { type: "setEntryPhoto"; value: boolean }
  | { type: "addWitness"; value: Witness }
  | { type: "confirmWitness"; id: string }
  | { type: "removeWitness"; id: string }
  | { type: "setTenancy"; value: Partial<Tenancy> }
  | { type: "setGenerated"; value: CreateAddressResult };

function reducer(state: AddressDraft, action: Action): AddressDraft {
  switch (action.type) {
    case "setType":
      return { ...state, type: action.value };
    case "setDivision":
      return { ...state, division: { ...state.division, ...action.value } };
    case "setCoords":
      return { ...state, coords: { ...state.coords, ...action.value } };
    case "setCell":
      return { ...state, cell: { ...state.cell, ...action.value } };
    case "setBuilding":
      return { ...state, building: action.value };
    case "setNoNumber":
      return { ...state, noNumber: action.value };
    case "setArrival":
      return { ...state, arrivalDescription: action.value };
    case "addLandmark":
      return { ...state, landmarks: [...state.landmarks, action.value] };
    case "removeLandmark":
      return { ...state, landmarks: state.landmarks.filter((l) => l.id !== action.id) };
    case "setEntryPhoto":
      return { ...state, hasEntryPhoto: action.value };
    case "addWitness":
      return { ...state, witnesses: [...state.witnesses, action.value] };
    case "confirmWitness":
      return {
        ...state,
        witnesses: state.witnesses.map((w) =>
          w.id === action.id ? { ...w, status: "confirmed" } : w,
        ),
      };
    case "removeWitness":
      return { ...state, witnesses: state.witnesses.filter((w) => w.id !== action.id) };
    case "setTenancy":
      return { ...state, tenancy: { ...state.tenancy, ...action.value } };
    case "setGenerated":
      return { ...state, generated: action.value };
    default:
      return state;
  }
}

interface CreateFlowValue {
  draft: AddressDraft;
  dispatch: React.Dispatch<Action>;
}

const Ctx = createContext<CreateFlowValue | null>(null);

export function CreateFlowProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(reducer, initialDraft);
  const value = useMemo(() => ({ draft, dispatch }), [draft]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCreateFlow(): CreateFlowValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCreateFlow must be used within CreateFlowProvider");
  return v;
}
