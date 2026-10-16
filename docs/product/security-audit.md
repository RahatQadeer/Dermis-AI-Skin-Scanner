# Security audit (DERM-068)

**Date:** 2026-10-05  
**Scope:** secrets hygiene, API transport, legal URL opens, consent fail-closed, scan upload bounds, memory webhook defaults.  
**Out of scope (follow-on):** Supabase JWT auth epic, verified public deletion, rate limits, cert pinning, Supabase scan pipeline wiring.

## Inventory

| Surface               | Status                                                                     |
| --------------------- | -------------------------------------------------------------------------- |
| Gemini / service keys | Server-only (`.env.example`); not in `apps/mobile/src`                     |
| Client env            | `EXPO_PUBLIC_*` allowlist only (API, legal, mock, RC public keys)          |
| Session token         | In-memory React state (`user:` memory tokens — **not production auth**)    |
| Face consent local    | AsyncStorage offline only; API-live path fail-closed on fetch error        |
| API client            | Bearer `fetch`; release requires `https://` base URL                       |
| Legal opens           | `https:` only via `openLegalUrl` / `hasLegalUrls`                          |
| Scan upload           | Zod max base64 length ≈ 8 MiB decoded + padding                            |
| RC webhook (memory)   | Default secret refused when `NODE_ENV=production`                          |
| Account deletion      | In-app authenticated `DELETE`; public email form **unverified** `[verify]` |
| `.gitignore`          | `.env`, `.env.*`, `!.env.example`, `*.key`                                 |

## Fixes in this ticket

1. Cap `imageBase64` length in `createScanBodySchema`.
2. Fail closed on default memory webhook secret in production.
3. Release builds ignore non-HTTPS `EXPO_PUBLIC_API_URL`.
4. Legal URL openers require `https:`.
5. `loadFaceConsent(apiLive)` returns `false` on API errors (no AsyncStorage bypass).
6. CI: `apps/mobile/src/lib/securityAudit.test.ts`, `backend/src/securityAudit.test.ts`.

## Do not ship

- Memory auth (`user:` bearer / `DERMIS_BACKEND_MEMORY`) on a public host.
- Default `dev-revenuecat-webhook-secret` in production.
- Unverified public deletion as the only deletion path without product/legal sign-off.
- Client-bundled `GEMINI_API_KEY` / service role keys.

## Remaining `[verify]` / TODOs

1. Replace memory tokens with Supabase Auth + SecureStore before production API.
2. Public deletion: magic link / verified email / review queue — `TODO(spec)`.
3. Wire Supabase `scanPipelineFor` in production backend entry (H5).
4. Edge rate limits on scan / public deletion / webhook.
5. Device QA: HTTPS-only API; legal links refuse http/javascript schemes.

## CI guards

- Mobile: no forbidden secret substrings; `process.env` allowlist; gitignore patterns; legal/API URL helpers.
- Backend: base64 max; production webhook secret refusal.
