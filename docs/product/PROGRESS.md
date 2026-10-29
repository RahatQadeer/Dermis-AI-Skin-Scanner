# Dermis — progress handoff

**Last updated:** 2026-10-29  
**Current focus:** Email + Google + Apple Sign-In wired; preview unlock-all for testing

**GitHub:** https://github.com/RahatQadeer/Dermis-AI-Skin-Scanner.git (you commit/push)

---

## Entry flow (live)

1. Splash → Welcome → Quiz → Summary → Sign up / Log in → Paywall → Home
2. Scan: face gate + real Gemini; Results + zone map

## Subscriptions / local unlock

- **Local unlock-all (current):** `DERMIS_FORCE_PRO=1` + `EXPO_PUBLIC_UNLOCK_ALL_FEATURES=1` — no Pro locks (zones, concerns, routine, progress, PDF). Quota treated as Pro. Restart backend + Expo after changing. Turn off before store builds.
- **Dev paywall Subscribe:** `DERMIS_ALLOW_DEV_ENTITLEMENT=1` when RevenueCat unset.
- **Production:** RevenueCat + native build + webhook.

---

## Run locally

```bash
npm run start --workspace=@dermis/backend
cd apps/mobile && npx expo start -c --lan
```

---

## Routine (live)

- **Edit:** red − removes a step; **Done** exits with sparkle. Progress card shows “Tap – to remove a step”.
- **Add step** sheet: `+` / **Added** toggle; sheet **Done** sparkles then closes.
- Complete-all sheep banner on last check. Load seeds empty server routines; token bind is sync (no missing-token race).
- **See recommended actives →** under adherence → `/(tabs)/recommendations` (Professor Puff picks + 4 placeholder actives; no purchase).

## Auth / API (live)

- Expired JWT: client calls **POST /v1/auth/refresh** then retries once (fixes consent / progress / profile 401s).

## Progress (live)

- Real **GET /v1/scans** (Supabase) only. Empty = no scans; session error vs network error are separate copy.
- Before/after = baseline vs latest **index scores** (photos deleted after Gemini analysis — no selfie retention).
- Scans persist in Supabase; backend restart does not clear history.

## Home / Recommendations (live)

- Home hero/priorities from latest real scan + live quota/routine — **no DEMO mock scores** when signed in.
- Home loads quota / scans / routine with `Promise.allSettled` so a quota blip cannot blank the page.
- Missing `entitlements` / `scan_usage` rows are healed on first `GET /v1/quota` (signup trigger gaps).
- Recommended actives ranked by weakest concern scores from latest scan; empty until a scan exists. Ingredient catalog is still a fixed example list (not store SKUs).

## Profile Data (live)

- **Delete all scan data** → confirm → **DELETE /v1/scans** (account kept).
- **Delete account** → confirm sheet → **DELETE /v1/account**.
- **Log out** → clears session → sign-up.

## Results (live)

- Home **View report** → `/(tabs)/results` — index hero, zone map, Professor notes, per-concern cards, Compare / Update routine (mock layout).
- **Share** header CTA stays one line (header right slot no longer clips to 48px).
- Zone map = soft gray face oval + brow/nose/jaw contours; tap zone → party confetti + detail card.
- Deltas + skin-age estimate when a prior scan exists; prototype deltas on offline mock report only.

## Scan UX (live)

- Camera live guidance: MediaPipe Face Detector (TFJS/CPU on-device) + lighting/blur heuristics; green oval + chips when face is framed; shutter gated; auto-capture after ~550ms ready (short 2–1); hi-res recheck before upload. Failed/unclear faces are not saved. Local unlock does not block daily limit.
- **Create scan** client timeout is **90s** (was 12s — that aborted Gemini and showed “Could not complete your scan”). Server trusts `faceClear=true` even if a stray `faceIssue` is set; Gemini prompt v7 prefers pass for ordinary clear selfies.
- Unclear / failed analysis → toast on **camera** (not Analysing). Analysing eases toward 98% then snaps to 100% on accept. Toast Close dismisses.

## Tab bar (live)

- Floating white pill: Home · Progress · pink sheep scan · Routine · Profile (icons + labels; active = ink/bold).

## Hosting (live)

- Render Web Service: `https://dermis-ai-skin-scanner.onrender.com` — check `GET /` or `GET /health`.
- `render.yaml` Blueprint; GitHub Actions `deploy-render` job POSTs `RENDER_DEPLOY_HOOK_URL` after CI on `main`.
- EAS `EXPO_PUBLIC_API_URL` = Render HTTPS (not LAN `http://`).
- **Testing unlock:** preview/dev EAS sets `EXPO_PUBLIC_UNLOCK_ALL_FEATURES=1`; Render sets `DERMIS_FORCE_PRO=1` + `DERMIS_ALLOW_DEV_ENTITLEMENT=1`. Paywall Subscribe succeeds without RevenueCat. Remove before store billing.
- **This test build:** email works. Google works when `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` + `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` are set and Supabase Google is enabled. Apple (iOS) uses `expo-apple-authentication` → `POST /v1/auth/apple` → GoTrue `provider=apple`; requires App ID Sign in with Apple + Supabase Apple Client IDs including `com.righttail.dermis`, then a **new EAS preview/dev build** (native module + `usesAppleSignIn`).
- Backend: `POST /v1/auth/google` and `POST /v1/auth/apple` exchange provider `id_token` via GoTrue. Native Apple does **not** need a Services ID / `.p8` secret.

## Next chat starts at

1. Supabase Auth → Apple: enable provider; Client IDs = `com.righttail.dermis` (and `host.exp.Exponent` only if testing in Expo Go).
2. Rebuild iOS preview: `cd apps/mobile && eas build --profile preview --platform ios` — install IPA, test Continue with Apple on a real device.
3. Deploy backend with `/v1/auth/apple` to Render (after approve/push). Confirm Google still works.
4. RevenueCat sandbox / store copy audit (DERM-061).
