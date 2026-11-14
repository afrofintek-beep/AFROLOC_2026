import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
await db.exec(`
 CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,deleted_at timestamptz,is_anonymous boolean DEFAULT false,phone text,phone_confirmed_at timestamptz);
 CREATE TABLE public.afroloc_records(id uuid PRIMARY KEY,code text,country text,user_id uuid,status text,geo_lat numeric,geo_lon numeric,level1_code text,level2_code text,level3_code text,level4_code text,approved_by_user_id uuid,approved_at timestamptz,last_verified_at timestamptz,is_temporary boolean DEFAULT false,temporary_expires_at timestamptz,level2_name text,level4_name text,street_name text,number text,unit text);
 CREATE TABLE public.afroloc_witnesses(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),afroloc_record_id uuid REFERENCES public.afroloc_records(id),witness_user_id uuid REFERENCES auth.users(id),witness_afro_id text,status text,signature text,confirmed_at timestamptz,otp_code text,otp_expires_at timestamptz,otp_sent_at timestamptz,rejection_reason text,created_at timestamptz DEFAULT now());
 CREATE TABLE public.afroloc_validations(afroloc_record_id uuid,validation_method text,verified_at timestamptz DEFAULT now(),expires_at timestamptz DEFAULT now()+interval '1 year',authority_role text,authority_signature text,notes text);
 CREATE TABLE public.account_verified_phones(user_id uuid,phone text,verified_at timestamptz DEFAULT now(),expires_at timestamptz,revoked_at timestamptz);
 CREATE TABLE public.postal_stations(station text PRIMARY KEY,province_code text,municipio_code text,name text,status text,notes text,updated_at timestamptz);
 CREATE TABLE public.administrative_divisions(id uuid DEFAULT gen_random_uuid(),name text,country_code text,code text,level integer,parent_code text);
 INSERT INTO public.postal_stations(station,province_code,municipio_code,status) VALUES('5051500','AO-LUA','AO-LUA-TALATONA','planned');
 INSERT INTO public.administrative_divisions(country_code,code,level,parent_code) VALUES('AO','AO-LDA-TALATONA',2,'AO-LDA');
`);
await db.exec(`CREATE TABLE public.validation_phone_numbers(id uuid DEFAULT gen_random_uuid(),country_code text,phone_number text,validator_user_id uuid,administrative_division_id uuid,is_active boolean,verification_status text,verified_at timestamptz);
CREATE TABLE public.user_roles(user_id uuid,role text);`);
await db.exec(await fs.readFile(new URL('./base-witness.sql',import.meta.url),'utf8'));
await db.exec(await fs.readFile(new URL('../../supabase/migrations/20261109033426_fair_factual_verification.sql',import.meta.url),'utf8'));
const uid=i=>`00000000-0000-0000-0000-${String(i).padStart(12,'0')}`;
for(let i=1;i<=8;i++){
 await db.query('insert into auth.users(id) values($1)',[uid(i)]);
 await db.query("insert into public.afroloc_records(id,code,country,user_id,status,geo_lat,geo_lon,level1_code,level2_code) values($1,$2,'AO',$3,$4,-8.92,13.2,'AO-LDA','AO-LDA-TALATONA')",[uid(i+100),'AO-LDA-TAL-TAL-DIG-G10-X1-Y'+i,uid(i),i===1?'draft':'certified']);
 if(i>1)await db.query("insert into public.afroloc_validations(afroloc_record_id,validation_method) values($1,'authority')",[uid(i+100)]);
}
await db.query("insert into public.user_roles values($1,'operator_field')",[uid(8)]);
await db.query("insert into public.validation_phone_numbers(country_code,phone_number,validator_user_id,administrative_division_id,is_active,verification_status,verified_at) select 'AO','+244900000008',$1,id,true,'verified',now() from public.administrative_divisions limit 1",[uid(8)]);
await db.exec('GRANT USAGE ON SCHEMA public TO service_role; GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA public TO service_role;');
await db.exec(`set request.jwt.claims='{"role":"service_role"}';`);
const rpc=async(actor,action,payload={},fn='fair_verification')=>{await db.exec('SET ROLE service_role');try{return(await db.query(`select public.${fn}($1,$2,$3::jsonb) result`,[actor,action,JSON.stringify(payload)])).rows[0].result}finally{await db.exec('RESET ROLE')}};
const code=i=>'AO-LDA-TAL-TAL-DIG-G10-X1-Y'+i;
const review=(i,extra={})=>rpc(uid(8),'review',{code:code(i),housing:'neighbourhood',notes:'Residência verificada no local.',consent:true,...extra});
const eligible=async(i)=>(await db.query('select public.fair_witness_eligible($1,$2) as eligible',[uid(101),uid(100+i)])).rows[0].eligible;
assert.equal((await rpc(uid(2),'enroll',{record_id:uid(101)})).ok,false);
assert.equal((await rpc(uid(1),'enroll',{record_id:uid(101)})).ok,true);
assert.equal((await rpc(uid(1),'review',{code:code(1),housing:'neighbourhood',notes:'Eu próprio validei.',consent:true})).ok,false);
assert.equal((await review(8)).ok,false); // official cannot validate own address
assert.equal(await eligible(2),false);
for(let i=1;i<=7;i++)assert.equal((await review(i)).ok,true);
assert.equal(await eligible(2),true);
assert.equal(await eligible(1),false);
// Actual Haversine distances: boundary inside and outside 500 metres.
await db.query('update public.afroloc_records set geo_lat=$1 where id=$2',[-8.92+499.9/6371000*180/Math.PI,uid(102)]);
assert.equal(await eligible(2),false); // changed coordinate invalidates the inspection
await review(2);assert.equal(await eligible(2),true);
await db.query('update public.afroloc_records set geo_lat=$1 where id=$2',[-8.92+500.1/6371000*180/Math.PI,uid(102)]);
await review(2);assert.equal(await eligible(2),false);
await db.query('update public.afroloc_records set geo_lat=-8.92 where id=$1',[uid(102)]);await review(2);
const c1=(await rpc(uid(8),'condominium',{code:code(1),name:'Condomínio de teste A'})).condominium_id;
const c2=(await rpc(uid(8),'condominium',{code:code(1),name:'Condomínio de teste B'})).condominium_id;
await review(1,{housing:'condominium',condominium_id:c1});
assert.equal(await eligible(2),false);
await review(2,{housing:'condominium',condominium_id:c2});assert.equal(await eligible(2),false);
for(let i=2;i<=4;i++)await review(i,{housing:'condominium',condominium_id:c1});
assert.equal(await eligible(2),true);
await db.query("update public.afroloc_validations set expires_at=now()-interval '1 day' where afroloc_record_id=$1",[uid(102)]);assert.equal(await eligible(2),false);
await db.query("update public.afroloc_validations set expires_at=now()+interval '1 year' where afroloc_record_id=$1",[uid(102)]);
await db.exec("update public.validation_phone_numbers set is_active=false");assert.equal(await eligible(2),false);await db.exec("update public.validation_phone_numbers set is_active=true");
const certify=()=>rpc(uid(8),'certify',{code:code(1),consent:true,notes:'Verificação e três testemunhas confirmadas.'});
assert.equal((await certify()).ok,false);
await assert.rejects(db.query("update public.afroloc_records set status='certified',approved_by_user_id=$1 where id=$2",[uid(8),uid(101)]),/três testemunhas/);
await assert.rejects(db.query("update public.afroloc_records set geo_lat=-8.93 where id=$1",[uid(101)]),/correção exige revisão/);

await db.exec(`CREATE TABLE public.profiles(user_id uuid, full_name text); GRANT SELECT ON public.profiles TO service_role;`);
for (let i=1;i<=8;i++) {
 await db.query('insert into public.profiles values($1,$2)',[uid(i),'Pessoa Teste '+i]);
 await db.query("update auth.users set phone=$2,phone_confirmed_at=now() where id=$1",[uid(i),'24490000000'+i]);
}
await db.exec(await fs.readFile(new URL('../../supabase/migrations/20261109144720_fair_witness_identity_sms_review.sql',import.meta.url),'utf8'));
const vrpc=(actor,action,payload={})=>rpc(actor,action,payload,'fair_witness_process');
const identify=(i,extra={})=>vrpc(uid(1),'identify',{record_id:uid(101),code:code(i),full_name:'Pessoa Teste '+i,phone:'+24490000000'+i,consent:true,...extra});
const incoming=(w,reference,i,extra={})=>vrpc(null,'sms_receipt',{reference,from:'+24490000000'+i,to:'+244900999999',decision:'accept',message_id:'provider-'+w,received_at:new Date().toISOString(),...extra});
const decide=(w,actor=uid(8),extra={})=>vrpc(actor,'decide',{witness_id:w,decision:'approve',notes:'Conferida a identidade e a residência.',consent:true,identity_checked:true,...extra});
assert.equal((await identify(2,{full_name:''})).ok,false);
assert.equal((await identify(2,{phone:'+244900000009'})).ok,false);
assert.equal((await identify(2,{full_name:'Outra Pessoa'})).ok,false);
assert.equal((await vrpc(uid(7),'identify',{record_id:uid(101),code:code(2),full_name:'Pessoa Teste 2',phone:'+244900000002',consent:true})).ok,false);
// Identification can precede the target's inspection, but sending cannot.
await db.query('delete from public.fair_residence_reviews where record_id=$1',[uid(101)]);
const first=await identify(2); assert.equal(first.ok,true);
await assert.rejects(db.query('update public.afroloc_witnesses set afroloc_record_id=$1 where id=$2',[uid(105),first.witness_id]),/não podem ser substituídas/);
await assert.rejects(db.query('update public.afroloc_witnesses set witness_user_id=$1 where id=$2',[uid(3),first.witness_id]),/não podem ser substituídas/);
assert.equal((await vrpc(uid(1),'prepare_sms',{witness_id:first.witness_id,reply_to:'+244900999999'})).ok,false);
await review(1,{housing:'condominium',condominium_id:c1});
assert.equal((await identify(2)).existing,true);
assert.equal((await vrpc(uid(7),'info',{witness_id:first.witness_id})).ok,false);
await assert.rejects(rpc(uid(1),'request',{record_id:uid(101),code:code(3),consent:true},'witness_confirmation_v2'));
let approved=[];
for(let i=2;i<=4;i++) {
 const w=i===2?first:await identify(i); assert.equal(w.ok,true);
 const prep=await vrpc(uid(1),'prepare_sms',{witness_id:w.witness_id,reply_to:'+244900999999'}); assert.equal(prep.ok,true);
 assert.equal((await vrpc(uid(1),'prepare_sms',{witness_id:w.witness_id,reply_to:'+244900999999'})).ok,false); // rate limit
 assert.equal((await decide(w.witness_id)).ok,false); // before inbound acceptance
 assert.equal((await incoming(w.witness_id,prep.reference,i,{from:'+244900000009'})).ok,false);
 assert.equal((await incoming(w.witness_id,prep.reference,i,{to:'+244900999998'})).ok,false);
 assert.equal((await incoming(w.witness_id,'BADREF',i)).ok,false);
 assert.equal((await incoming(w.witness_id,prep.reference,i)).ok,true);
 assert.equal((await incoming(w.witness_id,prep.reference,i)).duplicate,true);
 assert.equal((await db.query('select status from public.afroloc_witnesses where id=$1',[w.witness_id])).rows[0].status,'pending');
 assert.equal((await db.query('select public.fair_confirmed_count($1) n',[uid(101)])).rows[0].n,i-2);
 await assert.rejects(db.query("update public.afroloc_witnesses set status='confirmed' where id=$1",[w.witness_id]),/SMS/);
 assert.equal((await decide(w.witness_id,uid(1))).ok,false);
 assert.equal((await decide(w.witness_id,uid(i))).ok,false);
 assert.equal((await decide(w.witness_id,uid(7))).ok,false);
 if(i===2) {
  await db.query('update public.afroloc_records set geo_lat=$1 where id=$2',[-8.92+500.1/6371000*180/Math.PI,uid(102)]); await review(2,{housing:'condominium',condominium_id:c1});
  assert.equal((await decide(w.witness_id)).ok,false);
  await db.query('update public.afroloc_records set geo_lat=-8.92 where id=$1',[uid(102)]); await review(2,{housing:'condominium',condominium_id:c2});
  assert.equal((await decide(w.witness_id)).ok,false);
  await review(2,{housing:'condominium',condominium_id:c1});
 }
 assert.equal((await decide(w.witness_id)).ok,true); approved.push(w.witness_id);
 assert.equal((await decide(w.witness_id)).ok,false);
}
assert.equal((await certify()).ok,true);
const state=await vrpc(uid(1),'list'); assert.equal(state.addresses[0].confirmed,3); assert.equal(state.addresses[0].approved,true);
assert.equal(state.addresses[0].witnesses[0].status,'approved');
assert.equal((await vrpc(uid(8),'list')).witness_queue.length,3);
// An already certified canonical address can still start its fair-specific process.
assert.equal((await rpc(uid(5),'enroll',{record_id:uid(105)})).ok,true);
const second=await vrpc(uid(5),'identify',{record_id:uid(105),code:code(2),full_name:'Pessoa Teste 2',phone:'+244900000002',consent:true}); assert.equal(second.ok,true);
const secondPrep=await vrpc(uid(5),'prepare_sms',{witness_id:second.witness_id,reply_to:'+244900999999'});assert.equal(secondPrep.ok,true);
await db.query("update public.fair_witness_requests set expires_at=now()-interval '1 minute' where witness_id=$1",[second.witness_id]);
assert.equal((await incoming(second.witness_id,secondPrep.reference,2)).ok,false);
await db.query("update public.fair_witness_requests set expires_at=now()+interval '1 hour' where witness_id=$1",[second.witness_id]);
await db.query("update auth.users set phone='244900000002' where id=$1",[uid(6)]);
assert.equal((await vrpc(uid(5),'identify',{record_id:uid(105),code:code(6),full_name:'Pessoa Teste 6',phone:'+244900000002',consent:true})).ok,false); // distinct phones
assert.equal((await incoming(second.witness_id,secondPrep.reference,2,{decision:'refuse'})).ok,true);
assert.equal((await decide(second.witness_id)).ok,false);
assert.equal((await db.query('select status from public.afroloc_witnesses where id=$1',[second.witness_id])).rows[0].status,'rejected');
assert.equal((await vrpc(uid(5),'list')).addresses[0].confirmed,0);
await db.query("update auth.users set phone='244900000099' where id=$1",[uid(2)]);
assert.equal((await vrpc(uid(1),'list')).addresses[0].approved,false); // identity evidence is rechecked
await db.query("update auth.users set phone='244900000002' where id=$1",[uid(2)]);
await db.query("update public.profiles set full_name='Nome Alterado' where user_id=$1",[uid(2)]);
assert.equal((await vrpc(uid(1),'list')).addresses[0].approved,false);
await db.exec('SET ROLE authenticated');
await assert.rejects(db.query('select * from public.fair_witness_requests'),/permission denied/);
await assert.rejects(db.query("select public.fair_witness_process($1,'list','{}')",[uid(1)]),/permission denied/);
await assert.rejects(db.query("select public.fair_verified_phone($1,'+244900000002')",[uid(2)]),/permission denied/);
await db.exec('RESET ROLE'); await db.close();
console.log('PASS v3: identity first, authoritative names and verified phones, scoped access, separate acceptance/approval, sender/recipient/reference matching, duplicate receipts, rate limit, 500m, condominium, independent validator, no direct/legacy bypass, three approved witnesses and dynamic evidence invalidation.');
