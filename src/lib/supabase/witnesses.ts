// Testemunhas REAIS de uma morada, no backend de produção do AFROLOC (ljcx),
// tabela `afroloc_witnesses`. Replica o fluxo oficial (afroc_app26 · AddWitness):
// valida a AFROLOC do vizinho, cria o registo de testemunha (pendente) e pede o
// OTP de confirmação pela edge function `send-witness-otp`.
import { supabase } from "./client";

export interface WitnessRow {
  id: string;
  witness_afro_id: string;
  status: string;
}

/** Testemunhas reais de uma morada (por afroloc_record_id). */
export async function listWitnesses(recordId: string): Promise<WitnessRow[]> {
  const { data, error } = await supabase
    .from("afroloc_witnesses")
    .select("id,witness_afro_id,status")
    .eq("afroloc_record_id", recordId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as WitnessRow[];
}

export interface AddWitnessResult {
  ok: boolean;
  message: string;
}

/**
 * Adiciona uma testemunha real pela sua AFROLOC. Mesmas verificações do app
 * oficial: existe, está verificada/certificada, não é o próprio, não é duplicada.
 */
export async function addWitnessByCode(recordId: string, code: string): Promise<AddWitnessResult> {
  const c = code.trim().toUpperCase();
  if (c.length < 8) return { ok: false, message: "Introduza o código AFROLOC completo do vizinho." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sessão necessária." };

  // 1) A AFROLOC da testemunha existe e está ativa (verificada/certificada).
  const { data: wr } = await supabase
    .from("afroloc_records")
    .select("user_id,status,id")
    .eq("code", c)
    .maybeSingle();
  if (!wr) return { ok: false, message: "Essa AFROLOC não existe." };
  if (wr.status !== "verified" && wr.status !== "certified") {
    return { ok: false, message: "A AFROLOC da testemunha ainda não está verificada/certificada." };
  }
  if (wr.user_id === user.id) return { ok: false, message: "Não pode ser testemunha de si próprio." };

  // 2) Já foi adicionada?
  const { data: dup } = await supabase
    .from("afroloc_witnesses")
    .select("id")
    .eq("afroloc_record_id", recordId)
    .eq("witness_afro_id", c)
    .maybeSingle();
  if (dup) return { ok: false, message: "Essa testemunha já foi adicionada." };

  // 3) Cria o registo de testemunha (pendente).
  const { data: nw, error } = await supabase
    .from("afroloc_witnesses")
    .insert({ afroloc_record_id: recordId, witness_afro_id: c, witness_user_id: wr.user_id, status: "pending" })
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };

  // 4) Pede o OTP de confirmação ao vizinho (pode não chegar se o canal não
  //    estiver configurado — a testemunha fica na mesma criada, por confirmar).
  const { data: rec } = await supabase.from("afroloc_records").select("code").eq("id", recordId).maybeSingle();
  const { error: otpErr } = await supabase.functions.invoke("send-witness-otp", {
    body: { witness_id: nw.id, witness_user_id: wr.user_id, afroloc_code: (rec as { code?: string })?.code },
  });
  return {
    ok: true,
    message: otpErr
      ? "Testemunha adicionada — mas o código de confirmação pode não ter sido entregue."
      : "Testemunha adicionada. Foi enviado um código para o vizinho confirmar.",
  };
}
