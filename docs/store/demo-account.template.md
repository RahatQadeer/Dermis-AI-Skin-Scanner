# Demo account template (App Review / Play review)

**Do not commit real passwords.** Copy this file privately (1Password / console notes) when staging auth is live.

| Field       | Value                                                 |
| ----------- | ----------------------------------------------------- |
| Environment | `TODO(spec)` staging API base (`EXPO_PUBLIC_API_URL`) |
| Email       | `TODO(spec)`                                          |
| Password    | `TODO(spec)` — store outside git                      |
| Auth type   | Email / Apple / Google — `TODO(spec)`                 |
| Entitlement | Free or Pro sandbox — `TODO(spec)`                    |
| RevenueCat  | Sandbox Apple/Google tester accounts — `TODO(spec)`   |

## Reviewer path

1. Launch app → complete / skip onboarding as configured.
2. Sign in with the credentials above (requires Supabase/production auth — not memory `user:` tokens).
3. Grant AI consent (Google Gemini) before first scan.
4. Optional: restore purchases on paywall if testing Pro.
5. Profile → confirm Privacy / delete-account path is reachable.

## Notes

- Memory/dev tokens (`createMemoryAccessToken`) are **not** valid for store review against a Supabase API (see `security-audit.md`).
- Public deletion form uses a separate confirmation phrase — document if reviewers must test it: `TODO(spec)`.
