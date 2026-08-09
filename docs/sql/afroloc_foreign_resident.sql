-- ─────────────────────────────────────────────────────────────
-- Colunas para residente estrangeiro em `afroloc_records` (opcional).
--
-- A ligação da VALIDADE (próxima verificação = fim da autorização) já funciona
-- sem estas colunas, via `next_verification_due` (a app preenche-o na criação).
-- Estas colunas servem para GUARDAR também o passaporte e a autorização de
-- residência no próprio registo. Depois de aplicar, avisa que ligo o insert da
-- app (createReal.ts) para gravar estes campos.
--
-- Aplicar no Supabase do AFROLOC (ljcx).
-- ─────────────────────────────────────────────────────────────

alter table public.afroloc_records
  add column if not exists nationality             text,
  add column if not exists passport_number         text,
  add column if not exists passport_expiry         text,        -- "AAAA-MM"
  add column if not exists residence_permit_type   text,
  add column if not exists residence_permit_number text,
  add column if not exists residence_valid_until    date;

comment on column public.afroloc_records.residence_valid_until is
  'Fim da autorização de residência do estrangeiro; a validade da AFROLOC acompanha esta data.';
