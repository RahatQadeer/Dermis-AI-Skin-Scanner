# Supabase (Postgres)

SQL migrations for Dermis user data, RLS, and server-only quota/deletion helpers.

## Layout

- `migrations/` — append-only SQL (never edit applied files).

## Apply locally

1. Create a Supabase project (or run `supabase start` with the [Supabase CLI](https://supabase.com/docs/guides/cli)).
2. From repo root:

```bash
supabase db push --workdir backend/supabase
```

Or run files in timestamp order in the Supabase SQL editor.

## Server-only functions

| Function             | Role           | Purpose                                      |
| -------------------- | -------------- | -------------------------------------------- |
| `consume_scan_quota` | `service_role` | Atomic quota check + increment (DERM-043)    |
| `delete_user_data`   | `service_role` | Purge app rows before auth delete (DERM-047) |
| `handle_new_user`    | trigger        | Profile + entitlement + usage on signup      |

Clients use the **anon/authenticated** key with RLS: read own scans/quota/plan; update profile; grant consents; manage routine. Scan inserts and quota writes stay on the backend with `service_role`.

## Quota day boundary

Pro daily reset uses **UTC calendar date** today. User timezone may move to profile in a later ticket.
