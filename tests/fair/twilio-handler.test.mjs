import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {handleTwilioWitness,TWILIO_NUMBER,TEST_PHONE,validTwilioSignature} from '../../supabase/functions/_shared/twilio-witness.ts';
import {dispatchWitness,smsReady} from '../../supabase/functions/_shared/fair-witness-sms.ts';
const TWILIO_ACCOUNT='AC'+'1'.repeat(32); // Synthetic, isolated account ID.
const url='https://test.supabase.co/functions/v1/fair-witness-twilio',sid='SM'+'a'.repeat(32),token='isolated-test-token';
const values={FAIR_TWILIO_ACCOUNT_SID:TWILIO_ACCOUNT,SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-only',FAIR_TWILIO_AUTH_TOKEN:token,FAIR_SMS_INBOUND_READY:'true'};
const env={get:k=>values[k]};
const base={AccountSid:TWILIO_ACCOUNT,MessageSid:sid,From:TEST_PHONE,To:TWILIO_NUMBER,Body:'ACEITO 0123456789ABCDEF'};
const signed=(fields=base,secret=token,target=url)=>{const form=new URLSearchParams(fields);const text=target+Object.keys(fields).sort().map(k=>k+fields[k]).join('');return new Request(target,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-Twilio-Signature':createHmac('sha1',secret).update(text).digest('base64')},body:form.toString()})};
const record=(fields=base,extra={})=>({sid:fields.MessageSid,account_sid:fields.AccountSid,from:fields.From,to:fields.To,body:fields.Body,direction:'inbound',status:'received',date_created:new Date().toUTCString(),...extra});
const network=(fields=base,extra={},outcome={ok:true})=>{const calls=[];return {calls,fetch:async(u,init)=>{calls.push({url:u,init});return Response.json(u.includes('api.twilio.com')?record(fields,extra):outcome)}}};
test('validates official Twilio reference signature including all parameters',async()=>{
 const fields=new URLSearchParams({CallSid:'CA1234567890ABCDE',Caller:'+14158675310',Digits:'1234',From:'+14158675310',To:'+18005551212'});
 assert.equal(await validTwilioSignature('https://example.com/myapp.php?foo=1&bar=2',fields,'L/OH5YylLD5NRKLltdqwSvS0BnU=','12345'),true);
});
test('missing token and forged signatures fail closed without external calls',async()=>{
 let calls=0;const net=async()=>{calls++;throw Error('unexpected')};
 assert.equal((await handleTwilioWitness(signed(),{get:()=>undefined},net)).status,503);
 assert.equal((await handleTwilioWitness(signed(base,'forged'),env,net)).status,403);assert.equal(calls,0);
});
test('new provider fields are signed; tampering cannot reach the database',async()=>{
 const fields={...base,NewProviderField:'value'};const net=network(fields);
 assert.equal((await handleTwilioWitness(signed(fields),env,net.fetch)).status,200);
 const req=signed(fields);const changed=new Request(url,{method:'POST',headers:req.headers,body:new URLSearchParams({...fields,Body:'RECUSO 0123456789ABCDEF'})});
 assert.equal((await handleTwilioWitness(changed,env,net.fetch)).status,403);
});
test('wrong account, wrong recipient, outbound or mismatched provider evidence are rejected',async()=>{
 for(const fields of [{...base,AccountSid:'AC'+'b'.repeat(32)},{...base,To:'+244900000000'}])assert.equal((await handleTwilioWitness(signed(fields),env,network(fields).fetch)).status,403);
 for(const extra of [{direction:'outbound-api'},{from:'+244900000000'},{body:'Different'},{account_sid:'wrong'}])assert.equal((await handleTwilioWitness(signed(),env,network(base,extra).fetch)).status,403);
});
test('uses actual provider timestamp and private receipt RPC; never approves a witness',async()=>{
 const net=network();const r=await handleTwilioWitness(signed(),env,net.fetch);assert.equal(r.status,200);assert.match(await r.text(),/Aguarda conferencia/);
 const payload=JSON.parse(net.calls[1].init.body);assert.equal(payload.p_actor,null);assert.equal(payload.p_action,'sms_receipt');assert.equal(payload.p_payload.message_id,sid);assert.equal(payload.p_payload.decision,'accept');assert.equal(payload.p_payload.to,TWILIO_NUMBER);
 assert.match(net.calls[0].url,/api\.twilio\.com/);
});
test('disabled workflow and provider/database failures do not acknowledge acceptance',async()=>{
 const disabled={get:k=>k==='FAIR_SMS_INBOUND_READY'?'false':values[k]};assert.equal(smsReady(disabled),false);
 const net=network();assert.equal((await handleTwilioWitness(signed(),disabled,net.fetch)).status,503);assert.equal(net.calls.length,1);
 assert.equal((await handleTwilioWitness(signed(),env,async()=>Response.json({},{status:500}))).status,503);
 const dbFail=async(u)=>u.includes('api.twilio.com')?Response.json(record()):Response.json({},{status:500});assert.equal((await handleTwilioWitness(signed(),env,dbFail)).status,503);
});
test('test return is restricted to institutional phone and makes no witness writes',async()=>{
 const fields={...base,Body:'TESTE-RETORNO'},net=network(fields),disabled={get:k=>k==='FAIR_SMS_INBOUND_READY'?'false':values[k]};
 const r=await handleTwilioWitness(signed(fields),disabled,net.fetch);assert.match(await r.text(),/TESTE-RETORNO recebido/);assert.equal(net.calls.length,1);
 const other={...fields,From:'+244900000000'};assert.doesNotMatch(await(await handleTwilioWitness(signed(other),env,network(other).fetch)).text(),/<Message>/);
});
test('replayed duplicate and expired receipt do not send repeated acknowledgements',async()=>{
 const duplicate=network(base,{}, {ok:true,duplicate:true});assert.doesNotMatch(await(await handleTwilioWitness(signed(),env,duplicate.fetch)).text(),/<Message>/);
 const old=network(base,{date_created:new Date(Date.now()-49*3600000).toUTCString()});assert.equal((await handleTwilioWitness(signed(),env,old.fetch)).status,200);assert.equal(old.calls.length,1);
});
test('outbound Twilio submits to chosen number and records queued separately from consent',async()=>{
 const calls=[],wid='00000000-0000-0000-0000-000000000001';assert.equal(smsReady(env),true);
 const net=async(u,init)=>{calls.push({u,init});if(u.includes('api.twilio.com'))return Response.json({sid,status:'queued'},{status:201});const p=JSON.parse(init.body);return Response.json(p.p_action==='prepare_sms'?{ok:true,phone:TEST_PHONE,reply_to:TWILIO_NUMBER,reference:'0123456789ABCDEF',send_token:wid,target_code:'TEST-ONLY'}:{ok:true})};
 const r=await dispatchWitness({action:'witness_send',witness_id:wid},'owner',env,net);assert.equal(r.notification_sent,true);
 assert.equal(JSON.parse(calls[0].init.body).p_payload.reply_to,TWILIO_NUMBER);
 const form=new URLSearchParams(calls[1].init.body);assert.equal(form.get('From'),TWILIO_NUMBER);assert.equal(form.get('To'),TEST_PHONE);
 assert.deepEqual(calls.filter(c=>c.u.includes('/rpc/')).map(c=>JSON.parse(c.init.body).p_action),['prepare_sms','delivery']);
});
