# Dermis backend

Epic 3: API handlers, services, repositories, adapters, and Supabase migrations.

## Package (`@dermis/backend`)

Layering: **handlers → services → repositories** (+ **AuthPort** / webhook secret).

| Route                              | Method       | Auth                     | Notes                                          |
| ---------------------------------- | ------------ | ------------------------ | ---------------------------------------------- |
| `/`                                | GET          | no                       | Service info (Render root check)               |
| `/health`                          | GET          | no                       | Liveness                                       |
| `/v1/auth/me`                      | GET          | user Bearer              | Validates access token                         |
| `/v1/profile`                      | GET          | user Bearer              | Read profile (creates empty row if needed)     |
| `/v1/profile`                      | POST         | user Bearer              | Create skin profile (409 if already set)       |
| `/v1/profile`                      | PATCH        | user Bearer              | Partial update                                 |
| `/v1/profile`                      | DELETE       | user Bearer              | Clears skin fields (account delete = 047)      |
| `/v1/webhooks/revenuecat`          | POST         | RevenueCat shared secret | Upserts `entitlements`; idempotent             |
| `/v1/quota`                        | GET          | user Bearer              | Remaining scans + plan                         |
| `/v1/scans`                        | GET, POST    | user Bearer              | List scans / create scan (fake/Gemini)         |
| `/v1/routine`                      | GET/PUT      | user Bearer              | List / replace AM+PM steps                     |
| `/v1/routine/steps`                | POST         | user Bearer              | Add step                                       |
| `/v1/routine/steps/:id`            | PATCH/DELETE | user Bearer              | Edit / remove step                             |
| `/v1/routine/steps/:id/completion` | PUT          | user Bearer              | Mark done for date (UTC)                       |
| `/v1/settings`                     | GET/PATCH    | user Bearer              | Notification toggles                           |
| `/v1/account/export`               | GET          | user Bearer              | JSON export of associated data                 |
| `/v1/account`                      | DELETE       | user Bearer              | Body `{ confirmation: "DELETE" }`              |
| `/delete-account`                  | GET          | no                       | Public HTML deletion form                      |
| `/v1/public/deletion-requests`     | POST         | no                       | `{ email, confirmation: "DELETE MY ACCOUNT" }` |
| `/v1/consents`                     | GET/POST     | user Bearer              | List / grant or revoke (`granted` bool)        |
| `/v1/consents/status`              | GET          | user Bearer              | Face-analysis gate for scans                   |

Scans require active `face_analysis` consent at version `face-analysis-v1` (403 `consent_required` otherwise).

### Local

Put secrets in repo-root `.env.local` (gitignored). `npm run start` loads it via Node `--env-file-if-exists`.

```bash
# From repo root — reads ../.env.local from the backend package
npm run start --workspace=@dermis/backend
# User auth (memory): Authorization: Bearer user:<uuid>[:email]
# Webhook:    Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET or dev default>
# Kill switch: SCAN_PIPELINE_DISABLED=1
```

With Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, plus for webhooks/quota writes `SUPABASE_SERVICE_ROLE_KEY` + `REVENUECAT_WEBHOOK_SECRET`. Keep `DERMIS_BACKEND_MEMORY=1` until mobile uses real Supabase Auth JWTs.

Scan persist against live Postgres is still memory-backed; analyzer is **fake** unless `GEMINI_API_KEY` is set (DERM-045). Consistency report: `docs/product/gemini-consistency-report.md`.

## Next

- DERM-050 Replace mocks with API (mobile wiring)
- Epic 5: DERM-060 AI consent screens
