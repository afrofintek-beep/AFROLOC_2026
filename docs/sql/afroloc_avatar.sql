-- ─────────────────────────────────────────────────────────────
-- Foto de perfil — backend (aplicar no Supabase do AFROLOC / ljcx).
--
-- 1) Coluna no perfil.
-- 2) Bucket de Storage público "avatars".
-- 3) Políticas: cada utilizador gere a SUA pasta ({user_id}/…); leitura pública.
-- ─────────────────────────────────────────────────────────────

-- 1) coluna
alter table public.profiles
  add column if not exists avatar_url text;

-- 2) bucket público
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 3) políticas de acesso ao Storage (storage.objects)
--    (se já existirem com estes nomes, apaga-as antes de recriar)
create policy "avatars_owner_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_public_read"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

-- Alternativa ao passo 2/3: criar o bucket "avatars" (Public) no painel
-- Supabase → Storage, e as políticas no editor de políticas do bucket.
