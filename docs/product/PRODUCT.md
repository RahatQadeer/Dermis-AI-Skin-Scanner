# Dermis — product source of truth

**Status:** Draft for supervisor review (DERM-000).  
**When this file conflicts with stale prototype HTML copy on a _locked_ item below, this file wins.**  
**UI layout and flows:** `docs/Dermis_App_Documentation.pdf` and `docs/screens/` (prototype v0.2 playful).

---

## What Dermis is

Mobile wellness app (iOS + Android): one front-facing selfie → scores for six skin concerns and six face zones, a **Skin Health Index**, progress over time, AM/PM routine, and product recommendations. **Not a medical device.** Provides **estimates and insights**, not diagnosis or treatment.

**Mascots (v2):** Dermis (sheep), Professor Puff (report/guide). **Design:** green/pink, Fredoka + Nunito.

---

## Locked terminology

| Term                  | Meaning                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Concern**           | One of six scored dimensions (0–100, higher is better): Redness, Fine lines, Hydration, Dark spots, Texture, Pores |
| **Zone**              | One of six face regions: Forehead, T-zone/nose, Left cheek, Right cheek, Periorbital, Chin                         |
| **Skin Health Index** | Single 0–100 overall score; **computed on the server** from concern scores (see formula)                           |
| **Priority concerns** | Up to 3 chosen in quiz step 3; affect index weighting only                                                         |
| **Free**              | 1 scan **total** (lifetime per account, server-enforced)                                                           |
| **Pro**               | Paid subscription; **5 scans per calendar day**, reset at midnight (server-enforced)                               |
| **Scan**              | One captured selfie processed through the server pipeline (Gemini analysis + stored scores)                        |

Use **skin insights**, **estimates**, **scores** — not clinical, diagnostic, or dermatologist-approved language unless explicitly approved in a future revision of this file.

---

## Plans and pricing (prototype reference — store is source at runtime)

Display prices from **App Store / Play Billing** (via RevenueCat). Prototype reference values for copy and paywall layout only:

| Plan        | Reference price | Trial             | Notes                                             |
| ----------- | --------------- | ----------------- | ------------------------------------------------- |
| **Annual**  | $49.99/year     | 7-day free trial  | Default selected; show localized price from store |
| **Monthly** | $9.99/month     | None in prototype | CTA varies by selected plan                       |

- **“SAVE 58%”** (or any discount badge): compute from **real** localized annual vs monthly prices, never hard-code in production.
- Paywall must include: period, auto-renewal, trial terms, cancel instructions, **Restore Purchases**, Privacy + Terms links (see v3 Part D3).

**TODO(spec):** Confirm trial eligibility, introductory offers, and regional availability.

---

## Entitlements and gating (server is authoritative)

The app **must not** compute quota, plan, or index for enforcement. It displays server responses and uses `packages/domain` only for **types, Zod schemas, and display helpers** (e.g. score colours).

### Scan quota

| Tier | Limit           |
| ---- | --------------- |
| Free | 1 scan total    |
| Pro  | 5 scans per day |

### Free-tier report (after the one free scan)

| Report element                               | Free                     | Pro |
| -------------------------------------------- | ------------------------ | --- |
| Overall Skin Health Index                    | Yes                      | Yes |
| One concern score (free preview)             | Yes                      | Yes |
| Other five concern scores + notes            | Locked                   | Yes |
| Zone map (6 zones)                           | Locked                   | Yes |
| Skin age estimate                            | Locked (if shown at all) | Yes |
| Full routine, progress analytics, PDF export | Locked                   | Yes |

**Which concern is shown on free:** use `resolveFreePreviewConcernId` in `@dermis/domain/server`.

- Preserve **quiz selection order**. With 1–3 priorities, Free shows only the **first/top-ranked selected** concern.
- Other priority concerns and all remaining concerns stay **locked**.
- If **0 priorities**, fallback to the **highest-scoring concern** on that scan (ties → concern list order).
- Never show all six on free.

Free results UI: **LockedOverlay** + “Unlock with Pro” where applicable.

### Password rules (sign-up)

- Minimum **8** characters; requires **uppercase**, **lowercase**, and **number**; **symbol not required**.
- Strength meter shows all checks (including optional symbol); **`isPasswordAcceptable`** in `@dermis/domain/server` is the shared client/backend rule.

---

## Skin Health Index formula (server-only)

Computed in backend services using shared `packages/domain` logic; **not** by Gemini; **not** in the mobile app for authoritative values.

```
weight(c) = 1.5 if concern c is a user priority (max 3 from quiz), else 1.0
index = round( sum(weight × score) / sum(weight) )
```

- Persist **formula_version** and **weights** used on **every scan**.
- Historical scans keep their original index when user later changes priorities (Progress must not rewrite history).

**Score colours (display):** ≥75 green · 60–74 sky/accent · &lt;60 amber (tokens in theme).

---

## Analysis and data flow (locked)

| Topic         | Decision                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Scoring model | Google **Gemini** API, **backend only**                                                                       |
| Photo         | Leaves device; encrypted in transit                                                                           |
| API keys      | Server only; never in app bundle                                                                              |
| Consent       | Explicit screen **before first scan**; names **Google (Gemini)**; no analysis API call until consent recorded |
| Idempotency   | Client sends idempotency key per scan request                                                                 |

**Photo retention (proposal — confirm):** Delete server copy after analysis; retain scores and metadata only. Optional local photo on device is separate from server retention.

**TODO(spec):** Final retention policy and privacy-policy wording.

---

## Quiz (locked structure)

Four steps, single flow before account (prototype order):

1. **type** — skin type by midday: Oily, Combination, Dry, Normal
2. **tone** — Fitzpatrick I–II, III, IV, V–VI (with swatches)
3. **concerns** — improve up to **3**: Pores, Texture, Dark spots, Redness, Fine lines, Hydration
4. **sensitivity** — Rarely reacts, Sometimes stings, Reacts easily

Stored in user profile (server); not separate DB tables per field.

---

## Recommendations and commerce

**TODO(spec):** Product catalog source, affiliate links, in-app purchase of physical goods — screen exists in prototype; **no buy flow** until decided.

---

## Regions

**USA first**, then additional countries.

**TODO(spec):** Exact country list (doc suggestion: US, CA, UK, EU members, AU, NZ, JP, KR, SG, CH, NO, IL, etc.).

---

## Auth (prototype)

Sign up, log in, forgot password; **Google** and **Apple** on iOS (Sign in with Apple required when Google is offered — store rule).

---

## Banned and prohibited claims (do not ship)

From prototype / marketing — **rewrite before submission** (full audit: DERM-061, Part D4):

- On-device processing / “photos stay private” / “photos never leave your phone” / “photos stay on your device” as **processing** claims
- “Clinical scoring”, “Derm-built clinical”, “clinical notes”, unqualified **dermatologist** claims
- “Based on 41k similar profiles”; fixed projections (e.g. “62 → 78 in 12 weeks”) without evidence
- **“68 landmarks”** until engineering confirms a real pipeline (TODO(spec))
- **UV index** or weather-driven advice without a real data source
- **Skin age** as a measurement (if shown: fun **estimate** only)
- Paywall **“Full zone map on every scan”** — Pro only gets full map on **each Pro scan**; free scan does not include zone map
- Treatment-directive copy (e.g. retinol schedule as medical instruction) without wellness framing + “consult a professional”

### Required disclaimers (visible in app + store)

- **Not a medical device** (Welcome footnote, Profile/About, listings)
- **Consult a dermatologist** for medical concerns
- Wellness framing for all scores and advice

---

## Allowed privacy messaging (draft — legal review required)

Use only if backend behaviour matches:

> Photos are sent securely to our servers for analysis using Google’s Gemini API. We [retention per policy]. You can delete your account and data in the app.

**TODO(spec):** Final strings in `copy/` after retention and legal sign-off.

---

## Open decisions (do not invent — use `TODO(spec)` in code)

1. Photo retention exact policy
2. Keep or drop “68 landmarks” / analysing step copy
3. Product recommendation source and purchase flow
4. Launch country list
5. Landmark/zone technical approach (overlay vs mesh)
6. Anonymised data sharing default (off; consent versioned)

---

## Document history

| Date       | Change                                                              |
| ---------- | ------------------------------------------------------------------- |
| 2026-10-05 | DERM-000 initial draft from App Documentation v2 + Cursor prompt v3 |
