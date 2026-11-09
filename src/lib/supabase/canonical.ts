import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./client";

export interface CanonicalAddress {
  id: string; user_id: string; code: string; country: string; status: string;
  level1_code: string; level1_name: string; level2_code: string; level2_name: string;
  level3_code: string | null; level3_name: string | null; level4_name: string | null;
  street_name: string | null; number: string | null; unit: string | null;
  property_name: string | null; property_type: string | null; address_type: string | null;
  geo_lat: number | null; geo_lon: number | null; ats_score: number | null;
  certification_level: number | null; last_verified_at: string | null;
  next_verification_due: string | null; approved_at: string | null; created_at: string;
}
export interface Division { code: string; name: string; country_code: string; level: number; parent_code: string | null }
export interface Country { country_code: string; country_name: string }
export interface PublicAddress { code: string; provincia: string | null; municipio: string | null; status: string; ats_score: number | null; certification_level: number | null; last_verified_at: string | null }
export interface NewAddress {
  country: string; province: Division; municipality: Division; commune?: Division;
  latitude: number; longitude: number; name: string; neighbourhood: string;
  street: string; number: string; unit: string; propertyType: "house" | "apartment";
  type: "formal" | "informal"; occupancy: "owner" | "tenant";
}
const columns = "id,user_id,code,country,status,level1_code,level1_name,level2_code,level2_name,level3_code,level3_name,level4_name,street_name,number,unit,property_name,property_type,address_type,geo_lat,geo_lon,ats_score,certification_level,last_verified_at,next_verification_due,approved_at,created_at";
export const shortCode = (s: string) => s.split("-").filter(Boolean).pop()?.slice(0, 3).toUpperCase() || "";
export const statusLabel = (s: string) => ({ draft: "Rascunho", pending: "Pendente", pending_validation: "Em validação", approved: "Aprovado", verified: "Verificado", certified: "Certificado", rejected: "Recusado" })[s] || s;
export const placeLabel = (a: CanonicalAddress) => [a.level4_name, a.level3_name, a.level2_name, a.level1_name].filter(Boolean).join(" · ");
export const errorText = (e: unknown) => e && typeof e === "object" && "message" in e ? String(e.message) : "Não foi possível concluir a operação. Tente novamente.";

/** Injectable client permits behavioural tests without writing fictitious records to production. */
export function canonicalApi(client: SupabaseClient) {
  async function owner() {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw new Error("Inicie sessão para continuar.");
    return data.user.id;
  }
  return {
    async list(): Promise<CanonicalAddress[]> {
      const uid = await owner();
      const { data, error } = await client.from("afroloc_records").select(columns).eq("user_id", uid).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async lookup(code: string): Promise<PublicAddress | null> {
      if (!code.trim()) throw new Error("Introduza um código AFROLOC.");
      const { data, error } = await client.rpc("afroloc_public_lookup", { p_code: code.trim().toUpperCase() });
      if (error) throw error;
      return data?.[0] || null;
    },
    async countries(): Promise<Country[]> {
      const { data, error } = await client.from("countries").select("country_code,country_name").eq("is_active", true).order("country_name");
      if (error) throw error;
      return data || [];
    },
    async divisions(country: string, level: number, parent?: string): Promise<Division[]> {
      let query = client.from("administrative_divisions").select("code,name,country_code,level,parent_code").eq("country_code", country).eq("level", level);
      if (parent) query = query.eq("parent_code", parent);
      const { data, error } = await query.order("name");
      if (error) throw error;
      return data || [];
    },
    async create(input: NewAddress): Promise<CanonicalAddress> {
      const uid = await owner();
      const { data: profile, error: profileError } = await client.from("profiles").select("approval_status").eq("user_id", uid).single();
      if (profileError || profile?.approval_status !== "approved") throw new Error("A conta precisa de aprovação antes de criar uma morada.");
      if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude) || Math.abs(input.latitude) > 90 || Math.abs(input.longitude) > 180) throw new Error("Indique coordenadas válidas.");
      if (input.country === "AO" && (input.latitude < -18 || input.latitude > -4.5 || input.longitude < 11.5 || input.longitude > 24.1)) throw new Error("As coordenadas indicadas estão fora dos limites de Angola.");
      // Verify selected administrative values against the authoritative catalogue.
      const p = (await this.divisions(input.country, 1)).find(d => d.code === input.province?.code);
      const m = p && (await this.divisions(input.country, 2, p.code)).find(d => d.code === input.municipality?.code);
      const c = input.commune && m ? (await this.divisions(input.country, 3, m.code)).find(d => d.code === input.commune?.code) : undefined;
      if (!p || !m || (input.commune && !c)) throw new Error("Selecione divisões administrativas válidas.");
      if (!input.name.trim()) throw new Error("Indique o nome da morada.");
      if (input.propertyType === "apartment" && !input.unit.trim()) throw new Error("Indique a fração/apartamento.");
      if (input.type === "formal" && (!input.street.trim() || !input.number.trim())) throw new Error("Indique a rua e o número para a morada formal.");
      const { data: encoded, error: encodeError } = await client.functions.invoke("qg-engine", { body: {
        action: "encode", latitude: input.latitude, longitude: input.longitude,
        countryCode: input.country, provinceCode: shortCode(p.code), municipalityCode: shortCode(m.code),
        communeCode: shortCode(c?.code || m.code),
        neighborhoodCode: input.type === "informal" ? "DIG" : (input.neighbourhood.trim().slice(0, 3).toUpperCase() || shortCode(c?.code || m.code)),
        registrationType: input.type === "informal" ? "digital" : "formal", cellType: "auto",
      } });
      if (encodeError) throw new Error("Não foi possível obter o código oficial. A morada não foi criada.");
      if (!encoded?.afroloc || encoded.error || encoded.afroloc.includes("LOCAL")) throw new Error("O serviço não devolveu um código oficial. A morada não foi criada.");
      const row = {
        code: encoded.afroloc, user_id: uid, country: input.country,
        level1_code: p.code, level1_name: p.name, level2_code: m.code, level2_name: m.name,
        level3_code: c?.code || null, level3_name: c?.name || null,
        level4_name: input.neighbourhood.trim() || null,
        level4_code: input.neighbourhood.trim().slice(0, 3).toUpperCase() || null,
        street_name: input.street.trim() || null, number: input.number.trim() || null,
        unit: input.unit.trim() || null, property_name: input.name.trim(), property_type: input.propertyType,
        address_type: input.type, geo_lat: input.latitude, geo_lon: input.longitude,
        status: "draft", metadata: { occupancy_title: input.occupancy },
      };
      const { data, error } = await client.from("afroloc_records").insert(row).select(columns).single();
      if (error) throw error;
      if (!data?.id) throw new Error("O registo não foi confirmado. Atualize a lista antes de tentar novamente.");
      return data;
    },
    async rename(id: string, name: string) {
      const uid = await owner();
      if (!name.trim()) throw new Error("Indique o nome da morada.");
      const { data, error } = await client.from("afroloc_records").update({ property_name: name.trim() }).eq("id", id).eq("user_id", uid).select(columns).single();
      if (error) throw error;
      return data as CanonicalAddress;
    },
  };
}
export const canonical = canonicalApi(supabase);
