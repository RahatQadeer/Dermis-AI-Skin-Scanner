# Dermis — progress handoff

**Last updated:** 2026-11-17  
**Current focus:** Multi-face history epochs + quiz-once hardening

**GitHub:** https://github.com/RahatQadeer/Dermis-AI-Skin-Scanner.git (you commit/push)

---

## Entry flow (live)

1. Splash → Welcome → Quiz (5 steps incl. age band) → Summary → Sign up / Log in → Home  
   (Paywall skipped — billing defaults open)
2. Scan: AI consent → multi-sample face enroll → camera (live match + motion liveness) → Gemini → Results

## Billing (temporary open)

- **Open mode (default):** billing defaults to open unless mode is `store` / `paid` / `closed` — all Pro gates unlocked, high scan quota, no post-auth paywall, Upgrade/Restore hidden. LockedOverlay also short-circuits when unlocked.
- Entitlement tables kept; Stripe/RevenueCat can later set mode to `store` and write `entitlements.plan`.
- Slim paywall UI retained for future store billing (marketing blocks removed).

## Onboarding / profile

- Quiz once; answers saved via `POST /v1/profile` (age band included). Draft is user-scoped and hydrated into the quiz UI; each answer is written to AsyncStorage immediately.
- Profile sync: retries GET; network blips no longer force “incomplete” (that was re-opening the quiz and hiding Progress). Local completed drafts flush on login. 409 only clears draft after confirming skin data exists.
- Profile screen: edit skin type / tone / sensitivity / age band via `PATCH /v1/profile`.
- **Delete photos after analysis** — always on (not a toggle): photos are analysed then discarded; **scan scores/history stay on the server**. Export / delete scans / delete account wired to API.

## Scan UX (live)

- **Auto-capture when frame is ready** — short 2→1 badge countdown, then shutter. Countdown does **not** cancel on ready flicker (that caused blink + timer restart). Sampling freezes once ready; no full-screen dim wash.
- Live MediaPipe framing + lighting/blur coaching; stop snapshots after ready so `takePicture` does not blink the preview.
- Face register: live framing coach; Register only when face is clear (else a clear tip, not a silent re-loop). Enrolled flag is memory+disk so “Start skin scan” never bounces back to setup. Camera gate stays locked until enroll/consent resolve (no scanner flash).
- Auto-capture: needs 2 OK samples + ~0.7s hold before countdown — does not fire on a flaky frame.
- Face identity (production path — fail-closed):
  - **Root cause fixed:** server no longer trusts the client embedding as the scan identity. Every scan re-embeds the uploaded JPEG and the saved enrollment JPEG with the same MobileFaceNet pipeline, then compares those two vectors (threshold **0.94**). Missing enrollment JPEG / embedder failure → reject (never fail open). Gemini runs only after identity allow.
  - Enroll: **one** selfie → `face_references.reference_jpeg` + `face_box_json` + embedding + `enrollment_id`.
  - **Add new face** (Profile): `addFace=1` rotates `enrollment_id` without deleting prior scans. Progress shows a **New face** divider between series; trend cards use the active series only.
  - Must apply migrations `20261102120000_face_reference_image.sql` + `20261117120000_face_enrollment_epochs.sql` and re-register once if JPEG missing.
  - Photo-first UX: shutter → lighting/face check → client pre-check → server pixel match → Gemini.
  - Structured logs: `[faceIdentityGate]` userIdPrefix, enrollment JPEG/embedding flags, claimBindSimilarity, identitySimilarity, threshold, decision, reason (never logs images/embeddings).
  - Config: `EXPO_PUBLIC_FACE_MODEL_URL` (default CDN; `off` disables), `EXPO_PUBLIC_FACE_MATCH_THRESHOLD`, server `DERMIS_FACE_MODEL_URL` / `DERMIS_FACE_MATCH_THRESHOLD`.
- `GET/POST /v1/face-reference` + liveness routes wired.
- Quiz sync: unresolved profile status stays `unknown` (loader) — never coerced to quiz. Onboarding stack redirects complete users Home.
- Account purge explicitly deletes `face_references` + `assistant_usage`.

## Home / Progress / Routine / Assistant

- Home hero: six concern scores + pill CTAs. **View report** → `/(report)/results`; **Recommendations** → `/(report)/recommendations` (own stack, not hidden tabs).
- Progress: real scans; 30/90 windows; scroll pad clears floating tab bar so last history row / scan detail CTAs are tappable.
- Routine: AM/PM periods, skin-aware suggestions, add/edit steps. **See recommended actives** opens `/recommendations?from=routine` with Add to morning/evening on each card.
- Assistant (“questions about skin/routine”): `POST /v1/assistant/messages` chat with profile/routine context.

## Tab bar / layout

- Floating white pill (no cream wash behind tabs). Active tab = pink icon wrap + bold label + pink dot; scan FAB pink when active.
- `TAB_BAR_SCROLL_PAD = 168` on Home / Progress / Scan detail / Routine / Profile / Results / Toast.

## Run locally

```bash
# Billing open by default; apps/mobile/.env has EXPO_PUBLIC_BILLING_MODE=open
npm run start --workspace=@dermis/backend
cd apps/mobile && npx expo start -c --lan
```

Apply new migration for age band: `backend/supabase/migrations/20261030140000_profile_age_band.sql`

## Auth / data integrity (live)

- Logged-out returning users go to **Log in** (not Sign up). Sign-out → Log in. First launch → Welcome.
- Local JWT is cleared when `/v1/auth/me` returns 401/403 (user deleted in Supabase / revoked). Epoch `6` also wipes ghost sessions once on next cold start.
- Sign up with an email that already exists: if password matches → sign into that same user (no second `auth.users` / empty `profiles` row).
- After auth, quiz draft flushes immediately to `profiles`; scan scores live in `scans` (not in `profiles`).
- DB empty after wipe → reopen app (reload Expo) → Log in / Welcome, then Sign up once.

## Next chat starts at

1. **Apply migration** `backend/supabase/migrations/20261117120000_face_enrollment_epochs.sql` on Supabase.
2. **Device QA:** register face A → scan → Profile → **Add new face** (face B) → scan B → Progress shows **New face** divider; old A scans remain. Face A must fail identity until added again.
3. Ensure live API is Supabase path (`DERMIS_BACKEND_MEMORY=0`) and TFJS model reachable.
4. When ready for paid: set `DERMIS_BILLING_MODE=store` + `EXPO_PUBLIC_BILLING_MODE=store`.
