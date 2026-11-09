type Env = { get(name: string): string | undefined };
// The sender number was verified in the user's console. Account identifiers stay in server configuration.
export const TWILIO_NUMBER = '+19843145245';
export const TEST_PHONE = '+244923828282';
const sidPattern = /^SM[a-f0-9]{32}$/i;
export const twilioAccount = (env: Env) => env.get('FAIR_TWILIO_ACCOUNT_SID') || '';
export const twilioNumber = (env: Env) => env.get('FAIR_TWILIO_NUMBER') || TWILIO_NUMBER;
export const twilioToken = (env: Env) => env.get('FAIR_TWILIO_AUTH_TOKEN');
export const twilioConfigured = (env: Env) => /^AC[a-f0-9]{32}$/i.test(twilioAccount(env)) && /^\+[1-9][0-9]{7,14}$/.test(twilioNumber(env)) && !!twilioToken(env);
const reject = (stage: string) => { console.warn(JSON.stringify({event:'afroloc_twilio_rejected',stage})); return xml(undefined,403); };
const xml = (message?: string, status = 200) => new Response('<?xml version="1.0" encoding="UTF-8"?><Response>' + (message ? '<Message>' + message.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!)) + '</Message>' : '') + '</Response>', {status, headers:{'Content-Type':'text/xml; charset=utf-8','Cache-Control':'no-store'}});
export async function validTwilioSignature(url: string, form: URLSearchParams, signature: string, token: string) {
  const keys = [...new Set(form.keys())].sort();
  let data = url;
  for (const key of keys) for (const value of [...new Set(form.getAll(key))].sort()) data += key + value;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw',encoder.encode(token),{name:'HMAC',hash:'SHA-1'},false,['sign']);
  const signed = new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(data)));
  const expected = btoa(String.fromCharCode(...signed));
  let mismatch = expected.length ^ signature.length;
  for(let i=0;i<expected.length;i++) mismatch |= expected.charCodeAt(i) ^ (signature.charCodeAt(i)||0);
  return mismatch === 0;
}
export async function sendTwilioSms(env: Env, to: string, text: string, transport: typeof fetch) {
  const account = twilioAccount(env);
  const response = await transport(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`, {
    method:'POST',headers:{Authorization:'Basic '+btoa(account+':'+twilioToken(env)),'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({To:to,From:twilioNumber(env),Body:text}).toString(),signal:AbortSignal.timeout(15000)
  });
  const data = await response.json().catch(()=>null);
  return {accepted:response.ok && sidPattern.test(data?.sid || '') && ['accepted','queued','sending','sent','delivered'].includes(data?.status),messageId:sidPattern.test(data?.sid||'')?data.sid:null};
}
export async function handleTwilioWitness(req: Request, env: Env, transport: typeof fetch = fetch) {
  const configured = twilioConfigured(env);
  if(req.method==='GET') return Response.json({configured,witness_workflow_enabled:configured&&env.get('FAIR_SMS_INBOUND_READY')==='true'}, {status:configured?200:503,headers:{'Cache-Control':'no-store'}});
  if(req.method!=='POST') return xml(undefined,405);
  if(!configured || !env.get('SUPABASE_URL')) return xml(undefined,503);
  if(!req.headers.get('Content-Type')?.toLowerCase().startsWith('application/x-www-form-urlencoded')) return xml(undefined,415);
  // Pin the public callback URL; never use untrusted Host/Forwarded headers.
  const publicUrl = env.get('SUPABASE_URL')!.replace(/\/$/,'')+'/functions/v1/fair-witness-twilio';
  if(new URL(req.url).search) return xml(undefined,400);
  const raw = await req.text(); if(raw.length>20000)return xml(undefined,413);
  const form = new URLSearchParams(raw);
  if(!await validTwilioSignature(publicUrl,form,req.headers.get('X-Twilio-Signature')||'',twilioToken(env)!))return reject('signature');
  for(const key of ['AccountSid','MessageSid','From','To','Body']) if(form.getAll(key).length!==1)return xml(undefined,400);
  const account=twilioAccount(env), sid=form.get('MessageSid')!,from=form.get('From')!,to=form.get('To')!,body=form.get('Body')!;
  if(form.get('AccountSid')!==account || to!==twilioNumber(env) || !/^\+[1-9][0-9]{7,14}$/.test(from) || !sidPattern.test(sid))return reject('envelope');
  try {
    // Retrieve provider evidence for the original receipt time (webhook has no timestamp).
    const receipt = await transport(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages/${sid}.json`,{headers:{Authorization:'Basic '+btoa(account+':'+twilioToken(env))},signal:AbortSignal.timeout(10000)});
    if(!receipt.ok)return xml(undefined,503);
    const actual=await receipt.json();const received=new Date(actual.date_created);
    if(actual.sid!==sid || actual.account_sid!==account || actual.direction!=='inbound' || actual.from!==from || actual.to!==to || actual.body!==body || !['received','receiving'].includes(actual.status) || !Number.isFinite(received.getTime()))return reject('provider_evidence');
    const age=Date.now()-received.getTime();if(age < -300000 || age>48*3600000)return xml();
    if(body.trim().toUpperCase()==='TESTE-RETORNO' && from===TEST_PHONE) {
      console.info(JSON.stringify({event:'afroloc_twilio_return_test',message_sid:sid,received_at:received.toISOString(),test_only:true}));
      return xml('AFROLOC: TESTE-RETORNO recebido pelo nosso servico. Este teste nao valida moradas nem testemunhos.');
    }
    const match=body.trim().match(/^(ACEITO|RECUSO)\s+([A-F0-9]{16})$/i);
    if(!match)return xml();
    if(env.get('FAIR_SMS_INBOUND_READY')!=='true')return xml(undefined,503);
    const base=env.get('SUPABASE_URL'),secret=env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!base || !secret)return xml(undefined,503);
    const result=await transport(base+'/rest/v1/rpc/fair_witness_process',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({p_actor:null,p_action:'sms_receipt',p_payload:{from,to,reference:match[2].toUpperCase(),decision:match[1].toUpperCase()==='ACEITO'?'accept':'refuse',message_id:sid,received_at:received.toISOString()}}),signal:AbortSignal.timeout(10000)});
    if(!result.ok)return xml(undefined,503);
    const outcome=await result.json();
    // Provider retries must not send duplicate acknowledgements.
    if(outcome.duplicate || !outcome.ok)return xml();
    return xml(match[1].toUpperCase()==='ACEITO'?'AFROLOC: aceitacao recebida. Aguarda conferencia e decisao do validador oficial.':'AFROLOC: recusa registada.');
  } catch {return xml(undefined,503);}
}
