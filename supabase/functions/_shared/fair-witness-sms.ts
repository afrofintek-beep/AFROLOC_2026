import type { Env } from "./witness-confirmation.ts";
export const normalizePhone = (value: unknown): string | null => {
  if (typeof value !== "string" || value.length > 30 || !/^[+0-9 ()-]+$/.test(value)) return null;
  let digits = value.replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return /^[1-9][0-9]{7,14}$/.test(digits) ? "+" + digits : null;
};
export const smsReady = (env: Env) => env.get("FAIR_SMS_INBOUND_READY") === "true" && !!normalizePhone(env.get("FAIR_SMS_NUMBER")) && !!env.get("INFOBIP_INBOUND_USER") && !!env.get("INFOBIP_INBOUND_PASS") && !!env.get("INFOBIP_API_KEY") && !!env.get("INFOBIP_BASE_URL");
export async function witnessRpc(env: Env, actor: string | null, action: string, payload: unknown, transport: typeof fetch) {
  const base = env.get("SUPABASE_URL"), secret = env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !secret) throw new Error("Serviço indisponível.");
  const r = await transport(base + "/rest/v1/rpc/fair_witness_process", { method: "POST", headers: { apikey: secret, Authorization: "Bearer " + secret, "Content-Type": "application/json" }, body: JSON.stringify({ p_actor: actor, p_action: action, p_payload: payload }), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error("Não foi possível guardar o pedido. Atualize o estado antes de repetir.");
  return r.json();
}
const uuid = (x: unknown) => typeof x === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
export async function dispatchWitness(p: Record<string, unknown>, actor: string, env: Env, transport: typeof fetch) {
  const action = String(p.action);
  if (action === "list") return { ...await witnessRpc(env, actor, "list", {}, transport), workflow_version: 3, sms_ready: smsReady(env) };
  if (action === "witness_identify") {
    const phone = normalizePhone(p.phone);
    if (!uuid(p.record_id) || typeof p.full_name !== "string" || p.full_name.trim().length < 3 || p.full_name.length > 160 || !phone?.startsWith("+244") || typeof p.code !== "string" || p.code.length > 100 || p.consent !== true) return { ok: false, error: "Indique nome completo, telefone angolano e AFROLOC da testemunha." };
    return witnessRpc(env, actor, "identify", { record_id: p.record_id, full_name: p.full_name, phone, code: p.code, consent: true }, transport);
  }
  if (!uuid(p.witness_id)) return { ok: false, error: "Pedido inválido." };
  if (action === "witness_info") return witnessRpc(env, actor, "info", { witness_id: p.witness_id }, transport);
  if (action === "witness_decide") return witnessRpc(env, actor, "decide", { witness_id: p.witness_id, decision: p.decision, notes: p.notes, consent: p.consent, identity_checked: p.identity_checked }, transport);
  if (action !== "witness_send") return { ok: false, error: "Operação desconhecida." };
  if (!smsReady(env)) return { ok: false, error: "A identificação está registada. O envio aguarda um número institucional com receção de SMS configurada e testada." };
  let url: URL;
  try { url = new URL(env.get("INFOBIP_BASE_URL")!); } catch { return { ok: false, error: "Configuração do fornecedor indisponível." }; }
  if (url.protocol !== "https:" || !url.hostname.endsWith(".api.infobip.com")) return { ok: false, error: "Configuração do fornecedor inválida." };
  const prepared = await witnessRpc(env, actor, "prepare_sms", { witness_id: p.witness_id, reply_to: normalizePhone(env.get("FAIR_SMS_NUMBER")) }, transport);
  if (!prepared.ok) return prepared;
  let accepted = false, messageId: string | null = null;
  try {
    // A named requester, an exact target and an explicit declaration, not just consent to receive SMS.
    const requesterName = String(prepared.requester_name || "O titular").replace(/\s+/g, " ").slice(0, 160);
    const text = `AFROLOC: ${requesterName} pede que confirme que o conhece e que reside em ${prepared.target_code}. Se confirma, envie ACEITO ${prepared.reference} para ${prepared.reply_to}. Caso contrario, envie RECUSO ${prepared.reference}. Prazo: 48h. Sujeito a revisao do validador.`;
    const r = await transport(url.origin + "/sms/2/text/advanced", { method: "POST", headers: { Authorization: "App " + env.get("INFOBIP_API_KEY"), "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ messages: [{ from: env.get("INFOBIP_SENDER") || "AFROLOC", destinations: [{ to: prepared.phone.slice(1) }], text }] }), signal: AbortSignal.timeout(15000) });
    const data = await r.json().catch(() => null); const message = data?.messages?.[0];
    accepted = r.ok && !!message?.messageId && [1, 3].includes(message.status?.groupId);
    messageId = message?.messageId || null;
  } catch { /* Timeout is not proof of failed delivery. The reference remains valid. */ }
  await witnessRpc(env, actor, "delivery", { witness_id: p.witness_id, send_token: prepared.send_token, accepted, message_id: messageId }, transport);
  return { ok: true, notification_sent: accepted, message: accepted ? "O fornecedor aceitou o envio. Aguarda-se a resposta da testemunha e depois a decisão do validador." : "O fornecedor não confirmou o envio. Consulte o estado antes de reenviar; aguarde pelo menos cinco minutos." };
}

/** Provider authentication is mandatory; no permissive mode when secrets are absent. */
export async function handleInboundSms(req: Request, env: Env, transport: typeof fetch = fetch): Promise<Response> {
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (req.method !== "POST") return reply({ error: "method_not_allowed" }, 405);
  const user = env.get("INFOBIP_INBOUND_USER"), password = env.get("INFOBIP_INBOUND_PASS"), recipient = normalizePhone(env.get("FAIR_SMS_NUMBER"));
  if (!user || !password || !recipient || env.get("FAIR_SMS_INBOUND_READY") !== "true") return reply({ error: "inbound_not_configured" }, 503);
  const actual = new TextEncoder().encode(req.headers.get("Authorization") || "");
  const expected = new TextEncoder().encode("Basic " + btoa(user + ":" + password));
  let mismatch = actual.length ^ expected.length;
  for (let i = 0; i < expected.length; i++) mismatch |= expected[i] ^ (actual[i] || 0);
  if (mismatch) return reply({ error: "unauthorized" }, 401);
  try {
    const raw = await req.text(); if (raw.length > 50000) return reply({ error: "payload_too_large" }, 413);
    const data = JSON.parse(raw);
    if (!Array.isArray(data.results) || data.results.length < 1 || data.results.length > 50) return reply({ error: "invalid_batch" }, 400);
    const results = [];
    for (const message of data.results) {
      const from = normalizePhone(message.from), to = normalizePhone(message.to);
      const match = typeof message.text === "string" && message.text.trim().match(/^(ACEITO|RECUSO)\s+([A-F0-9]{16})$/i);
      const date = typeof message.receivedAt === "string" ? new Date(message.receivedAt.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")) : null;
      if (!from || to !== recipient || !match || typeof message.messageId !== "string" || !message.messageId || message.messageId.length > 200 || !date || !Number.isFinite(date.getTime())) { results.push({ ok: false, reason: "invalid_message" }); continue; }
      const r = await witnessRpc(env, null, "sms_receipt", { from, to, reference: match[2].toUpperCase(), decision: match[1].toUpperCase() === "ACEITO" ? "accept" : "refuse", message_id: message.messageId, received_at: date.toISOString() }, transport);
      results.push({ ok: r.ok, duplicate: r.duplicate || false, reason: r.reason });
    }
    return reply({ ok: true, results });
  } catch { return reply({ error: "processing_unavailable" }, 503); }
}
