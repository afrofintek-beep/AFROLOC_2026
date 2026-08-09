-- ─────────────────────────────────────────────────────────────
-- Consulta pública de um AFROLOC por código — sem dados pessoais.
--
-- `afroloc_records` está protegida por RLS (dono-apenas; as policies chamam
-- has_role, que o anon não pode executar). Para a consulta pública funcionar
-- sem expor a tabela, esta função corre como SECURITY DEFINER (privilégios do
-- dono) mas devolve APENAS colunas NÃO pessoais e só moradas divulgáveis
-- (approved/verified/certified). Nunca titular, nunca coordenadas, nunca
-- rua/número/fração.
--
-- Aplicar no projeto Supabase do AFROLOC (ljcx) — SQL Editor ou Management API.
--
-- Resolve por `code` OU por `legacy_code`: assim, depois da migração de
-- nomenclatura (AO-LUA → AO-LDA por extenso), os QRs/partilhas já feitos com o
-- código ANTIGO continuam a resolver (o antigo fica guardado em legacy_code).
-- ─────────────────────────────────────────────────────────────

-- Coluna do código antigo (idempotente) — para o fallback abaixo funcionar mesmo
-- antes de correres a migração de nomenclatura.
alter table public.afroloc_records add column if not exists legacy_code text;

create or replace function public.afroloc_public_lookup(p_code text)
returns table (
  code                text,
  provincia           text,
  municipio           text,
  status              text,
  ats_score           numeric,
  certification_level integer,
  last_verified_at    timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.code,
    r.level1_name as provincia,
    r.level2_name as municipio,
    r.status,
    r.ats_score,
    r.certification_level,
    r.last_verified_at
  from public.afroloc_records r
  where (upper(btrim(r.code)) = upper(btrim(p_code))
         or upper(btrim(r.legacy_code)) = upper(btrim(p_code)))
    and r.status in ('approved', 'verified', 'certified')
  limit 1;
$$;

-- Só chamável pela função (nunca acesso direto à tabela).
revoke all on function public.afroloc_public_lookup(text) from public;
grant execute on function public.afroloc_public_lookup(text) to anon, authenticated;
