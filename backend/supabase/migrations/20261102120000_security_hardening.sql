-- Security hardening (2026-11 audit). Additive only: no data is dropped.

-- ---------------------------------------------------------------------------
-- 1. SECURITY DEFINER helpers must not be callable through PostgREST by
--    clients. Supabase's default privileges grant EXECUTE on new functions to
--    anon/authenticated directly, which `revoke ... from public` does not
--    remove — so /rest/v1/rpc/delete_user_data was callable with the anon key.
-- ---------------------------------------------------------------------------
revoke execute on function public.consume_scan_quota(uuid) from anon, authenticated;
revoke execute on function public.delete_user_data(uuid) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Pro is only effective until pro_expires_at. A missed EXPIRATION/REFUND
--    webhook must not leave a user on Pro forever.
-- ---------------------------------------------------------------------------
create or replace function public.consume_scan_quota(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan public.plan_tier;
  v_expires timestamptz;
  v_lifetime integer;
  v_daily integer;
  v_window date;
  v_today date := (timezone('utc', now()))::date;
  v_remaining integer;
  v_free_limit constant integer := 1;
  v_pro_daily_limit constant integer := 5;
begin
  select e.plan, e.pro_expires_at
  into v_plan, v_expires
  from public.entitlements e
  where e.user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('allowed', false, 'remaining', 0, 'reason', 'no_entitlement');
  end if;

  if v_plan = 'pro' and v_expires is not null and v_expires <= now() then
    v_plan := 'free';
  end if;

  select u.lifetime_scan_count, u.daily_scan_count, u.daily_window_date
  into v_lifetime, v_daily, v_window
  from public.scan_usage u
  where u.user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('allowed', false, 'remaining', 0, 'reason', 'no_usage_row');
  end if;

  if v_plan = 'free' then
    v_remaining := greatest(0, v_free_limit - v_lifetime);
    if v_remaining <= 0 then
      return jsonb_build_object('allowed', false, 'remaining', 0, 'reason', 'free_limit');
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
    return jsonb_build_object('allowed', false, 'remaining', 0, 'reason', 'daily_limit');
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

revoke all on function public.consume_scan_quota(uuid) from public, anon, authenticated;
grant execute on function public.consume_scan_quota(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 3. RevenueCat event ordering: remember the newest applied event time so a
--    late, older EXPIRATION/RENEWAL cannot overwrite a newer state.
-- ---------------------------------------------------------------------------
alter table public.entitlements
  add column if not exists revenuecat_event_at_ms bigint;

-- ---------------------------------------------------------------------------
-- 4. Durable signed-out account deletion requests (web form). The form does
--    not prove email ownership, so requests are recorded and completed only
--    after the owner confirms. Service role only — no client access.
-- ---------------------------------------------------------------------------
create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid,
  status text not null check (status in ('pending_verification', 'not_found', 'completed', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists account_deletion_requests_email_created_idx
  on public.account_deletion_requests (email, created_at desc);

alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from anon, authenticated;
grant all on public.account_deletion_requests to service_role;
