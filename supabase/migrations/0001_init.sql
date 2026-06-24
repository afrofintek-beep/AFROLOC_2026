-- AFROLOC — esquema inicial (Fase 1: núcleo do cidadão)
-- Tabelas: profiles (perfil do cidadão) + addresses (moradas AFROLOC).
-- Segurança: RLS ativo — cada utilizador só acede aos seus próprios dados.

-- ============================================================
-- PROFILES — um por utilizador autenticado (auth.users)
-- ============================================================
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  name             text,
  phone            text,
  language         text        not null default 'Português',
  level            int         not null default 1,          -- nível de autoridade 1–5
  level_title      text        not null default 'Cidadão',
  auth_confidence  int         not null default 0,          -- 0–100
  jurisdiction     text,
  reputation_tier  text        not null default 'Bronze',   -- Bronze | Prata | Ouro
  reputation_score int         not null default 0,          -- 0–100
  testimonials     int         not null default 0,
  frauds           int         not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- ADDRESSES — moradas AFROLOC de cada cidadão
-- ============================================================
create table if not exists public.addresses (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid        not null references auth.users (id) on delete cascade,
  label             text        not null default 'Casa',
  code              text        not null unique,             -- CC-PROV-MUN-COM-BAI-G10-X-Y-NNNN
  country_code      text        not null default 'AO',
  qgsq_cell         text,
  nomenclature_code text,
  sq_code           text,
  subdivision_type  text,
  cell_type         text,
  grid_m            int,
  sequence          int,
  address_line      text,
  location_line     text,
  latitude          double precision,
  longitude         double precision,
  accuracy          double precision,
  status            text        not null default 'RASCUNHO', -- RASCUNHO | PENDENTE | ACTIVO
  ats               int         not null default 0,          -- 0–100
  ats_label         text,
  ats_factors       jsonb       not null default '[]'::jsonb,
  validator         text,
  cycle_months      int         not null default 6,
  verified_at       timestamptz,
  next_verify_at    timestamptz,
  issued_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists addresses_owner_idx on public.addresses (owner_id);
create index if not exists addresses_code_idx  on public.addresses (code);

-- ============================================================
-- updated_at automático
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists addresses_touch on public.addresses;
create trigger addresses_touch before update on public.addresses
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Criar perfil automaticamente quando um utilizador se regista
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.addresses enable row level security;

-- profiles: cada um vê e edita o seu próprio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- addresses: cada cidadão só acede às suas próprias moradas
drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses
  for select using (auth.uid() = owner_id);

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses
  for insert with check (auth.uid() = owner_id);

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses
  for update using (auth.uid() = owner_id);

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses
  for delete using (auth.uid() = owner_id);
