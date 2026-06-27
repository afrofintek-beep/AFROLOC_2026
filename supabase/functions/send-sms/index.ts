// AFROLOC — Supabase "Send SMS" Auth Hook.
//
// Camada de SMS própria e ROTEÁVEL (visão panafricana): o Supabase chama esta
// função com (número, código OTP) e nós decidimos, POR PAÍS, qual o fornecedor.
// Hoje todos os países vão por Infobip; para acrescentar um gateway local/
// africano basta somar uma entrada em `providerFor` e a função de envio — sem
// tocar na app.
//
// Deploy:  supabase functions deploy send-sms --no-verify-jwt --project-ref <ref>
// Secrets: SEND_SMS_HOOK_SECRET, INFOBIP_BASE_URL, INFOBIP_API_KEY, INFOBIP_SENDER
// Ver supabase/functions/send-sms/README.md
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const HOOK_SECRET = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace("v1,whsec_", "");
const INFOBIP_BASE_URL = Deno.env.get("INFOBIP_BASE_URL") ?? "";
const INFOBIP_API_KEY = Deno.env.get("INFOBIP_API_KEY") ?? "";
const INFOBIP_SENDER = Deno.env.get("INFOBIP_SENDER") ?? "AFROLOC";

type Provider = "infobip"; // futuros: "termii" | "clickatell" | "africastalking" | "local-XX"

/**
 * Roteamento panafricano por código de país (E.164).
 * Hoje tudo → Infobip. Exemplos de expansão (descomenta e implementa o sender):
 *   if (e164.startsWith("+234")) return "termii";        // Nigéria 🇳🇬
 *   if (e164.startsWith("+27"))  return "clickatell";     // África do Sul 🇿🇦
 *   if (e164.startsWith("+254")) return "africastalking"; // Quénia 🇰🇪
 */
function providerFor(_e164: string): Provider {
  return "infobip";
}

async function sendViaInfobip(toE164: string, text: string): Promise<void> {
  const to = toE164.replace(/^\+/, ""); // Infobip aceita sem o "+"
  const res = await fetch(`${INFOBIP_BASE_URL.replace(/\/$/, "")}/sms/2/text/advanced`, {
    method: "POST",
    headers: {
      Authorization: `App ${INFOBIP_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      messages: [{ destinations: [{ to }], from: INFOBIP_SENDER, text }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Infobip ${res.status}: ${await res.text()}`);
  }
}

function messageFor(otp: string): string {
  // PT por agora; multilíngue por país é um passo futuro (alinha com o roteamento).
  return `AFROLOC: o seu código é ${otp}. Válido por 10 minutos. Não o partilhe com ninguém.`;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    // Verifica a assinatura do webhook (segurança — só o Supabase pode chamar).
    const wh = new Webhook(HOOK_SECRET);
    const { user, sms } = wh.verify(payload, headers) as {
      user: { phone: string };
      sms: { otp: string };
    };

    const e164 = user.phone.startsWith("+") ? user.phone : `+${user.phone}`;
    const text = messageFor(sms.otp);

    switch (providerFor(e164)) {
      case "infobip":
        await sendViaInfobip(e164, text);
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-sms] erro:", err);
    return new Response(
      JSON.stringify({ error: { message: err instanceof Error ? err.message : String(err) } }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
