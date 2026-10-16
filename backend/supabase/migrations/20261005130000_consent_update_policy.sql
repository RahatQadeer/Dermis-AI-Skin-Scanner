-- DERM-048: allow users to revoke their own consents (set revoked_at)
create policy user_consents_update_own on public.user_consents
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant update on public.user_consents to authenticated;
