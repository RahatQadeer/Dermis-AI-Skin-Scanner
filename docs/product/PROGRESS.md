# Dermis — progress handoff

**Last updated:** 2026-10-16  
**Current focus:** Real scan data only (Home / Progress / Recommendations) — no demo scores

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

- Real **GET /v1/scans** only. Empty = no scans; session error vs network error are separate copy.
- Before/after = baseline vs latest **index scores** (photos deleted after Gemini analysis — no selfie retention).
- Note: scan rows still in **backend memory** until Supabase scan persistence; restart clears history.

## Home / Recommendations (live)

- Home hero/priorities from latest real scan + live quota/routine — **no DEMO mock scores** when signed in.
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

- Unclear / failed analysis → toast on **camera** (not Analysing). Analysing eases toward 98% then snaps to 100% on accept. Toast Close dismisses.

## Tab bar (live)

- Floating white pill: Home · Progress · pink sheep scan · Routine · Profile (icons + labels; active = ink/bold).

## Next chat starts at

Persist scans to Supabase (replace memoryScanRepository), **or** wire RevenueCat sandbox + webhook.
