-- Face identity reference (approach D2): per-user embedding for on-device
-- matching before each scan. Stores only the non-image vector; the raw face
-- photo is never persisted. User-scoped via RLS (no service role needed).

create table public.face_references (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  embedding real[] not null,
  dim smallint not null,
  model_version text not null,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint face_references_dim_range check (dim between 1 and 1024),
  constraint face_references_embedding_len check (array_length(embedding, 1) = dim),
  constraint face_references_model_version_nonempty check (char_length(trim(model_version)) > 0)
);

alter table public.face_references enable row level security;

create policy face_references_select_own on public.face_references
  for select
  to authenticated
  using (user_id = auth.uid());

create policy face_references_insert_own on public.face_references
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy face_references_update_own on public.face_references
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.face_references to authenticated;

create trigger face_references_set_updated_at
  before update on public.face_references
  for each row
  execute function public.set_updated_at();
