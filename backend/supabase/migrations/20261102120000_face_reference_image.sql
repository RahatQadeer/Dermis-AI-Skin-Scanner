-- Store the register selfie (private, RLS) so scans compare photo-to-photo
-- with the same server embedder — never trust a client-claimed vector alone.

alter table public.face_references
  add column if not exists reference_jpeg text;

alter table public.face_references
  add column if not exists face_box_json jsonb;

comment on column public.face_references.reference_jpeg is
  'Base64 JPEG of the enrolled face (account-bound). Used only for identity match.';
comment on column public.face_references.face_box_json is
  'Normalized face box in the enrolled JPEG: {xMin,yMin,width,height}.';
