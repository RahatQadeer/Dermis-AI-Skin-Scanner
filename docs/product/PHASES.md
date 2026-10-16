# Dermis — phases and tickets

**Status key:** Todo · In progress · In review · Done  
**Rules:** One ticket per branch/PR. Do not start a ticket before dependencies are Done. Every ticket includes Definition of Done (see `.cursor/rules/core.mdc` when present).

---

## Epic 0: Foundation

| ID       | Title            | Size | Deps | Status   |
| -------- | ---------------- | ---- | ---- | -------- |
| DERM-000 | Product docs     | S    | —    | **Done** |
| DERM-001 | Repo and tooling | M    | 000  | **Done** |
| DERM-002 | CI               | S    | 001  | **Done** |
| DERM-003 | Theme tokens     | S    | 001  | **Done** |
| DERM-004 | Copy module      | S    | 001  | **Done** |
| DERM-005 | Domain package   | M    | 001  | **Done** |
| DERM-006 | Zod schemas      | S    | 005  | **Done** |

### DERM-000 Product docs (S)

**Goal:** Create `docs/product/{PRODUCT,SCREENS,PHASES,PROGRESS}.md` from documentation — locked terms, prices, limits, banned claims, 16 screens.

**AC:** Supervisor reviews and approves; every later ticket reads these files; DoD in core rules.

### DERM-001 Repo and tooling (M)

**Goal:** Monorepo, Expo app, TS strict, ESLint (B1 file-size rules), Prettier, Husky.

**AC:** App boots iOS and Android; lint fails on a 301-line file; DoD.

### DERM-002 CI (S)

**Goal:** Typecheck, lint, tests, build on every PR.

**AC:** Red CI blocks merge; DoD.

### DERM-003 Theme tokens (S)

**Goal:** Colours, spacing, radii, fonts (Fredoka, Nunito), motion.

**AC:** No hard-coded hex (lint rule); DoD.

### DERM-004 Copy module (S)

**Goal:** All strings including mascot lines in `copy/`.

**AC:** No inline user-facing strings in components; DoD.

### DERM-005 Domain package (M)

**Goal:** `calculateIndex`, quota/gating, password strength (server); display helpers `scoreColor`, `deltaColor`.

**AC:** 100% unit coverage; app imports only types, schemas, display helpers; DoD.

### DERM-006 Zod schemas (S)

**Goal:** Scan, scores, profile, consent, Gemini response schemas.

**AC:** Types derived from schemas; invalid input rejected in tests; DoD.

---

## Epic 1: Component library

| ID       | Title                   | Size | Deps    | Status   |
| -------- | ----------------------- | ---- | ------- | -------- |
| DERM-010 | Primitives              | M    | 003     | **Done** |
| DERM-011 | Inputs                  | M    | 010     | **Done** |
| DERM-012 | Feedback                | M    | 010     | **Done** |
| DERM-013 | Data display            | L    | 010     | **Done** |
| DERM-014 | Mascot                  | L    | 003     | **Done** |
| DERM-015 | Layout                  | M    | 010     | **Done** |
| DERM-016 | LockedOverlay, PlanCard | S    | 010     | **Done** |
| DERM-017 | Component Gallery       | S    | 010–016 | **Done** |

---

## Epic 2: Screens (mock data)

| ID       | Title                    | Size | Deps     | Status   |
| -------- | ------------------------ | ---- | -------- | -------- |
| DERM-020 | Navigation shell         | M    | 015      | **Done** |
| DERM-021 | Welcome                  | S    | 014, 020 | **Done** |
| DERM-022 | Quiz                     | M    | 011, 014 | **Done** |
| DERM-023 | Profile summary          | S    | 022      | **Done** |
| DERM-024 | Auth screens             | M    | 011      | **Done** |
| DERM-025 | Home                     | M    | 013, 014 | **Done** |
| DERM-026 | Routine                  | M    | 013      | **Done** |
| DERM-027 | Progress and Scan detail | M    | 013      | **Done** |
| DERM-028 | Recommendations          | S    | 010      | **Done** |
| DERM-029 | Profile and settings     | M    | 011      | **Done** |
| DERM-030 | Paywall UI               | M    | 016      | **Done** |
| DERM-031 | Camera and Analysing UI  | M    | 014      | **Done** |
| DERM-032 | Results and zone map     | L    | 013, 016 | **Done** |

---

## Epic 3: Backend

| ID       | Title                         | Size | Deps     | Status   |
| -------- | ----------------------------- | ---- | -------- | -------- |
| DERM-040 | Migrations and RLS            | L    | 006      | **Done** |
| DERM-041 | Auth and profile API          | M    | 040      | **Done** |
| DERM-042 | Entitlements webhook          | M    | 040      | **Done** |
| DERM-043 | Quota service                 | M    | 040, 005 | **Done** |
| DERM-044 | Scan pipeline (fake analyzer) | L    | 043      | **Done** |
| DERM-045 | Gemini adapter                | L    | 044      | **Done** |
| DERM-046 | Routine and settings API      | M    | 040      | **Done** |
| DERM-047 | Account deletion and export   | L    | 040      | **Done** |
| DERM-048 | Consent API                   | S    | 040      | **Done** |

---

## Epic 4: Integration

| ID       | Title                           | Size | Deps              | Status   |
| -------- | ------------------------------- | ---- | ----------------- | -------- |
| DERM-050 | Replace mocks with API          | L    | 041, 046, 020–032 | **Done** |
| DERM-051 | Real camera and upload          | L    | 044, 048          | **Done** |
| DERM-052 | RevenueCat purchase and restore | L    | 042, 030          | **Done** |
| DERM-053 | Notifications                   | M    | 050               | **Done** |
| DERM-054 | PDF report for Pro              | M    | 050               | **Done** |

---

## Epic 5: Compliance and store readiness

| ID       | Title                               | Size | Deps | Status        |
| -------- | ----------------------------------- | ---- | ---- | ------------- |
| DERM-060 | AI consent and privacy screens      | M    | 048  | **Done**      |
| DERM-061 | Copy and claims audit               | M    | 004  | **Done**      |
| DERM-062 | Permissions audit                   | S    | —    | **Done**      |
| DERM-063 | Data safety worksheet               | M    | —    | **Done**      |
| DERM-064 | Health declarations and disclaimers | S    | —    | **Done**      |
| DERM-065 | Subscription disclosure review      | S    | 052  | **Done**      |
| DERM-066 | Accessibility pass                  | M    | —    | **Done**      |
| DERM-067 | Android 16 / API 36 checks          | M    | —    | **Done**      |
| DERM-068 | Security review                     | M    | —    | **Done**      |
| DERM-069 | Store assets and demo account       | M    | —    | **Done**      |
| DERM-070 | Performance and crash-free          | M    | —    | **In review** |

---

## Epic 6: Release

| ID       | Title                        | Size | Deps        | Status |
| -------- | ---------------------------- | ---- | ----------- | ------ |
| DERM-080 | Staging release              | S    | —           | Todo   |
| DERM-081 | TestFlight and Play internal | M    | —           | Todo   |
| DERM-082 | Play closed test (12×14d)    | L    | —           | Todo   |
| DERM-083 | Production submission        | M    | D7 complete | Todo   |
