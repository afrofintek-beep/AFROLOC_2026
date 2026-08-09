-- ─────────────────────────────────────────────────────────────
-- Resolução pública de um código AFROLOC no catálogo da YAMIOO.
--
-- APLICAR NO SUPABASE DA YAMIOO (projeto oltqppftxvhnkzqshsqx), NÃO no do AFROLOC.
--
-- A tabela `entities` não é legível diretamente pelo anon (RLS). Esta função
-- SECURITY DEFINER resolve um código → estabelecimento PÚBLICO (status=active,
-- privacy=public), devolvendo nome + localização + coordenadas, para a Consulta
-- AFROLOC poder mostrar o local e abrir o Radar até lá.
-- ─────────────────────────────────────────────────────────────

-- Índice funcional para a procura por código ser INSTANTÂNEA (a `entities` é
-- enorme — POIs do OSM — e sem índice o filtro faz varrimento completo/timeout).
create index if not exists entities_afroloc_upper_idx
  on public.entities (upper(btrim(afroloc_code)));

create or replace function public.yamioo_public_lookup(p_code text)
returns table (
  afroloc_code text,
  title        text,
  city         text,
  country      text,
  type         text,
  url          text,
  lat          double precision,
  lng          double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.afroloc_code,
    e.title,
    e.city,
    e.country,
    e.type,
    e.url,
    e.lat::double precision,
    e.lng::double precision
  from public.entities e
  where upper(btrim(e.afroloc_code)) = upper(btrim(p_code))
    and e.status = 'active'
    and e.privacy = 'public'
  limit 1;
$$;

revoke all on function public.yamioo_public_lookup(text) from public;
grant execute on function public.yamioo_public_lookup(text) to anon, authenticated;
