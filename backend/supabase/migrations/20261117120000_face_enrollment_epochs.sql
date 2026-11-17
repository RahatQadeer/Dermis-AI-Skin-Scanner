-- Face enrollment epochs: each "add face" starts a new series.
-- Old scans keep their enrollment id so Progress can show a "New face" divider
-- without deleting history. Active match still uses face_references (one row / user).

alter table public.face_references
  add column if not exists enrollment_id uuid not null default gen_random_uuid();

alter table public.scans
  add column if not exists face_enrollment_id uuid;

comment on column public.face_references.enrollment_id is
  'Active face series id. Rotates when the user adds a new face; old scans keep prior ids.';
comment on column public.scans.face_enrollment_id is
  'Face series that produced this scan. Null only for legacy rows before backfill.';

-- Attach existing scans to the account's current enrollment (single series so far).
update public.scans s
set face_enrollment_id = fr.enrollment_id
from public.face_references fr
where s.user_id = fr.user_id
  and s.face_enrollment_id is null;

-- Account deletion: explicitly purge face + assistant usage (do not rely on cascade alone).
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
  delete from public.assistant_usage where user_id = p_user_id;
  delete from public.face_references where user_id = p_user_id;
  delete from public.entitlements where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;
end;
$$;

revoke all on function public.delete_user_data(uuid) from public;
grant execute on function public.delete_user_data(uuid) to service_role;
