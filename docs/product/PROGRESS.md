# Dermis — progress handoff

**Last updated:** 2026-10-30  
**Current focus:** Open billing (all features free); one-time onboarding + age band; manual camera; face enroll UX; progress honesty

**GitHub:** https://github.com/RahatQadeer/Dermis-AI-Skin-Scanner.git (you commit/push)

---

## Entry flow (live)

1. Splash → Welcome → Quiz (5 steps incl. age band) → Summary → Sign up / Log in → Home  
   (Paywall skipped — billing defaults open)
2. Scan: AI consent → face enroll (CDN model on by default) → camera → Gemini → Results

## Billing (temporary open)

- **Open mode (default):** billing defaults to open unless mode is `store` / `paid` / `closed` — all Pro gates unlocked, high scan quota, no post-auth paywall, Upgrade/Restore hidden. LockedOverlay also short-circuits when unlocked.
- Entitlement tables kept; Stripe/RevenueCat can later set mode to `store` and write `entitlements.plan`.
- Slim paywall UI retained for future store billing (marketing blocks removed).

## Onboarding / profile

- Quiz once; answers saved via `POST /v1/profile` (age band included). Draft is user-scoped; logout does not wipe an unflushed draft.
- Profile sync fail-closed: incomplete until server has skin data.
- Profile screen: edit skin type / tone / sensitivity / age band via `PATCH /v1/profile`.

## Scan UX (live)

- **Manual capture only** — press shutter when framed; auto-capture removed.
- Live MediaPipe framing + lighting/blur; separate busy locks so sampling cannot starve `takePhoto`.
- Face identity: **on by default** via CDN MobileFaceNet (`EXPO_PUBLIC_FACE_MODEL_URL=off` to disable). First scan → enroll screen; other faces rejected (“Use your own selfie”). Progress stays on the account. Profile → Update face reference.
- Capture flash shortened; no full-screen enroll gate delay; face model preloads on camera/enroll.
- `GET/POST /v1/face-reference` wired on the API.

## Progress (live)

- Real `GET /v1/scans` only. Chart uses **stored** index scores (no history re-score).
- ≥2 scans: previous → latest comparison + window baseline → latest; single-scan hint when only one exists.
- No mock concern deltas when a signed-in current scan is present.

## Tab bar / layout

- Active tab = pink icon/label + soft wash + underline + pink dot; secondary routes (results/assistant/recommendations) keep Home highlighted; scan FAB pink when on camera/analysing/enroll.
- Screen: max-width 560 on wide; narrower/shorter devices get tighter padding; tab scroll pad 120.

## Run locally

```bash
# Billing open by default; apps/mobile/.env has EXPO_PUBLIC_BILLING_MODE=open
npm run start --workspace=@dermis/backend
cd apps/mobile && npx expo start -c --lan
```

Apply new migration for age band: `backend/supabase/migrations/20261030140000_profile_age_band.sql`

## Next chat starts at

1. Apply `age_band` migration on Supabase (if not already).
2. Deploy backend (face-reference routes) to Render; restart Expo with `apps/mobile/.env`.
3. Device QA: enroll face → scan same face OK → different face blocked; Progress shows account scans only.
4. When ready for paid: set `DERMIS_BILLING_MODE=store` + `EXPO_PUBLIC_BILLING_MODE=store`, wire Stripe → `EntitlementService.upsert`.
