// Mapeamento entre as linhas da base de dados (AddressRow) e os modelos de UI
// usados pelos ecrãs (PrimaryAddress, AddressSummary), e do resultado da
// pipeline de criação (CreateAddressResult + rascunho) para AddressInsert.
import type { AddressRow, AddressInsert, AtsFactorJson } from "../supabase/types";
import type { PrimaryAddress } from "../../data/account";
import type { AddressSummary, AddressStatus } from "../../data/addresses";
import type { CreateAddressResult } from "./createAddress";
import type { AddressDraft } from "../../state/types";
import { CERT_LABEL } from "./ats";

function daysBetween(iso: string, now = Date.now()): number {
  return Math.round((now - new Date(iso).getTime()) / 86_400_000);
}
function fmtDate(iso: string): string {
  const M = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const d = new Date(iso);
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
}
function placeOf(locationLine: string | null): string {
  return locationLine ? locationLine.split("·")[0].trim() : "—";
}

/** Linha da BD → modelo do cartão principal (Início / Detalhe). */
export function rowToPrimary(row: AddressRow): PrimaryAddress {
  const verifiedDaysAgo = row.verified_at ? daysBetween(row.verified_at) : 0;
  const nextVerifyDays = row.next_verify_at
    ? Math.max(0, -daysBetween(row.next_verify_at))
    : row.cycle_months * 30;
  return {
    label: row.label,
    code: row.code,
    countryChip: row.country_code,
    addressLine: row.address_line ?? row.location_line ?? "—",
    locationLine: row.location_line ?? "—",
    status: row.status,
    verifiedDaysAgo,
    nextVerifyDays,
    nextVerifyDate: row.next_verify_at ? fmtDate(row.next_verify_at) : "—",
    cycleMonths: row.cycle_months,
    ats: row.ats,
    atsLabel: row.ats_label ?? "—",
    validator: row.validator ?? "Aguarda validação",
    qgsqCell: row.qgsq_cell ?? "—",
    issued: fmtDate(row.issued_at ?? row.created_at),
    factors: (row.ats_factors ?? []).map((f) => ({ label: f.label, value: f.value, tone: f.tone })),
  };
}

/** Linha da BD → cartão da lista "As minhas moradas". */
export function rowToSummary(row: AddressRow): AddressSummary {
  return {
    id: row.id,
    name: row.label,
    place: placeOf(row.location_line),
    code: row.status === "RASCUNHO" ? null : row.code,
    status: row.status,
    ats: row.status === "RASCUNHO" ? null : row.ats,
    note:
      row.status === "ACTIVO"
        ? `verif. em ${row.next_verify_at ? Math.max(0, -daysBetween(row.next_verify_at)) : row.cycle_months * 30} d`
        : row.status === "PENDENTE"
          ? "A aguardar validação"
          : "Rascunho por concluir",
    lat: row.latitude ?? 0,
    lng: row.longitude ?? 0,
  };
}

/** Resultado da pipeline + rascunho → linha a inserir na BD. */
export function generatedToInsert(
  result: CreateAddressResult,
  draft: AddressDraft,
  ownerId: string,
  label = "Casa"
): AddressInsert {
  const d = draft.division;
  const locationLine = [d.municipio ?? d.comuna, d.province, d.countryName].filter(Boolean).join(" · ");
  const factors: AtsFactorJson[] = (result.ats?.factors ?? []).map((f) => ({
    label: f.label,
    value: f.weight ? Math.round((f.value / f.weight) * 100) : f.value,
    tone: f.weight && f.value / f.weight >= 0.7 ? "green" : "gold",
  }));
  return {
    owner_id: ownerId,
    label,
    code: result.afrolocCode!,
    country_code: d.countryIso,
    qgsq_cell: draft.cell.code,
    nomenclature_code: result.nomenclatureCode ?? null,
    sq_code: result.sqCode ?? null,
    subdivision_type: result.subdivisionType ?? null,
    cell_type: result.cellType ?? null,
    grid_m: result.gridM ?? null,
    sequence: result.sequence ?? null,
    address_line: draft.arrivalDescription?.slice(0, 120) ?? locationLine,
    location_line: locationLine,
    latitude: draft.coords.lat,
    longitude: draft.coords.lng,
    accuracy: draft.coords.accuracy,
    status: "PENDENTE" as AddressStatus, // acabou de ser enviada para validação
    ats: result.ats?.total ?? 0,
    ats_label: result.ats ? CERT_LABEL[result.ats.certificationLevel] : null,
    ats_factors: factors,
    validator: null,
    cycle_months: 6,
    verified_at: null,
    next_verify_at: null,
    issued_at: null,
  };
}
