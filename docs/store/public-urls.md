# Public URLs for store forms (DERM-069)

Fill production HTTPS values before App Store / Play submission. Empty = blocking.

| Purpose                   | Env / source                                | Production value            |
| ------------------------- | ------------------------------------------- | --------------------------- |
| Privacy Policy            | `EXPO_PUBLIC_PRIVACY_URL`                   | `TODO(spec)`                |
| Terms of Use              | `EXPO_PUBLIC_TERMS_URL`                     | `TODO(spec)`                |
| Support                   | Store console + optional future in-app link | `TODO(spec)`                |
| Marketing (optional)      | Store console only                          | `TODO(spec)` or N/A         |
| Account deletion (public) | Deployed API `GET {API}/delete-account`     | `TODO(spec)` full HTTPS URL |

## App wiring today

- Privacy / Terms: mobile env → paywall, auth footer, privacy screen (`hasLegalUrls` requires https).
- Deletion page: `backend/src/http/deleteAccountPage.ts` (relative to API host).
- Support: **not** in the Expo bundle yet — console field only until product specifies in-app placement.

## Related

`.env.example` documents Privacy/Terms. Demo account: `demo-account.template.md`.
