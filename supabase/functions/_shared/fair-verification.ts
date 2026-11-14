import { handleWitness, type Env } from "./witness-confirmation.ts";
import { dispatchWitness } from "./fair-witness-sms.ts";
const origins = ["https://app.afroloc.ao", "https://natal.yamilook.com"];
const actions = [
  "list",
  "enroll",
  "inspect",
  "review",
  "certify",
  "condominium",
  "witness_identify", "witness_send", "witness_info", "witness_decide",
];
export async function handleFair(
  req: Request,
  env: Env,
  transport: typeof fetch = fetch,
): Promise<Response> {
  const origin = req.headers.get("Origin");
  const cors =
    origin && origins.includes(origin)
      ? {
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
          "Access-Control-Allow-Headers":
            "authorization,apikey,content-type,x-client-info",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        }
      : {};
  const reply = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { ...cors, "Cache-Control": "no-store" },
    });
  if (origin && !origins.includes(origin))
    return reply({ error: "Origem não autorizada." }, 403);
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")
    return reply({ error: "Método não permitido." }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 4000)
      return reply({ error: "Pedido demasiado grande." }, 400);
    let p;
    try {
      p = JSON.parse(raw);
    } catch {
      return reply({ error: "Pedido inválido." }, 400);
    }
    if (!p || typeof p !== "object")
      return reply({ error: "Pedido inválido." }, 400);
    if (["request", "send", "info", "verify"].includes(p.action)) {
      return handleWitness(
        new Request(req.url, {
          method: "POST",
          headers: req.headers,
          body: raw,
        }),
        {
          get: (key) =>
            key === "WITNESS_CONFIRMATION_BASE"
              ? "https://app.afroloc.ao/?witness="
              : env.get(key),
        },
        transport,
      );
    }
    if (!actions.includes(p.action))
      return reply({ error: "Operação desconhecida." }, 400);
    const bearer = req.headers.get("Authorization") || "";
    if (!/^Bearer [^\s]+$/.test(bearer) || bearer.length > 8100)
      return reply({ error: "Entre na sua conta AFROLOC." }, 401);
    const base = env.get("SUPABASE_URL"),
      anon = env.get("SUPABASE_ANON_KEY"),
      service = env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!base || !anon || !service)
      return reply({ error: "Serviço indisponível." }, 503);
    const auth = await transport(base + "/auth/v1/user", {
      headers: { apikey: anon, Authorization: bearer },
      signal: AbortSignal.timeout(10000),
    });
    if (!auth.ok)
      return reply({ error: "Volte a entrar na sua conta AFROLOC." }, 401);
    const user = await auth.json();
    if (!user.id || user.is_anonymous)
      return reply({ error: "É necessária uma conta identificada." }, 401);
    if (
      user.factors?.some((f: { status: string }) => f.status === "verified")
    ) {
      let claims;
      try {
        claims = JSON.parse(
          atob(
            bearer.slice(7).split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
          ),
        );
      } catch {}
      if (claims?.aal !== "aal2")
        return reply(
          { error: "Conclua a autenticação adicional na sua conta AFROLOC." },
          403,
        );
    }
    if (p.action === "list" || p.action.startsWith("witness_")) {
      const data = await dispatchWitness(p, user.id, env, transport);
      return reply(data, data.ok ? 200 : 400);
    }
    const result = await transport(base + "/rest/v1/rpc/fair_verification", {
      method: "POST",
      headers: {
        apikey: service,
        Authorization: "Bearer " + service,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_actor: user.id,
        p_action: p.action,
        p_payload: p,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!result.ok)
      return reply(
        {
          error:
            "Não foi possível guardar ou consultar o processo. Verifique os dados e tente novamente.",
        },
        400,
      );
    const data = await result.json();
    return reply(data, data.ok ? 200 : 400);
  } catch {
    return reply(
      {
        error:
          "O serviço não respondeu. Atualize o estado antes de repetir a operação.",
      },
      502,
    );
  }
}
