# Dermis — screens and routes

**Status:** DERM-000 draft.  
**Total:** 16 screens (prototype v0.2). Route names and file names follow this document.

**Convention (Expo Router, planned):**

- Onboarding/auth: stack under `app/(onboarding)/` or `app/(auth)/`
- Main app: tabs under `app/(tabs)/`
- Screen implementation: `apps/mobile/src/features/<feature>/screens/<ScreenName>.tsx` (thin `app/*` routes compose them)

---

## Inventory

| #   | Screen name                 | Prototype ID | Route (planned)                  | Tab bar | Status bar | Feature folder            |
| --- | --------------------------- | ------------ | -------------------------------- | ------- | ---------- | ------------------------- |
| 1   | Welcome                     | `onboard`    | `/(onboarding)/welcome`          | No      | Dark       | `onboarding`              |
| 2   | Skin profile quiz (4 steps) | `quiz`       | `/(onboarding)/quiz`             | No      | Light      | `onboarding`              |
| 3   | Profile summary             | `summary`    | `/(onboarding)/summary`          | No      | Light      | `onboarding`              |
| 4   | Sign up                     | `signup`     | `/(auth)/sign-up`                | No      | Light      | `auth`                    |
| 5   | Log in                      | `login`      | `/(auth)/log-in`                 | No      | Light      | `auth`                    |
| 6   | Forgot password             | `forgot`     | `/(auth)/forgot-password`        | No      | Light      | `auth`                    |
| 7   | Paywall                     | `paywall`    | `/(onboarding)/paywall` or modal | No      | Dark       | `paywall`                 |
| 8   | Home                        | `home`       | `/(tabs)/home`                   | Yes     | Light      | `scan` / home feature TBD |
| 9   | Camera scan                 | `scan`       | `/(scan)/camera`                 | No      | Dark       | `scan`                    |
| 10  | Analysing                   | `analyzing`  | `/(scan)/analysing`              | No      | Dark       | `scan`                    |
| 11  | Results & zone map          | `results`    | `/(tabs)/results`                | Yes     | Light      | `results`                 |
| 12  | Routine                     | `routine`    | `/(tabs)/routine`                | Yes     | Light      | `routine`                 |
| 13  | Progress                    | `progress`   | `/(tabs)/progress`               | Yes     | Light      | `progress`                |
| 14  | Scan detail                 | `scanDetail` | `/(tabs)/progress/[scanId]`      | Yes     | Light      | `progress`                |
| 15  | Recommendations             | `products`   | `/(tabs)/recommendations`        | Yes     | Light      | `recommendations`         |
| 16  | Profile                     | `profile`    | `/(tabs)/profile`                | Yes     | Light      | `profile`                 |

**Tab bar (main):** Home, Progress, **centre scan** (pink sheep), Routine, Profile — floating pill; Results/Recommendations via in-app links.

---

## Navigation flows (high level)

```
Welcome → Quiz → Profile summary → Sign up / Log in
         ↓ (Log in from Welcome)
Profile summary → Paywall (optional) → Camera → Analysing → Results
Main tabs: Home ↔ Progress ↔ Scan ↔ Routine ↔ Profile
Progress → Scan detail (history item)
Recommendations from tab or links (per prototype)
```

**Android:** system back must match stack (Part D / DERM-020).

**Pre-scan gate (compliance):** AI consent screen before first real scan (DERM-060) — not a separate numbered prototype screen; inserted before `scan` when not yet consented.

---

## Per-screen notes (build reference)

### 1 Welcome (`onboard`)

- Hero, mascot speech bubble (cycle lines — **D4 rewrites** for privacy lines), stat cards, CTA → Quiz, Log in → Log in
- Footnote: includes **not a medical device**

### 2 Quiz (`quiz`)

- 4 steps, StepProgress + sheep marker; Continue disabled until answered; Back from step 1 → Welcome
- Concerns: multi select max 3

### 3 Profile summary (`summary`)

- Confetti, Professor Puff, answer table, sensitivity-based note, CTA → scan path, Skip → Home

### 4–6 Auth

- Sign up, log in, forgot password; validation + mascot reactions per documentation
- iOS: Apple + Google; legal links; **no false on-device processing copy**

### 7 Paywall (`paywall`)

- Annual / monthly plans, trial timeline, Restore, Terms, Privacy; Free vs Pro comparison
- Copy: free = **1 scan total, baseline score** (not “full baseline report”)

### 8 Home (`home`)

- Index, quota row, routine card, metric cards; states: free, pro, limit reached
- **Remove or wire** UV index card (D4)

### 9–10 Scan pipeline UI

- Camera: countdown 3-2-1, flash, face guide
- Analysing: progress ring, steps (**landmark copy TBD**)

### 11 Results (`results`)

- Index, zone map, concern cards, Professor notes
- **Free state:** index + one priority only; rest locked

### 12 Routine (`routine`)

- AM/PM, tick steps, edit, custom step, toasts (2.6s)

### 13–14 Progress

- 30/90 day views, history, scan detail prev/next

### 15 Recommendations (`products`)

- Placeholder products; **no purchase** until PRODUCT.md source decided

### 16 Profile (`profile`)

- Settings toggles, Privacy/Terms, **Delete account** entry, export/deletion actions (wired later)

---

## Component gallery (dev only)

- Route: e.g. `/(dev)/component-gallery` — DERM-017; not part of the 16 user-facing screens

---

## Document history

| Date       | Change                                               |
| ---------- | ---------------------------------------------------- |
| 2026-10-05 | DERM-000 initial from documentation screen inventory |
