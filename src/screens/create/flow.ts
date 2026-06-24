import type { AddressType } from "../../state/types";

/**
 * Idiomatic create-address step order, branching by address type:
 *  - informal → landmark step; formal → building step; digital skips both.
 * Mirrors the handoff flow array but routes to the steps that apply.
 */
export function nextStep(current: string, type: AddressType): string {
  switch (current) {
    case "type":
      return "location";
    case "location":
      return "qgsq";
    case "qgsq":
      // All address types now register the occupancy / landlord link.
      return "tenancy";
    case "tenancy":
      if (type === "informal") return "informal";
      if (type === "formal") return "building";
      return "witnesses"; // digital
    case "building":
      return "witnesses";
    case "informal":
      return "witnesses";
    case "witnesses":
      return "detail";
    default:
      return "detail";
  }
}
