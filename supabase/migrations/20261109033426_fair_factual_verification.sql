-- Fair-specific verification; canonical AFROLOC codes and records are never invented.
CREATE TABLE public.fair_condominiums (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK(length(trim(name)) BETWEEN 3 AND 160),
 country text NOT NULL, municipality text NOT NULL, created_by uuid NOT NULL REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(country,municipality,name)
);
CREATE TABLE public.fair_address_enrolments (
 record_id uuid PRIMARY KEY REFERENCES public.afroloc_records(id) ON DELETE CASCADE,
 owner_id uuid NOT NULL REFERENCES auth.users(id), created_at timestamptz NOT NULL DEFAULT now(),
 approved_at timestamptz, approved_by uuid REFERENCES auth.users(id)
);
CREATE TABLE public.fair_residence_reviews (
 record_id uuid PRIMARY KEY REFERENCES public.afroloc_records(id) ON DELETE CASCADE,
 owner_id uuid NOT NULL REFERENCES auth.users(id), latitude numeric NOT NULL CHECK(latitude BETWEEN -90 AND 90),
 longitude numeric NOT NULL CHECK(longitude BETWEEN -180 AND 180),
 housing text NOT NULL CHECK(housing IN ('condominium','neighbourhood')),
 condominium_id uuid REFERENCES public.fair_condominiums(id),
 reviewed_by uuid NOT NULL REFERENCES auth.users(id), reviewed_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '1 year', notes text NOT NULL CHECK(length(trim(notes))>=10),
 CHECK((housing='condominium')=(condominium_id IS NOT NULL)), CHECK(owner_id<>reviewed_by)
);
CREATE TABLE public.fair_verification_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid NOT NULL REFERENCES auth.users(id),
 record_id uuid REFERENCES public.afroloc_records(id) ON DELETE SET NULL,
 action text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fair_condominiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_address_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_residence_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_verification_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fair_condominiums,public.fair_address_enrolments,public.fair_residence_reviews,public.fair_verification_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.fair_condominiums,public.fair_address_enrolments,public.fair_residence_reviews,public.fair_verification_events TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.fair_verification_events_id_seq TO service_role;

CREATE FUNCTION public.fair_is_validator(actor uuid, rid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT actor IS NOT NULL AND EXISTS(
 SELECT 1 FROM public.afroloc_records r
 JOIN public.validation_phone_numbers v ON v.country_code=r.country
 JOIN public.administrative_divisions d ON d.id=v.administrative_division_id
 WHERE r.id=rid AND r.user_id<>actor AND v.validator_user_id=actor AND v.is_active
 AND v.verification_status='verified' AND v.verified_at IS NOT NULL
 AND d.country_code=r.country AND d.code IN(r.level1_code,r.level2_code,r.level3_code,r.level4_code)
 AND EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id=actor AND ur.role::text IN('admin','admin_national','admin_province','admin_municipality','operator_field'))
 )
$$;
CREATE FUNCTION public.fair_review_current(rid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.fair_residence_reviews v JOIN public.afroloc_records r ON r.id=v.record_id
 WHERE r.id=rid AND r.user_id=v.owner_id AND r.geo_lat=v.latitude AND r.geo_lon=v.longitude
 AND v.expires_at>now() AND public.fair_is_validator(v.reviewed_by,r.id)
 AND r.status::text NOT IN('revoked','expired','rejected')
 AND (NOT r.is_temporary OR r.temporary_expires_at>now()))
$$;
CREATE FUNCTION public.fair_distance(a uuid,b uuid) RETURNS double precision
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT 6371000*2*asin(sqrt(least(1.0,power(sin(radians((y.geo_lat-x.geo_lat)::float8)/2),2)+cos(radians(x.geo_lat::float8))*cos(radians(y.geo_lat::float8))*power(sin(radians((y.geo_lon-x.geo_lon)::float8)/2),2))))
 FROM public.afroloc_records x,public.afroloc_records y WHERE x.id=a AND y.id=b
 AND x.geo_lat BETWEEN -90 AND 90 AND y.geo_lat BETWEEN -90 AND 90
 AND x.geo_lon BETWEEN -180 AND 180 AND y.geo_lon BETWEEN -180 AND 180
$$;
CREATE FUNCTION public.fair_witness_eligible(target_id uuid, neighbour_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.afroloc_records t,public.afroloc_records n,
 public.fair_residence_reviews tr,public.fair_residence_reviews nr
 WHERE t.id=target_id AND n.id=neighbour_id AND tr.record_id=t.id AND nr.record_id=n.id
 AND t.country='AO' AND n.country=t.country AND t.user_id<>n.user_id
 AND n.status::text IN('verified','certified')
 AND n.code NOT LIKE '%LOCAL%' AND t.code NOT LIKE '%LOCAL%'
 AND public.fair_review_current(t.id) AND public.fair_review_current(n.id)
 AND EXISTS(SELECT 1 FROM public.afroloc_validations v WHERE v.afroloc_record_id=n.id
 AND v.validation_method='authority' AND v.verified_at IS NOT NULL AND v.expires_at>now())
 AND (tr.housing='neighbourhood' OR (nr.housing='condominium' AND tr.condominium_id=nr.condominium_id))
 AND public.fair_distance(t.id,n.id)<=500)
$$;
CREATE FUNCTION public.fair_confirmed_count(rid uuid) RETURNS integer
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT count(DISTINCT w.witness_user_id)::int FROM public.afroloc_witnesses w
 JOIN public.afroloc_records n ON n.code=w.witness_afro_id AND n.user_id=w.witness_user_id
 WHERE w.afroloc_record_id=rid AND w.status='confirmed' AND w.confirmation_protocol='otp_v2'
 AND public.fair_witness_eligible(rid,n.id)
$$;

CREATE FUNCTION public.fair_verification(p_actor uuid,p_action text,p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE r public.afroloc_records%ROWTYPE; cid uuid; result jsonb;
BEGIN
 -- p_actor is supplied only by the authenticated Edge Function, never by clients.
 IF p_actor IS NULL THEN
 RETURN jsonb_build_object('ok',false,'error','Entre na sua conta AFROLOC.'); END IF;
 IF p_action='list' THEN
 RETURN jsonb_build_object('ok',true,
 'addresses',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'code',a.code,'status',a.status,'municipality',a.level2_name,'area',a.level4_name,'street',a.street_name,'number',a.number,'unit',a.unit,
 'latitude',a.geo_lat,'longitude',a.geo_lon,'enrolled',e.record_id IS NOT NULL,'reviewed',public.fair_review_current(a.id),
 'confirmed',public.fair_confirmed_count(a.id),'approved',e.approved_at IS NOT NULL AND a.status::text='certified' AND public.fair_review_current(a.id) AND public.fair_confirmed_count(a.id)>=3,
 'witnesses',coalesce((SELECT jsonb_agg(jsonb_build_object('id',w.id,'code',w.witness_afro_id,'status',w.status,'eligible',public.fair_witness_eligible(a.id,n.id),'distance_m',public.fair_distance(a.id,n.id))) FROM public.afroloc_witnesses w LEFT JOIN public.afroloc_records n ON n.code=w.witness_afro_id AND n.user_id=w.witness_user_id WHERE w.afroloc_record_id=a.id),'[]'::jsonb))) FROM public.afroloc_records a LEFT JOIN public.fair_address_enrolments e ON e.record_id=a.id WHERE a.user_id=p_actor AND a.country='AO' AND a.code NOT LIKE '%LOCAL%'),'[]'::jsonb),
 'invitations',coalesce((SELECT jsonb_agg(jsonb_build_object('id',w.id,'code',ar.code,'status',w.status)) FROM public.afroloc_witnesses w JOIN public.afroloc_records ar ON ar.id=w.afroloc_record_id JOIN public.fair_address_enrolments e ON e.record_id=ar.id WHERE w.witness_user_id=p_actor),'[]'::jsonb),
 'contacts',coalesce((SELECT jsonb_agg(DISTINCT jsonb_build_object('phone',v.phone_number,'area',d.name)) FROM public.validation_phone_numbers v JOIN public.administrative_divisions d ON d.id=v.administrative_division_id WHERE v.is_active AND v.verification_status='verified' AND v.verified_at IS NOT NULL AND EXISTS(SELECT 1 FROM public.afroloc_records a WHERE a.user_id=p_actor AND public.fair_is_validator(v.validator_user_id,a.id))),'[]'::jsonb),
 'condominiums',coalesce((SELECT jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'municipality',c.municipality)) FROM public.fair_condominiums c),'[]'::jsonb),
 'is_validator',EXISTS(SELECT 1 FROM public.validation_phone_numbers v JOIN public.user_roles ur ON ur.user_id=v.validator_user_id WHERE v.validator_user_id=p_actor AND v.is_active AND v.verification_status='verified' AND v.verified_at IS NOT NULL AND ur.role::text IN('admin','admin_national','admin_province','admin_municipality','operator_field')));
 END IF;
 IF p_action IN('review','certify','inspect','condominium') THEN
 SELECT * INTO r FROM public.afroloc_records WHERE upper(code)=upper(trim(p_payload->>'code')) FOR UPDATE;
 IF r.id IS NULL OR NOT public.fair_is_validator(p_actor,r.id) THEN RETURN jsonb_build_object('ok',false,'error','Endereço indisponível ou fora da sua autorização de validação.'); END IF;
 ELSE
 SELECT * INTO r FROM public.afroloc_records WHERE id=(p_payload->>'record_id')::uuid AND user_id=p_actor FOR UPDATE;
 IF r.id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Não tem acesso a este endereço.'); END IF;
 END IF;
 IF r.country<>'AO' OR r.code LIKE '%LOCAL%' OR r.status::text IN('revoked','rejected','expired') OR (r.is_temporary AND (r.temporary_expires_at IS NULL OR r.temporary_expires_at<=now())) THEN RETURN jsonb_build_object('ok',false,'error','O endereço não está disponível para esta verificação.'); END IF;
 IF p_action='inspect' THEN RETURN jsonb_build_object('ok',true,'record',jsonb_build_object('code',r.code,'latitude',r.geo_lat,'longitude',r.geo_lon,'municipality',r.level2_name,'street',r.street_name,'number',r.number,'unit',r.unit,'status',r.status,'reviewed',public.fair_review_current(r.id),'confirmed',public.fair_confirmed_count(r.id),'enrolled',EXISTS(SELECT 1 FROM public.fair_address_enrolments WHERE record_id=r.id))); END IF;
 IF p_action='enroll' THEN
 INSERT INTO public.fair_address_enrolments(record_id,owner_id) VALUES(r.id,p_actor) ON CONFLICT DO NOTHING;
 ELSIF p_action='condominium' THEN
 IF length(trim(coalesce(p_payload->>'name','')))<3 OR length(p_payload->>'name')>160 OR r.level2_code IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Indique o nome oficial do condomínio e confirme o município.'); END IF;
 INSERT INTO public.fair_condominiums(name,country,municipality,created_by) VALUES(trim(p_payload->>'name'),r.country,r.level2_code,p_actor) ON CONFLICT(country,municipality,name) DO UPDATE SET name=excluded.name RETURNING id INTO cid;
 ELSIF p_action='review' THEN
 IF p_payload->>'consent' IS DISTINCT FROM 'true' OR length(trim(coalesce(p_payload->>'notes','')))<10 OR length(p_payload->>'notes')>2000 OR p_payload->>'housing' NOT IN('condominium','neighbourhood') OR p_payload->>'housing' IS NULL OR r.geo_lat IS NULL OR r.geo_lon IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Confirme a verificação presencial, a localização, o tipo de residência e registe a evidência.'); END IF;
 IF p_payload->>'housing'='condominium' THEN
 SELECT id INTO cid FROM public.fair_condominiums WHERE id=(p_payload->>'condominium_id')::uuid AND country=r.country AND municipality=r.level2_code;
 IF cid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Selecione o condomínio registado neste município.'); END IF;
 END IF;
 INSERT INTO public.fair_residence_reviews(record_id,owner_id,latitude,longitude,housing,condominium_id,reviewed_by,notes)
 VALUES(r.id,r.user_id,r.geo_lat,r.geo_lon,p_payload->>'housing',cid,p_actor,trim(p_payload->>'notes'))
 ON CONFLICT(record_id) DO UPDATE SET owner_id=excluded.owner_id,latitude=excluded.latitude,longitude=excluded.longitude,housing=excluded.housing,condominium_id=excluded.condominium_id,reviewed_by=excluded.reviewed_by,notes=excluded.notes,reviewed_at=now(),expires_at=now()+interval '1 year';
 -- A residence inspection never certifies an address by itself.
 ELSIF p_action='certify' THEN
 IF p_payload->>'consent' IS DISTINCT FROM 'true' OR length(trim(coalesce(p_payload->>'notes','')))<10 OR NOT EXISTS(SELECT 1 FROM public.fair_address_enrolments WHERE record_id=r.id) OR NOT public.fair_review_current(r.id) OR public.fair_confirmed_count(r.id)<>3 THEN RETURN jsonb_build_object('ok',false,'error','São necessárias três confirmações válidas, inspeção da residência e decisão fundamentada do validador oficial.'); END IF;
 UPDATE public.fair_address_enrolments SET approved_at=now(),approved_by=p_actor WHERE record_id=r.id;
 INSERT INTO public.afroloc_validations(afroloc_record_id,validation_method,authority_role,authority_signature,notes,expires_at,verified_at)
 VALUES(r.id,'authority','official_fair_validator',p_actor::text,left(p_payload->>'notes',2000),now()+interval '1 year',now());
 UPDATE public.afroloc_records SET status='certified',approved_by_user_id=p_actor,approved_at=now(),last_verified_at=now() WHERE id=r.id;
 ELSE RETURN jsonb_build_object('ok',false,'error','Operação desconhecida.'); END IF;
 INSERT INTO public.fair_verification_events(actor_id,record_id,action,details) VALUES(p_actor,r.id,p_action,jsonb_build_object('code',r.code,'condominium_id',cid,'housing',p_payload->>'housing','notes',left(p_payload->>'notes',2000),'latitude',r.geo_lat,'longitude',r.geo_lon));
 RETURN jsonb_build_object('ok',true,'condominium_id',cid);
END $$;

-- Trigger is internal only. Definer access is needed to read the private service tables
-- when an older authenticated canonical endpoint attempts to change a fair address.
CREATE FUNCTION public.guard_fair_address() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM public.fair_address_enrolments WHERE record_id=OLD.id) THEN
 IF ROW(NEW.code,NEW.user_id,NEW.geo_lat,NEW.geo_lon,NEW.level1_code,NEW.level2_code,NEW.level3_code,NEW.level4_code,NEW.street_name,NEW.number,NEW.unit)
 IS DISTINCT FROM ROW(OLD.code,OLD.user_id,OLD.geo_lat,OLD.geo_lon,OLD.level1_code,OLD.level2_code,OLD.level3_code,OLD.level4_code,OLD.street_name,OLD.number,OLD.unit) THEN RAISE EXCEPTION 'Endereço associado à feira: a correção exige revisão oficial do processo.'; END IF;
 IF NEW.status::text IN('verified','certified') AND (NEW.status IS DISTINCT FROM OLD.status OR NEW.approved_by_user_id IS DISTINCT FROM OLD.approved_by_user_id OR NEW.approved_at IS DISTINCT FROM OLD.approved_at) THEN
 IF NOT public.fair_review_current(OLD.id) OR public.fair_confirmed_count(OLD.id)<>3 OR NOT EXISTS(SELECT 1 FROM public.fair_address_enrolments e WHERE e.record_id=OLD.id AND e.approved_at IS NOT NULL AND e.approved_by=NEW.approved_by_user_id AND public.fair_is_validator(e.approved_by,OLD.id)) THEN RAISE EXCEPTION 'A feira exige três testemunhas elegíveis e aprovação do validador oficial.'; END IF;
 END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_fair_address BEFORE UPDATE ON public.afroloc_records FOR EACH ROW EXECUTE FUNCTION public.guard_fair_address();
REVOKE ALL ON FUNCTION public.guard_fair_address() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.fair_is_validator(uuid,uuid),public.fair_review_current(uuid),public.fair_distance(uuid,uuid),public.fair_witness_eligible(uuid,uuid),public.fair_confirmed_count(uuid),public.fair_verification(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fair_is_validator(uuid,uuid),public.fair_review_current(uuid),public.fair_distance(uuid,uuid),public.fair_witness_eligible(uuid,uuid),public.fair_confirmed_count(uuid),public.fair_verification(uuid,text,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.witness_confirmation_v2(p_actor uuid,p_action text,p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
 target public.afroloc_records%ROWTYPE;
 neighbour public.afroloc_records%ROWTYPE;
 witness public.afroloc_witnesses%ROWTYPE;
 challenge public.afroloc_witness_challenges%ROWTYPE;
 phone_number text;
 distance_m double precision;
 wid uuid;
 decision text;
BEGIN
 -- Identity is verified through Supabase Auth by the service before this RPC.
 IF p_actor IS NULL THEN
  RETURN jsonb_build_object('ok',false,'error','Conta AFROLOC inválida.');
 END IF;
 IF p_action='request' THEN
  SELECT * INTO target FROM public.afroloc_records WHERE id=(p_payload->>'record_id')::uuid AND user_id=p_actor FOR UPDATE;
 ELSE
  SELECT * INTO witness FROM public.afroloc_witnesses WHERE id=(p_payload->>'witness_id')::uuid;
  SELECT * INTO target FROM public.afroloc_records WHERE id=witness.afroloc_record_id FOR UPDATE;
  -- Parent row is always locked first, avoiding request/resend/confirmation deadlocks.
  SELECT * INTO witness FROM public.afroloc_witnesses WHERE id=(p_payload->>'witness_id')::uuid FOR UPDATE;
 END IF;
 IF target.id IS NULL OR (p_actor IS DISTINCT FROM target.user_id AND p_actor IS DISTINCT FROM witness.witness_user_id) THEN
  RETURN jsonb_build_object('ok',false,'error','Não tem acesso a este pedido.');
 END IF;
 IF p_action='info' THEN
  RETURN jsonb_build_object('ok',true,'witness_id',witness.id,'status',witness.status,'is_witness',p_actor=witness.witness_user_id,'afroloc_code',target.code,'municipality',target.level2_name,'zone',target.level4_name,'street',target.street_name,'number',target.number,'unit',target.unit,'temporary',target.is_temporary,'expires_at',target.temporary_expires_at);
 END IF;
 IF p_action='delivery' THEN
  UPDATE public.afroloc_witness_challenges SET delivery_state=CASE WHEN p_payload->>'accepted'='true' THEN 'sent' ELSE 'failed' END
  WHERE witness_id=witness.id AND challenge_id=(p_payload->>'challenge_id')::uuid AND delivery_state='prepared';
  RETURN jsonb_build_object('ok',FOUND);
 END IF;
 IF target.country<>'AO' OR target.status::text IN ('revoked','rejected','expired') OR (target.is_temporary AND (target.temporary_expires_at IS NULL OR target.temporary_expires_at<=now())) THEN
  RETURN jsonb_build_object('ok',false,'error','O endereço não está disponível para confirmação.');
 END IF;
 IF p_action='request' THEN
  SELECT * INTO neighbour FROM public.afroloc_records WHERE upper(code)=upper(trim(p_payload->>'code')) LIMIT 1;
 ELSE
  SELECT * INTO neighbour FROM public.afroloc_records WHERE code=witness.witness_afro_id AND user_id=witness.witness_user_id LIMIT 1;
 END IF;
 IF neighbour.id IS NULL OR neighbour.country<>'AO' OR neighbour.user_id=target.user_id OR neighbour.status::text NOT IN ('verified','certified')
 OR (neighbour.is_temporary AND (neighbour.temporary_expires_at IS NULL OR neighbour.temporary_expires_at<=now()))
 OR NOT EXISTS(SELECT 1 FROM public.afroloc_validations WHERE afroloc_record_id=neighbour.id AND validation_method IN ('authority','witness'))
 OR target.geo_lat IS NULL OR target.geo_lon IS NULL OR neighbour.geo_lat IS NULL OR neighbour.geo_lon IS NULL THEN
  RETURN jsonb_build_object('ok',false,'error','É necessária uma testemunha distinta, com morada AFROLOC validada e localização disponível.');
 END IF;
 distance_m:=6371000*2*asin(sqrt(least(1.0,power(sin(radians(neighbour.geo_lat-target.geo_lat)/2),2)+cos(radians(target.geo_lat))*cos(radians(neighbour.geo_lat))*power(sin(radians(neighbour.geo_lon-target.geo_lon)/2),2))));
 IF EXISTS(SELECT 1 FROM public.fair_address_enrolments WHERE record_id=target.id) THEN
  IF NOT public.fair_witness_eligible(target.id,neighbour.id) THEN
   RETURN jsonb_build_object('ok',false,'error','A feira exige moradas verificadas pelo validador oficial, até 500 metros e no mesmo condomínio quando aplicável.');
  END IF;
 ELSE
  IF distance_m>100 THEN RETURN jsonb_build_object('ok',false,'error','A testemunha deve residir até 100 metros deste endereço.'); END IF;
 END IF;
 IF p_action='request' THEN
  IF p_payload->>'consent'<>'true' OR p_payload->>'consent' IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Confirme o envio do pedido.'); END IF;
  SELECT * INTO witness FROM public.afroloc_witnesses WHERE afroloc_record_id=target.id AND witness_user_id=neighbour.user_id ORDER BY created_at LIMIT 1;
  IF witness.id IS NOT NULL THEN RETURN jsonb_build_object('ok',true,'witness_id',witness.id,'status',witness.status,'existing',true); END IF;
  IF (SELECT count(DISTINCT witness_user_id) FROM public.afroloc_witnesses WHERE afroloc_record_id=target.id AND status IN ('pending','confirmed'))>=3 THEN
   RETURN jsonb_build_object('ok',false,'error','Já foram indicadas três testemunhas.');
  END IF;
  INSERT INTO public.afroloc_witnesses(afroloc_record_id,witness_user_id,witness_afro_id,status,confirmation_protocol)
  VALUES(target.id,neighbour.user_id,neighbour.code,'pending','otp_v2') RETURNING id INTO wid;
  INSERT INTO public.afroloc_witness_events(actor_id,witness_id,action) VALUES(p_actor,wid,'requested');
  RETURN jsonb_build_object('ok',true,'witness_id',wid,'status','pending','existing',false);
 END IF;
 IF witness.status<>'pending' THEN RETURN jsonb_build_object('ok',false,'error','Este testemunho já foi concluído.'); END IF;
 IF p_action='prepare' THEN
  PERFORM pg_advisory_xact_lock(hashtextextended('witness-send:'||p_actor::text,0));
  SELECT * INTO challenge FROM public.afroloc_witness_challenges WHERE witness_id=witness.id FOR UPDATE;
  IF challenge.last_sent_at>now()-interval '60 seconds' OR (SELECT count(*) FROM public.afroloc_witness_events WHERE actor_id=p_actor AND action='otp_prepared' AND created_at>now()-interval '1 hour')>=10 THEN
   RETURN jsonb_build_object('ok',false,'error','Aguarde antes de pedir outro código.');
  END IF;
  SELECT phone INTO phone_number FROM public.account_verified_phones WHERE user_id=witness.witness_user_id AND revoked_at IS NULL AND expires_at>now() ORDER BY verified_at DESC LIMIT 1;
  IF phone_number IS NULL THEN phone_number:=p_payload->>'auth_verified_phone'; END IF;
  phone_number:='+'||regexp_replace(coalesce(phone_number,''),'[^0-9]','','g');
  IF phone_number !~ '^\+244[0-9]{9}$' THEN RETURN jsonb_build_object('ok',false,'reason','phone_not_verified','error','A testemunha precisa de confirmar um número angolano na sua conta AFROLOC antes de receber o código.'); END IF;
  IF p_payload->>'otp_hash' !~ '^[a-f0-9]{64}$' OR length(p_payload->>'salt')<>36 THEN RETURN jsonb_build_object('ok',false,'error','Desafio inválido.'); END IF;
  INSERT INTO public.afroloc_witness_challenges(witness_id,otp_hash,salt,expires_at) VALUES(witness.id,p_payload->>'otp_hash',p_payload->>'salt',now()+interval '10 minutes')
  ON CONFLICT(witness_id) DO UPDATE SET challenge_id=gen_random_uuid(),otp_hash=excluded.otp_hash,salt=excluded.salt,expires_at=excluded.expires_at,attempts=0,delivery_state='prepared',last_sent_at=now(),consumed_at=NULL RETURNING * INTO challenge;
  UPDATE public.afroloc_witnesses SET confirmation_protocol='otp_v2',otp_code=NULL,otp_expires_at=NULL,otp_sent_at=now() WHERE id=witness.id;
  INSERT INTO public.afroloc_witness_events(actor_id,witness_id,action) VALUES(p_actor,witness.id,'otp_prepared');
  RETURN jsonb_build_object('ok',true,'phone',phone_number,'challenge_id',challenge.challenge_id,'expires_at',challenge.expires_at,'afroloc_code',target.code);
 END IF;
 IF p_action='verify' THEN
  IF p_actor<>witness.witness_user_id THEN RETURN jsonb_build_object('ok',false,'error','Só a testemunha pode confirmar este pedido.'); END IF;
  IF p_payload->>'consent' IS DISTINCT FROM 'true' OR length(trim(coalesce(p_payload->>'full_name','')))<3 OR length(trim(coalesce(p_payload->>'signature','')))<3 THEN
   RETURN jsonb_build_object('ok',false,'error','Preencha o nome, a assinatura e a declaração.');
  END IF;
  SELECT * INTO challenge FROM public.afroloc_witness_challenges WHERE witness_id=witness.id FOR UPDATE;
  IF challenge.witness_id IS NULL OR challenge.delivery_state<>'sent' OR challenge.expires_at<=now() OR challenge.attempts>=5 THEN RETURN jsonb_build_object('ok',false,'error','Código indisponível, expirado ou bloqueado. Peça um novo código.'); END IF;
  IF p_payload->>'challenge_id' IS DISTINCT FROM challenge.challenge_id::text THEN RETURN jsonb_build_object('ok',false,'error','O código foi substituído. Utilize o mais recente.'); END IF;
  UPDATE public.afroloc_witness_challenges SET attempts=attempts+1 WHERE witness_id=witness.id;
  IF p_payload->>'otp_hash' IS DISTINCT FROM challenge.otp_hash THEN RETURN jsonb_build_object('ok',false,'error','Código incorrecto.'); END IF;
  decision:=coalesce(p_payload->>'decision','confirm');
  IF decision NOT IN ('confirm','reject') THEN RETURN jsonb_build_object('ok',false,'error','Decisão inválida.'); END IF;
  UPDATE public.afroloc_witness_challenges SET delivery_state='consumed',consumed_at=now() WHERE witness_id=witness.id;
  UPDATE public.afroloc_witnesses SET status=CASE WHEN decision='confirm' THEN 'confirmed' ELSE 'rejected' END,
   confirmed_at=CASE WHEN decision='confirm' THEN now() ELSE NULL END,
   signature=left(trim(p_payload->>'full_name'),160)||' — '||left(trim(p_payload->>'signature'),500),
   rejection_reason=CASE WHEN decision='reject' THEN 'A testemunha não confirmou a residência.' ELSE NULL END,
   otp_code=NULL,otp_expires_at=NULL WHERE id=witness.id;
  INSERT INTO public.afroloc_witness_events(actor_id,witness_id,action) VALUES(p_actor,witness.id,CASE WHEN decision='confirm' THEN 'confirmed' ELSE 'rejected' END);
  -- Deliberately no update to afroloc_records.status or official validated_at.
  RETURN jsonb_build_object('ok',true,'status',CASE WHEN decision='confirm' THEN 'confirmed' ELSE 'rejected' END,'witness_id',witness.id);
 END IF;
 RETURN jsonb_build_object('ok',false,'error','Operação desconhecida.');
END $$;
REVOKE ALL ON FUNCTION public.witness_confirmation_v2(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.witness_confirmation_v2(uuid,text,jsonb) TO service_role;

