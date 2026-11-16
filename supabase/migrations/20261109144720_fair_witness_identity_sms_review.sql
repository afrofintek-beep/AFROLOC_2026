-- Identity first, an inbound acceptance second, an independent official decision last.
-- No phone numbers, people, evidence or successful deliveries are seeded here.
CREATE TABLE public.fair_witness_requests (
 witness_id uuid PRIMARY KEY REFERENCES public.afroloc_witnesses(id),
 neighbour_id uuid NOT NULL REFERENCES public.afroloc_records(id),
 full_name text NOT NULL CHECK(length(trim(full_name)) BETWEEN 3 AND 160),
 phone text NOT NULL CHECK(phone ~ '^\+244[0-9]{9}$'),
 reference text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),
 state text NOT NULL DEFAULT 'identified' CHECK(state IN('identified','awaiting_sms','accepted_sms','refused_sms','approved','rejected')),
 assigned_validator uuid REFERENCES auth.users(id), reply_to text,
 send_token uuid, send_started_at timestamptz, delivery_state text NOT NULL DEFAULT 'unsent', provider_message_id text,
 expires_at timestamptz, accepted_at timestamptz, receipt_id text,
 reviewed_by uuid REFERENCES auth.users(id), reviewed_at timestamptz, review_notes text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fair_witness_requests_validator ON public.fair_witness_requests(assigned_validator,state);
CREATE INDEX fair_witness_requests_neighbour ON public.fair_witness_requests(neighbour_id);
CREATE TABLE public.fair_witness_sms_receipts (
 provider_message_id text PRIMARY KEY CHECK(length(provider_message_id) BETWEEN 1 AND 200),
 witness_id uuid NOT NULL REFERENCES public.fair_witness_requests(witness_id),
 from_phone text NOT NULL, to_phone text NOT NULL, decision text NOT NULL CHECK(decision IN('accept','refuse')),
 received_at timestamptz NOT NULL, stored_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fair_witness_sms_receipts_witness ON public.fair_witness_sms_receipts(witness_id);
ALTER TABLE public.fair_witness_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_witness_sms_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fair_witness_requests,public.fair_witness_sms_receipts FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.fair_witness_requests,public.fair_witness_sms_receipts TO service_role;

-- Private boolean check needs auth.users; it never returns a person's phone to a caller.
CREATE FUNCTION public.fair_verified_phone(uid uuid, number text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM auth.users alive WHERE alive.id=uid AND alive.deleted_at IS NULL AND NOT coalesce(alive.is_anonymous,false)) AND (EXISTS(SELECT 1 FROM public.account_verified_phones p WHERE p.user_id=uid AND p.phone=number AND p.revoked_at IS NULL AND p.expires_at>now())
 OR EXISTS(SELECT 1 FROM auth.users u WHERE u.id=uid AND u.deleted_at IS NULL AND NOT coalesce(u.is_anonymous,false)
 AND u.phone_confirmed_at IS NOT NULL AND '+'||regexp_replace(u.phone,'[^0-9]','','g')=number))
$$;
CREATE FUNCTION public.fair_name_equal(a text,b text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 SELECT lower(regexp_replace(trim(coalesce(a,'')),'\s+',' ','g'))=lower(regexp_replace(trim(coalesce(b,'')),'\s+',' ','g')) AND length(trim(coalesce(a,'')))>=3
$$;
CREATE FUNCTION public.fair_witness_identity_current(wid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.fair_witness_requests q
 JOIN public.afroloc_witnesses w ON w.id=q.witness_id
 JOIN public.afroloc_records n ON n.id=q.neighbour_id AND n.user_id=w.witness_user_id AND n.code=w.witness_afro_id
 JOIN public.profiles p ON p.user_id=n.user_id
 WHERE w.id=wid AND public.fair_name_equal(q.full_name,p.full_name) AND public.fair_verified_phone(n.user_id,q.phone))
$$;
CREATE OR REPLACE FUNCTION public.fair_confirmed_count(rid uuid) RETURNS integer LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT count(DISTINCT w.witness_user_id)::int FROM public.afroloc_witnesses w
 JOIN public.fair_witness_requests q ON q.witness_id=w.id
 JOIN public.fair_witness_sms_receipts s ON s.provider_message_id=q.receipt_id AND s.witness_id=w.id
 WHERE w.afroloc_record_id=rid AND w.status='confirmed' AND w.confirmation_protocol='sms_validator_v3'
 AND q.state='approved' AND q.accepted_at IS NOT NULL AND s.decision='accept'
 AND q.reviewed_by<>w.witness_user_id AND public.fair_is_validator(q.reviewed_by,rid)
 AND public.fair_witness_identity_current(w.id) AND public.fair_witness_eligible(rid,q.neighbour_id)
$$;
CREATE FUNCTION public.guard_fair_witness_protocol() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM public.fair_address_enrolments WHERE record_id=OLD.afroloc_record_id)
  AND (NEW.id IS DISTINCT FROM OLD.id OR NEW.afroloc_record_id IS DISTINCT FROM OLD.afroloc_record_id
   OR NEW.witness_user_id IS DISTINCT FROM OLD.witness_user_id OR NEW.witness_afro_id IS DISTINCT FROM OLD.witness_afro_id
   OR NEW.confirmation_protocol IS DISTINCT FROM OLD.confirmation_protocol)
  THEN RAISE EXCEPTION 'A identidade e a morada de um testemunho registado não podem ser substituídas.'; END IF;
 IF EXISTS(SELECT 1 FROM public.fair_address_enrolments WHERE record_id=NEW.afroloc_record_id) THEN
  IF NEW.confirmation_protocol IS DISTINCT FROM 'sms_validator_v3' THEN RAISE EXCEPTION 'A feira exige identificação, aceitação por SMS e revisão oficial da testemunha.'; END IF;
  IF NEW.status='confirmed' AND NOT EXISTS(
   SELECT 1 FROM public.fair_witness_requests q JOIN public.fair_witness_sms_receipts s ON s.provider_message_id=q.receipt_id AND s.witness_id=q.witness_id
   WHERE q.witness_id=NEW.id AND q.state='approved' AND s.decision='accept' AND q.reviewed_by<>NEW.witness_user_id
   AND public.fair_is_validator(q.reviewed_by,NEW.afroloc_record_id)
   AND public.fair_witness_identity_current(NEW.id) AND public.fair_witness_eligible(NEW.afroloc_record_id,q.neighbour_id)
  ) THEN RAISE EXCEPTION 'O SMS não substitui a aprovação do validador oficial.'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_fair_witness_protocol BEFORE INSERT OR UPDATE ON public.afroloc_witnesses FOR EACH ROW EXECUTE FUNCTION public.guard_fair_witness_protocol();

CREATE FUNCTION public.fair_witness_view(wid uuid, actor uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('id',w.id,'code',w.witness_afro_id,'target_code',t.code,'target_name',tp.full_name,
 'full_name',q.full_name,'phone',q.phone,'status',q.state,'reference',q.reference,'reply_to',q.reply_to,
 'expires_at',q.expires_at,'expired',q.expires_at<now() AND q.state='awaiting_sms',
 'delivery_state',q.delivery_state,'accepted_at',q.accepted_at,'reviewed_at',q.reviewed_at,'review_notes',q.review_notes,
 'is_witness',actor=w.witness_user_id,'is_requester',actor=t.user_id,'can_review',actor=q.assigned_validator AND public.fair_is_validator(actor,t.id) AND actor<>w.witness_user_id,
 'identity_matches',public.fair_witness_identity_current(w.id),'eligible',public.fair_witness_eligible(t.id,q.neighbour_id),
 'distance_m',public.fair_distance(t.id,q.neighbour_id),
 'canonical_name',CASE WHEN actor=q.assigned_validator THEN np.full_name ELSE null END)
 FROM public.fair_witness_requests q JOIN public.afroloc_witnesses w ON w.id=q.witness_id
 JOIN public.afroloc_records t ON t.id=w.afroloc_record_id LEFT JOIN public.profiles tp ON tp.user_id=t.user_id
 LEFT JOIN public.afroloc_records n ON n.id=q.neighbour_id LEFT JOIN public.profiles np ON np.user_id=n.user_id
 WHERE w.id=wid AND (actor=t.user_id OR actor=w.witness_user_id OR (actor=q.assigned_validator AND actor<>w.witness_user_id AND public.fair_is_validator(actor,t.id)))
$$;

CREATE FUNCTION public.fair_witness_process(p_actor uuid,p_action text,p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE t public.afroloc_records%ROWTYPE; n public.afroloc_records%ROWTYPE; w public.afroloc_witnesses%ROWTYPE;
 q public.fair_witness_requests%ROWTYPE; result jsonb; phone_number text; decision text; vid uuid; wid uuid; stamp timestamptz;
BEGIN
 IF p_action='sms_receipt' THEN
  -- This action is only exposed by the separately authenticated provider webhook.
  SELECT * INTO q FROM public.fair_witness_requests WHERE reference=p_payload->>'reference';
  IF q.witness_id IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','unknown_reference'); END IF;
  SELECT * INTO w FROM public.afroloc_witnesses WHERE id=q.witness_id;
  SELECT * INTO t FROM public.afroloc_records WHERE id=w.afroloc_record_id FOR UPDATE;
  SELECT fq.* INTO q FROM public.fair_witness_requests fq WHERE fq.witness_id=q.witness_id FOR UPDATE;
  IF EXISTS(SELECT 1 FROM public.fair_witness_sms_receipts WHERE provider_message_id=p_payload->>'message_id') THEN RETURN jsonb_build_object('ok',true,'duplicate',true); END IF;
  stamp:=(p_payload->>'received_at')::timestamptz; decision:=p_payload->>'decision';
  IF q.state<>'awaiting_sms' OR q.expires_at IS NULL OR q.expires_at<=now() OR stamp IS NULL OR stamp<q.send_started_at-interval '5 minutes' OR stamp>now()+interval '5 minutes'
   OR q.phone IS DISTINCT FROM p_payload->>'from' OR q.reply_to IS DISTINCT FROM p_payload->>'to' OR decision NOT IN('accept','refuse') OR decision IS NULL
   OR NOT public.fair_witness_identity_current(w.id) OR length(coalesce(p_payload->>'message_id','')) NOT BETWEEN 1 AND 200
   THEN RETURN jsonb_build_object('ok',false,'reason','mismatch_or_expired'); END IF;
  INSERT INTO public.fair_witness_sms_receipts(provider_message_id,witness_id,from_phone,to_phone,decision,received_at)
  VALUES(p_payload->>'message_id',w.id,q.phone,q.reply_to,decision,stamp);
  UPDATE public.fair_witness_requests SET state=CASE WHEN decision='accept' THEN 'accepted_sms' ELSE 'refused_sms' END,
   accepted_at=CASE WHEN decision='accept' THEN now() ELSE NULL END,receipt_id=p_payload->>'message_id',updated_at=now() WHERE witness_id=w.id;
  IF decision='refuse' THEN UPDATE public.afroloc_witnesses SET status='rejected',rejection_reason='Recusado pela testemunha por SMS' WHERE id=w.id; END IF;
  INSERT INTO public.fair_verification_events(actor_id,record_id,action,details) VALUES(w.witness_user_id,t.id,'witness_sms_'||decision,jsonb_build_object('witness_id',w.id,'provider_message_id',p_payload->>'message_id'));
  RETURN jsonb_build_object('ok',true,'state',CASE WHEN decision='accept' THEN 'accepted_sms' ELSE 'refused_sms' END);
 END IF;
 IF p_actor IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Entre na sua conta.'); END IF;
 IF p_action='list' THEN
  result:=public.fair_verification(p_actor,'list','{}');
  result:=jsonb_set(result,'{addresses}',coalesce((SELECT jsonb_agg(a || jsonb_build_object('witnesses',coalesce((SELECT jsonb_agg(public.fair_witness_view(aw.id,p_actor) ORDER BY aw.created_at) FROM public.afroloc_witnesses aw JOIN public.fair_witness_requests aq ON aq.witness_id=aw.id WHERE aw.afroloc_record_id=(a->>'id')::uuid),'[]'::jsonb))) FROM jsonb_array_elements(result->'addresses') a),'[]'::jsonb));
  result:=jsonb_set(result,'{invitations}',coalesce((SELECT jsonb_agg(public.fair_witness_view(aw.id,p_actor)) FROM public.afroloc_witnesses aw JOIN public.fair_witness_requests aq ON aq.witness_id=aw.id WHERE aw.witness_user_id=p_actor),'[]'::jsonb));
  RETURN result || jsonb_build_object('witness_queue',coalesce((SELECT jsonb_agg(public.fair_witness_view(aw.id,p_actor)) FROM public.afroloc_witnesses aw JOIN public.fair_witness_requests aq ON aq.witness_id=aw.id WHERE aq.assigned_validator=p_actor AND p_actor<>aw.witness_user_id AND public.fair_is_validator(p_actor,aw.afroloc_record_id)),'[]'::jsonb));
 END IF;
 IF p_action='identify' THEN
  SELECT * INTO t FROM public.afroloc_records WHERE id=(p_payload->>'record_id')::uuid AND user_id=p_actor FOR UPDATE;
  IF t.id IS NULL OR NOT EXISTS(SELECT 1 FROM public.fair_address_enrolments WHERE record_id=t.id) THEN RETURN jsonb_build_object('ok',false,'error','Associe uma morada sua à feira.'); END IF;
  IF t.status::text IN('rejected','expired','revoked') OR EXISTS(SELECT 1 FROM public.fair_address_enrolments fe WHERE fe.record_id=t.id AND fe.approved_at IS NOT NULL) THEN RETURN jsonb_build_object('ok',false,'error','Este processo não está disponível para novas testemunhas.'); END IF;
  phone_number:=p_payload->>'phone';
  IF p_payload->>'consent' IS DISTINCT FROM 'true' OR length(trim(coalesce(p_payload->>'full_name',''))) NOT BETWEEN 3 AND 160 OR phone_number !~ '^\+244[0-9]{9}$' OR phone_number IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Indique o nome completo, o telefone e confirme o pedido.'); END IF;
  SELECT * INTO n FROM public.afroloc_records WHERE upper(code)=upper(trim(p_payload->>'code'));
  IF n.id IS NULL OR n.user_id=t.user_id OR n.country<>'AO' OR n.status::text NOT IN('verified','certified')
    OR NOT public.fair_verified_phone(n.user_id,phone_number)
    OR NOT EXISTS(SELECT 1 FROM public.profiles p WHERE p.user_id=n.user_id AND public.fair_name_equal(p.full_name,p_payload->>'full_name'))
    THEN RETURN jsonb_build_object('ok',false,'error','Nome, telefone confirmado e AFROLOC devem corresponder à mesma testemunha, com morada válida e distinta do requerente.'); END IF;
  SELECT * INTO w FROM public.afroloc_witnesses WHERE afroloc_record_id=t.id AND witness_user_id=n.user_id AND status<>'rejected' LIMIT 1;
  IF w.id IS NOT NULL THEN RETURN jsonb_build_object('ok',true,'existing',true,'witness_id',w.id); END IF;
  IF EXISTS(SELECT 1 FROM public.fair_witness_requests fq JOIN public.afroloc_witnesses fw ON fw.id=fq.witness_id WHERE fw.afroloc_record_id=t.id AND fw.status<>'rejected' AND fq.phone=phone_number) THEN RETURN jsonb_build_object('ok',false,'error','Cada testemunha deve usar um telefone distinto confirmado na sua conta.'); END IF;
  IF (SELECT count(*) FROM public.afroloc_witnesses WHERE afroloc_record_id=t.id AND status<>'rejected')>=3 THEN RETURN jsonb_build_object('ok',false,'error','Já foram indicadas três testemunhas.'); END IF;
  INSERT INTO public.afroloc_witnesses(afroloc_record_id,witness_user_id,witness_afro_id,status,confirmation_protocol) VALUES(t.id,n.user_id,n.code,'pending','sms_validator_v3') RETURNING id INTO wid;
  INSERT INTO public.fair_witness_requests(witness_id,neighbour_id,full_name,phone) VALUES(wid,n.id,trim(p_payload->>'full_name'),phone_number);
  INSERT INTO public.fair_verification_events(actor_id,record_id,action,details) VALUES(p_actor,t.id,'witness_identified',jsonb_build_object('witness_id',wid));
  RETURN jsonb_build_object('ok',true,'witness_id',wid,'state','identified','message','Identificação registada. A testemunha ainda não aceitou o pedido.');
 END IF;
 SELECT * INTO w FROM public.afroloc_witnesses WHERE id=(p_payload->>'witness_id')::uuid;
 SELECT * INTO t FROM public.afroloc_records WHERE id=w.afroloc_record_id FOR UPDATE;
 SELECT * INTO q FROM public.fair_witness_requests WHERE witness_id=w.id FOR UPDATE;
 IF q.witness_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Pedido indisponível.'); END IF;
 IF p_actor NOT IN(t.user_id,w.witness_user_id) AND NOT coalesce((p_actor=q.assigned_validator AND p_actor<>w.witness_user_id AND public.fair_is_validator(p_actor,t.id)),false) THEN RETURN jsonb_build_object('ok',false,'error','Sem acesso ao pedido.'); END IF;
 IF p_action='info' THEN RETURN coalesce(public.fair_witness_view(w.id,p_actor),'{}'::jsonb) || jsonb_build_object('ok',true); END IF;
 IF p_action='prepare_sms' THEN
  IF p_actor<>t.user_id THEN RETURN jsonb_build_object('ok',false,'error','Só o requerente pode enviar o pedido.'); END IF;
  IF q.state NOT IN('identified','awaiting_sms') THEN RETURN jsonb_build_object('ok',false,'error','O pedido já recebeu uma resposta.'); END IF;
  IF NOT public.fair_witness_identity_current(w.id) OR NOT public.fair_witness_eligible(t.id,q.neighbour_id) THEN RETURN jsonb_build_object('ok',false,'error','Confirme identidade, telefone e inspeções das moradas: até 500 m e mesmo condomínio, quando aplicável.'); END IF;
  SELECT reviewed_by INTO vid FROM public.fair_residence_reviews WHERE record_id=t.id;
  IF vid IS NULL OR vid=w.witness_user_id OR NOT public.fair_is_validator(vid,t.id) THEN RETURN jsonb_build_object('ok',false,'error','É necessário um validador oficial independente responsável pela residência.'); END IF;
  IF coalesce(p_payload->>'reply_to','') !~ '^\+[1-9][0-9]{7,14}$' THEN RETURN jsonb_build_object('ok',false,'error','Número institucional de receção indisponível.'); END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('fair-sms:'||p_actor::text,0));
  IF q.send_started_at>now()-interval '5 minutes' OR (SELECT count(*) FROM public.fair_verification_events WHERE actor_id=p_actor AND action='witness_sms_prepared' AND created_at>now()-interval '1 hour')>=10 THEN RETURN jsonb_build_object('ok',false,'error','Aguarde antes de reenviar o pedido.'); END IF;
  UPDATE public.fair_witness_requests SET state='awaiting_sms',assigned_validator=vid,reply_to=p_payload->>'reply_to',send_token=gen_random_uuid(),send_started_at=now(),expires_at=now()+interval '48 hours',delivery_state='sending',updated_at=now() WHERE witness_id=w.id RETURNING * INTO q;
  INSERT INTO public.fair_verification_events(actor_id,record_id,action,details) VALUES(p_actor,t.id,'witness_sms_prepared',jsonb_build_object('witness_id',w.id));
  RETURN jsonb_build_object('ok',true,'phone',q.phone,'reply_to',q.reply_to,'reference',q.reference,'send_token',q.send_token,'expires_at',q.expires_at,'target_code',t.code,'requester_name',(SELECT full_name FROM public.profiles WHERE user_id=t.user_id));
 ELSIF p_action='delivery' THEN
  IF p_actor<>t.user_id OR q.send_token IS DISTINCT FROM (p_payload->>'send_token')::uuid THEN RETURN jsonb_build_object('ok',false,'error','Envio indisponível.'); END IF;
  UPDATE public.fair_witness_requests SET delivery_state=CASE WHEN p_payload->>'accepted'='true' THEN 'provider_accepted' ELSE 'unconfirmed' END,provider_message_id=left(p_payload->>'message_id',200),updated_at=now() WHERE witness_id=w.id;
 ELSIF p_action='decide' THEN
  IF p_actor IS DISTINCT FROM q.assigned_validator OR p_actor IN(t.user_id,w.witness_user_id) OR NOT public.fair_is_validator(p_actor,t.id) THEN RETURN jsonb_build_object('ok',false,'error','Só o validador oficial responsável e independente pode decidir.'); END IF;
  IF q.state<>'accepted_sms' OR p_payload->>'consent' IS DISTINCT FROM 'true' OR p_payload->>'identity_checked' IS DISTINCT FROM 'true' OR length(trim(coalesce(p_payload->>'notes',''))) NOT BETWEEN 10 AND 2000 OR coalesce(p_payload->>'decision','') NOT IN('approve','reject') THEN RETURN jsonb_build_object('ok',false,'error','É necessária aceitação por SMS, conferência de identidade e decisão fundamentada.'); END IF;
  IF p_payload->>'decision'='approve' AND (NOT public.fair_witness_identity_current(w.id) OR NOT public.fair_witness_eligible(t.id,q.neighbour_id)) THEN RETURN jsonb_build_object('ok',false,'error','Identidade, telefone, distância ou condomínio não cumprem os requisitos atuais.'); END IF;
  UPDATE public.fair_witness_requests SET state=CASE WHEN p_payload->>'decision'='approve' THEN 'approved' ELSE 'rejected' END,reviewed_by=p_actor,reviewed_at=now(),review_notes=trim(p_payload->>'notes'),updated_at=now() WHERE witness_id=w.id;
  UPDATE public.afroloc_witnesses SET status=CASE WHEN p_payload->>'decision'='approve' THEN 'confirmed' ELSE 'rejected' END,confirmed_at=CASE WHEN p_payload->>'decision'='approve' THEN now() ELSE NULL END,signature='Aceitação SMS e revisão oficial: '||p_actor::text,rejection_reason=CASE WHEN p_payload->>'decision'='reject' THEN trim(p_payload->>'notes') ELSE NULL END WHERE id=w.id;
 ELSE RETURN jsonb_build_object('ok',false,'error','Operação desconhecida.'); END IF;
 INSERT INTO public.fair_verification_events(actor_id,record_id,action,details) VALUES(p_actor,t.id,'witness_'||p_action,jsonb_build_object('witness_id',w.id,'decision',p_payload->>'decision'));
 RETURN jsonb_build_object('ok',true);
END $$;
REVOKE ALL ON FUNCTION public.fair_verified_phone(uuid,text),public.fair_name_equal(text,text),public.fair_witness_identity_current(uuid),public.guard_fair_witness_protocol(),public.fair_witness_view(uuid,uuid),public.fair_witness_process(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fair_verified_phone(uuid,text),public.fair_name_equal(text,text),public.fair_witness_identity_current(uuid),public.fair_witness_view(uuid,uuid),public.fair_witness_process(uuid,text,jsonb) TO service_role;
