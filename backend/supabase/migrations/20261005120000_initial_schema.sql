-- DERM-040: core entities (Supabase Postgres). Aligns with @dermis/domain Zod schemas.

create extension if not exists "pgcrypto";

-- Enums mirror packages/domain/src/schemas/*.ts
create type public.plan_tier as enum ('free', 'pro');

create type public.skin_type_t as enum ('oily', 'combination', 'dry', 'normal');

create type public.skin_tone_t as enum ('typeI_II', 'typeIII', 'typeIV', 'typeV_VI');

create type public.sensitivity_t as enum ('rarely', 'sometimes', 'easily');

create type public.consent_type_t as enum ('face_analysis', 'data_sharing', 'terms');

create type public.routine_period_t as enum ('am', 'pm');

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  skin_type public.skin_type_t,
  skin_tone public.skin_tone_t,
  sensitivity public.sensitivity_t,
  priority_concerns jsonb not null default '[]'::jsonb,
  notify_scan_reminders boolean not null default false,
  notify_product_updates boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_priority_concerns_array check (jsonb_typeof(priority_concerns) = 'array')
);

create index profiles_updated_at_idx on public.profiles (updated_at);

-- ---------------------------------------------------------------------------
-- entitlements (server-authoritative plan)
-- ---------------------------------------------------------------------------
create table public.entitlements (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  plan public.plan_tier not null default 'free',
  pro_expires_at timestamptz,
  revenuecat_app_user_id text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- scan_usage (quota counters — writes via service / SECURITY DEFINER only)
-- ---------------------------------------------------------------------------
create table public.scan_usage (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  lifetime_scan_count integer not null default 0,
  daily_scan_count integer not null default 0,
  daily_window_date date,
  updated_at timestamptz not null default now(),
  constraint scan_usage_lifetime_nonneg check (lifetime_scan_count >= 0),
  constraint scan_usage_daily_nonneg check (daily_scan_count >= 0)
);

-- ---------------------------------------------------------------------------
-- scans (scores as JSONB per architecture-db.mdc)
-- ---------------------------------------------------------------------------
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  taken_at timestamptz not null,
  index_score smallint not null,
  concerns jsonb not null,
  zones jsonb not null,
  weights jsonb not null,
  formula_version text not null,
  model text not null,
  prompt_version text not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  constraint scans_index_score_range check (index_score between 0 and 100),
  constraint scans_idempotency_key_len check (char_length(idempotency_key) between 8 and 128),
  constraint scans_concerns_object check (jsonb_typeof(concerns) = 'object'),
  constraint scans_zones_object check (jsonb_typeof(zones) = 'object'),
  constraint scans_weights_object check (jsonb_typeof(weights) = 'object')
);

create unique index scans_user_idempotency_uidx on public.scans (user_id, idempotency_key);

create index scans_user_taken_at_idx on public.scans (user_id, taken_at desc);

-- ---------------------------------------------------------------------------
-- user_consents (versioned grants; face_analysis required before Gemini)
-- ---------------------------------------------------------------------------
create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  consent_type public.consent_type_t not null,
  version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint user_consents_version_nonempty check (char_length(version) > 0)
);

create index user_consents_user_type_idx on public.user_consents (user_id, consent_type, granted_at desc);

-- ---------------------------------------------------------------------------
-- routine (DERM-046 API will use these tables)
-- ---------------------------------------------------------------------------
create table public.routine_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period public.routine_period_t not null,
  sort_order integer not null,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_steps_label_nonempty check (char_length(trim(label)) > 0),
  constraint routine_steps_sort_nonneg check (sort_order >= 0)
);

create unique index routine_steps_user_period_order_uidx
  on public.routine_steps (user_id, period, sort_order);

create table public.routine_step_completions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  step_id uuid not null references public.routine_steps (id) on delete cascade,
  completed_on date not null,
  primary key (user_id, step_id, completed_on)
);

-- ---------------------------------------------------------------------------
-- signup bootstrap
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.entitlements (user_id) values (new.id);
  insert into public.scan_usage (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- touch updated_at on profile / routine edits
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger routine_steps_set_updated_at
  before update on public.routine_steps
  for each row
  execute function public.set_updated_at();

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row
  execute function public.set_updated_at();

create trigger scan_usage_set_updated_at
  before update on public.scan_usage
  for each row
  execute function public.set_updated_at();
