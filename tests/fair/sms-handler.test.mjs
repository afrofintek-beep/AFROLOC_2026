import test from 'node:test';
import assert from 'node:assert/strict';
import { handleInboundSms, dispatchWitness, normalizePhone, smsReady } from '../../supabase/functions/_shared/fair-witness-sms.ts';
const values={SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-only',INFOBIP_INBOUND_USER:'test-provider',INFOBIP_INBOUND_PASS:'test-password',FAIR_SMS_NUMBER:'+244900999999',FAIR_SMS_INBOUND_READY:'true',INFOBIP_BASE_URL:'https://test.api.infobip.com',INFOBIP_API_KEY:'test-api-key'};
const env={get:k=>values[k]}; const auth='Basic '+btoa('test-provider:test-password');
const wid='00000000-0000-0000-0000-000000000001';
const message={from:'244900000002',to:'244900999999',text:'ACEITO 0123456789ABCDEF',messageId:'msg-1',receivedAt:'2026-11-09T14:00:00.000+0000'};
const request=(payload={results:[message]},authorization=auth)=>new Request('https://test/fair-witness-sms',{method:'POST',headers:{authorization},body:JSON.stringify(payload)});
test('phone normalization never uses suffix matching or guesses a country',()=>{ assert.equal(normalizePhone('+244 900 000 002'),'+244900000002'); assert.equal(normalizePhone('00244900000002'),'+244900000002'); assert.equal(normalizePhone('244900000002garbage'),null); });
test('inbound missing configuration and wrong provider auth fail before database access',async()=>{
 let calls=0;const net=async()=>{calls++;throw Error('unexpected');};
 assert.equal((await handleInboundSms(request(),{get:()=>undefined},net)).status,503);
 assert.equal((await handleInboundSms(request({},'Basic forged'),env,net)).status,401);assert.equal(calls,0);
 assert.equal((await handleInboundSms(new Request('https://test'),env,net)).status,405);
});
test('parses every batch entry, requires explicit reference, recipient and provider timestamp',async()=>{
 const calls=[];const net=async(url,init)=>{calls.push(JSON.parse(init.body));return Response.json({ok:true});};
 const r=await handleInboundSms(request({results:[message,{...message,messageId:'msg-2',text:'RECUSO 0123456789ABCDEF'},{...message,text:'SIM'},{...message,to:'244900999998'},{...message,receivedAt:null}]}),env,net);
 assert.equal(r.status,200);assert.equal(calls.length,2);assert.equal(calls[0].p_actor,null);assert.equal(calls[0].p_action,'sms_receipt');assert.equal(calls[0].p_payload.from,'+244900000002');assert.equal(calls[1].p_payload.decision,'refuse');
});
test('database failure is retryable, never acknowledged as success',async()=>{
 const r=await handleInboundSms(request(),env,async()=>Response.json({error:'database unavailable'},{status:503}));assert.equal(r.status,503);
});
test('identification accepts only supplied identity and authenticated actor',async()=>{
 const calls=[];const net=async(url,init)=>{calls.push(JSON.parse(init.body));return Response.json({ok:true});};
 const r=await dispatchWitness({action:'witness_identify',record_id:wid,full_name:'Test Person',phone:'+244900000002',code:'TEST-ONLY',consent:true,p_actor:'forged'},'actual-user',env,net);
 assert.equal(r.ok,true);assert.equal(calls[0].p_actor,'actual-user');assert.equal(calls[0].p_payload.p_actor,undefined);
 assert.equal((await dispatchWitness({action:'witness_identify',record_id:wid,code:'TEST-ONLY',consent:true},'user',env,net)).ok,false);
});
test('unconfigured inbound prevents any outbound SMS or prepared invitation',async()=>{
 const noInbound={get:k=>k==='FAIR_SMS_INBOUND_READY'?'false':values[k]}; assert.equal(smsReady(noInbound),false);
 let calls=0;const r=await dispatchWitness({action:'witness_send',witness_id:wid},'user',noInbound,async()=>{calls++;throw Error('unexpected');});assert.equal(r.ok,false);assert.equal(calls,0);
});
test('provider acceptance is recorded separately and cannot approve a witness',async()=>{
 const calls=[];const net=async(url,init)=>{ const body=JSON.parse(init.body); calls.push({url,body});
 if(url.includes('/rpc/')){if(body.p_action==='prepare_sms')return Response.json({ok:true,phone:'+244900000002',reply_to:'+244900999999',reference:'0123456789ABCDEF',send_token:wid,target_code:'TARGET-TEST',requester_name:'Test Person'});return Response.json({ok:true});}
 return Response.json({messages:[{messageId:'provider-1',status:{groupId:1}}]});};
 const r=await dispatchWitness({action:'witness_send',witness_id:wid},'user',env,net);
 assert.equal(r.notification_sent,true);assert.deepEqual(calls.filter(c=>c.url.includes('/rpc/')).map(c=>c.body.p_action),['prepare_sms','delivery']);
 const sms=calls.find(c=>!c.url.includes('/rpc/')).body.messages[0].text;assert.match(sms,/ACEITO 0123456789ABCDEF/);assert.match(sms,/RECUSO/);assert.match(sms,/TARGET-TEST/);assert.match(sms,/conhece/);
});
test('send timeout leaves unconfirmed delivery and does not invent receipt',async()=>{
 const calls=[];const net=async(url,init)=>{const body=JSON.parse(init.body);calls.push(body);if(!url.includes('/rpc/'))throw Error('timeout');if(body.p_action==='prepare_sms')return Response.json({ok:true,phone:'+244900000002',reply_to:'+244900999999',reference:'0123456789ABCDEF',send_token:wid,target_code:'TARGET'});return Response.json({ok:true});};
 const r=await dispatchWitness({action:'witness_send',witness_id:wid},'user',env,net);assert.equal(r.notification_sent,false);assert.equal(calls.at(-1).p_payload.accepted,false);
});
