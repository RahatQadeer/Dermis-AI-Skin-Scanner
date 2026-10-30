-- AI skincare assistant: per-user daily message cap (Pro feature).
-- Messages are not stored; only a counter per UTC day. Service role only.

create table if not exists public.assistant_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  usage_date date not null,
  message_count integer not null default 0 check (message_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.assistant_usage enable row level security;
revoke all on public.assistant_usage from anon, authenticated;
grant all on public.assistant_usage to service_role;

-- Atomic check-and-increment: concurrent messages cannot exceed p_limit.
create or replace function public.consume_assistant_message(p_user_id uuid, p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (timezone('utc', now()))::date;
  v_count integer;
begin
  insert into public.assistant_usage (user_id, usage_date, message_count)
  values (p_user_id, v_today, 0)
  on conflict (user_id, usage_date) do nothing;

  select message_count into v_count
  from public.assistant_usage
  where user_id = p_user_id and usage_date = v_today
  for update;

  if v_count >= p_limit then
    return jsonb_build_object('allowed', false, 'remaining', 0);
  end if;

  update public.assistant_usage
  set message_count = message_count + 1
  where user_id = p_user_id and usage_date = v_today;

  return jsonb_build_object('allowed', true, 'remaining', p_limit - v_count - 1);
end;
$$;

revoke all on function public.consume_assistant_message(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_assistant_message(uuid, integer) to service_role;
