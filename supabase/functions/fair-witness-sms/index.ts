import { handleInboundSms } from "../_shared/fair-witness-sms.ts";
Deno.serve((request: Request) => handleInboundSms(request, Deno.env));
