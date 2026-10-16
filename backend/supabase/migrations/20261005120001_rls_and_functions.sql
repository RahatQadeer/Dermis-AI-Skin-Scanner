-- DERM-040: RLS on all user tables + quota / deletion helpers (service_role).

alter table public.profiles enable row level security;
alter table public.entitlements enable row level security;
alter table public.scan_usage enable row level security;
alter table public.scans enable row level security;
alter table public.user_consents enable row level security;
alter table public.routine_steps enable row level security;
alter table public.routine_step_completions enable row level security;

-- profiles
create policy profiles_select_own on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- entitlements: read-only for clients; webhook uses service_role
create policy entitlements_select_own on public.entitlements
  for select
  to authenticated
  using (user_id = auth.uid());

-- scan_usage: read-only for clients
create policy scan_usage_select_own on public.scan_usage
  for select
  to authenticated
  using (user_id = auth.uid());

-- scans: read-only for clients; pipeline inserts via service_role
create policy scans_select_own on public.scans
  for select
  to authenticated
  using (user_id = auth.uid());

-- consents: user may grant and read own history
create policy user_consents_select_own on public.user_consents
  for select
  to authenticated
  using (user_id = auth.uid());

create policy user_consents_insert_own on public.user_consents
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- routine
create policy routine_steps_select_own on public.routine_steps
  for select
  to authenticated
  using (user_id = auth.uid());

create policy routine_steps_insert_own on public.routine_steps
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy routine_steps_update_own on public.routine_steps
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy routine_steps_delete_own on public.routine_steps
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy routine_completions_select_own on public.routine_step_completions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy routine_completions_insert_own on public.routine_step_completions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy routine_completions_delete_own on public.routine_step_completions
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Atomic quota consume (mirrors packages/domain/src/quota.ts)
-- Calendar day boundary: UTC date (DERM-043 may add profile timezone).
-- ---------------------------------------------------------------------------
create or replace function public.consume_scan_quota(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan public.plan_tier;
  v_lifetime integer;
  v_daily integer;
  v_window date;
  v_today date := (timezone('utc', now()))::date;
  v_remaining integer;
  v_free_limit constant integer := 1;
  v_pro_daily_limit constant integer := 5;
begin
  select e.plan
  into v_plan
  from public.entitlements e
  where e.user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reason', 'no_entitlement'
    );
  end if;

  select u.lifetime_scan_count, u.daily_scan_count, u.daily_window_date
  into v_lifetime, v_daily, v_window
  from public.scan_usage u
  where u.user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reason', 'no_usage_row'
    );
  end if;

  if v_plan = 'free' then
    v_remaining := greatest(0, v_free_limit - v_lifetime);
    if v_remaining <= 0 then
      return jsonb_build_object(
        'allowed', false,
        'remaining', 0,
        'reason', 'free_limit'
      );
    end if;

    update public.scan_usage
    set lifetime_scan_count = lifetime_scan_count + 1
    where user_id = p_user_id;

    return jsonb_build_object('allowed', true, 'remaining', v_remaining - 1);
  end if;

  if v_window is distinct from v_today then
    update public.scan_usage
    set daily_scan_count = 0, daily_window_date = v_today
    where user_id = p_user_id;
    v_daily := 0;
  end if;

  v_remaining := greatest(0, v_pro_daily_limit - v_daily);
  if v_remaining <= 0 then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reason', 'daily_limit'
    );
  end if;

  update public.scan_usage
  set
    daily_scan_count = daily_scan_count + 1,
    daily_window_date = v_today,
    lifetime_scan_count = lifetime_scan_count + 1
  where user_id = p_user_id;

  return jsonb_build_object('allowed', true, 'remaining', v_remaining - 1);
end;
$$;

revoke all on function public.consume_scan_quota(uuid) from public;
grant execute on function public.consume_scan_quota(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Full user data purge (auth.users delete is separate — DERM-047)
-- ---------------------------------------------------------------------------
create or replace function public.delete_user_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.routine_step_completions where user_id = p_user_id;
  delete from public.routine_steps where user_id = p_user_id;
  delete from public.user_consents where user_id = p_user_id;
  delete from public.scans where user_id = p_user_id;
  delete from public.scan_usage where user_id = p_user_id;
  delete from public.entitlements where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;
end;
$$;

revoke all on function public.delete_user_data(uuid) from public;
grant execute on function public.delete_user_data(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Grants for authenticated client reads / profile updates
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated, service_role;

grant select, update on public.profiles to authenticated;
grant select on public.entitlements, public.scan_usage, public.scans to authenticated;
grant select, insert on public.user_consents to authenticated;
grant select, insert, update, delete on public.routine_steps to authenticated;
grant select, insert, delete on public.routine_step_completions to authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
