-- ─────────────────────────────────────────────────────────────
-- Migração da NOMENCLATURA dos códigos AFROLOC já gravados.
--
-- Reconstrói o prefixo a partir das DIVISÕES OFICIAIS (province code + MUNICÍPIO
-- POR EXTENSO + comuna/GEN), MANTENDO a grelha X/Y do codec (de G10/G25 em diante
-- — inclui o sufixo de sequência, ex.: -0001). É a MESMA regra do createReal.
--   Ex.: AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001
--      → AO-LDA-BELAS-RAMIROS-G10-X6AUQ-Y49HV-0001
--
-- APLICAR NO SUPABASE DO AFROLOC (ljcx). NÃO APAGA NADA (guarda o antigo em
-- `legacy_code`; só altera onde muda; não mexe em colisões).
--
-- ⚠️ O código é a IDENTIDADE pública: QRs/partilhas já feitos com o código antigo
--    deixam de resolver pelo novo. Corre o PASSO 1 e revê ANTES do PASSO 2.
-- ─────────────────────────────────────────────────────────────

-- Coluna de segurança para o código antigo (idempotente).
alter table public.afroloc_records add column if not exists legacy_code text;

-- ══ PASSO 1 — REVISÃO (dry-run). Só lê. Confere a coluna "novo" e "colisoes". ══
with calc as (
  select
    r.id,
    r.code as atual,
    coalesce(r.country, 'AO') || '-'
      -- província: último segmento do level1_code (ex.: AO-LDA → LDA)
      || upper(reverse(split_part(reverse(coalesce(r.level1_code, '')), '-', 1))) || '-'
      -- município POR EXTENSO (level2_name; recurso: último segmento do level2_code)
      || coalesce(nullif(upper(regexp_replace(normalize(coalesce(r.level2_name, ''), NFKD), '[^A-Za-z0-9]', '', 'g')), ''),
                  upper(reverse(split_part(reverse(coalesce(r.level2_code, '')), '-', 1))), 'GEN') || '-'
      -- comuna POR EXTENSO, ou GEN
      || coalesce(nullif(upper(regexp_replace(normalize(coalesce(r.level3_name, ''), NFKD), '[^A-Za-z0-9]', '', 'g')), ''), 'GEN') || '-'
      -- grelha X/Y do codec (intacta)
      || coalesce(substring(r.code from 'G[12]0-.*'), '') as novo
  from public.afroloc_records r
)
select id, atual, novo,
       (atual is distinct from novo) as muda,
       count(*) over (partition by novo) as colisoes
from calc
order by muda desc, colisoes desc, novo;

-- ══ PASSO 2 — APLICAR (só depois de reveres o passo 1). Descomenta e corre. ══
-- Guarda o antigo, muda só o que difere, e IGNORA colisões (colisoes > 1).
--
-- with calc as (
--   select
--     r.id, r.code as atual,
--     coalesce(r.country, 'AO') || '-'
--       || upper(reverse(split_part(reverse(coalesce(r.level1_code, '')), '-', 1))) || '-'
--       || coalesce(nullif(upper(regexp_replace(normalize(coalesce(r.level2_name, ''), NFKD), '[^A-Za-z0-9]', '', 'g')), ''),
--                   upper(reverse(split_part(reverse(coalesce(r.level2_code, '')), '-', 1))), 'GEN') || '-'
--       || coalesce(nullif(upper(regexp_replace(normalize(coalesce(r.level3_name, ''), NFKD), '[^A-Za-z0-9]', '', 'g')), ''), 'GEN') || '-'
--       || coalesce(substring(r.code from 'G[12]0-.*'), '') as novo
--   from public.afroloc_records r
-- ),
-- flagged as (
--   select id, atual, novo, count(*) over (partition by novo) as colisoes from calc
-- )
-- update public.afroloc_records r
--   set legacy_code = coalesce(r.legacy_code, r.code),
--       code = f.novo
--   from flagged f
--   where f.id = r.id
--     and f.atual is distinct from f.novo
--     and f.colisoes = 1;

-- Reverter (se precisares): repõe o código a partir do legacy_code.
--   update public.afroloc_records set code = legacy_code
--   where legacy_code is not null and legacy_code <> code;
