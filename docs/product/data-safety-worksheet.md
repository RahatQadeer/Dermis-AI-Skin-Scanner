# Data safety worksheet (DERM-063)

**Date:** 2026-10-05  
**Purpose:** Fill **Google Play Data safety** and **Apple App Privacy** from _implemented_ behavior — not marketing copy.  
**Owner:** Product + engineering; **legal must sign off** before store submission.  
**Related:** `permissions-audit.md`, `claims-audit.md`, PRODUCT.md analysis/data flow.

---

## 1. Summary (honest answers)

| Question                                                 | Answer (as of this worksheet)                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Does the app collect user data?                          | **Yes**                                                                       |
| Is data encrypted in transit?                            | **Yes** (HTTPS to backend; third parties use their TLS)                       |
| Can users request deletion?                              | **Yes** — in-app Profile delete + public `/delete-account`                    |
| Can users export data?                                   | **Yes** — in-app export (`GET /v1/account/export`)                            |
| Is data sold?                                            | **No** (do not declare “sold” unless a future partner agreement changes this) |
| Is data used for advertising / tracking?                 | **No** in current codebase (no ad SDK, no ATT / advertising ID usage)         |
| Is data shared with third parties for app functionality? | **Yes** — see §4                                                              |

---

## 2. Data collected (by category)

Use these rows when mapping store forms. “Collected” = transmitted off device or stored on our servers / processors.

### Account & identity

| Data type           | Examples                                                       | Collected? | Purpose                          | Optional?                     |
| ------------------- | -------------------------------------------------------------- | ---------- | -------------------------------- | ----------------------------- |
| Account identifiers | User id (UUID), email (auth)                                   | Yes        | Account, auth, deletion matching | Required for account features |
| User IDs (billing)  | RevenueCat / store `appUserId` (= account UUID when logged in) | Yes        | Subscription entitlement         | Required for Pro              |

### Personal info / health-adjacent (wellness — not clinical)

| Data type         | Examples                                                              | Collected?      | Purpose                             | Optional?                      |
| ----------------- | --------------------------------------------------------------------- | --------------- | ----------------------------------- | ------------------------------ |
| Skin profile quiz | Skin type, Fitzpatrick tone band, up to 3 concerns, sensitivity       | Yes             | Personalize index weighting / UI    | Provided during onboarding     |
| Scan photos       | Front-facing selfie (JPEG base64 upload)                              | Yes (transient) | Face analysis via Gemini on backend | Required to run a scan         |
| Scan results      | Concern scores, zone scores, Skin Health Index, model/prompt versions | Yes (stored)    | Results, progress, PDF export       | Created when user scans        |
| Consents          | `face_analysis` version + grant/revoke timestamps                     | Yes             | Gate analysis; compliance           | Required before first analysis |

**Important:** Photos are **stored briefly for analysis then deleted** by the scan pipeline (`scanPipelineService` deletes photo after success or failure cleanup). Scores/metadata are retained until account deletion. Public Privacy Policy must state this accurately (`TODO(spec)` final legal wording).

### App activity & settings

| Data type           | Examples                                      | Collected? | Purpose         | Optional?        |
| ------------------- | --------------------------------------------- | ---------- | --------------- | ---------------- |
| Routine             | AM/PM step labels, completion dates           | Yes        | Routine feature | Optional feature |
| Settings            | `notifyScanReminders`, `notifyProductUpdates` | Yes        | Preferences     | Optional toggles |
| Quota / entitlement | Plan (free/pro), scan counts                  | Yes        | Enforce limits  | System           |

### Device / diagnostics

| Data type              | Examples                             | Collected?                             | Purpose                                                                                                |
| ---------------------- | ------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Crash / analytics SDKs | Sentry, Firebase Analytics, etc.     | **Not in app today**                   | —                                                                                                      |
| Approximate location   | GPS / IP geolocation product feature | **Not collected for product features** | Hosting providers may see IP at network layer — treat as typical server logs; confirm with infra/legal |

### On-device only (not “collected” for Play if never leaves device)

| Data                             | Notes                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Local face-analysis consent flag | AsyncStorage when API offline — mirrors grant; not a substitute for server consent when API is live |
| Local notification schedule      | OS-scheduled weekly reminder; no push token registration in current build                           |

---

## 3. Google Play Data safety — suggested form mapping

> **[verify]** against current Play Console question wording at submission.

| Play category (typical)                              | Declare?                              | Collected                                                    | Shared                                               | Ephemeral?                       | Required for app? | Purpose labels (typical)              |
| ---------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------- | ----------------- | ------------------------------------- |
| Personal info → Email                                | Yes                                   | Yes                                                          | With auth/hosting processor (Supabase)               | No                               | Yes (account)     | App functionality, Account management |
| Personal info → User IDs                             | Yes                                   | Yes                                                          | Supabase, RevenueCat                                 | No                               | Yes               | App functionality, Account management |
| Photos and videos                                    | Yes                                   | Yes                                                          | Backend → Google Gemini (analysis)                   | **Yes — deleted after analysis** | Yes (to scan)     | App functionality                     |
| Health & fitness (if Play maps wellness scores here) | Yes if category applies               | Scores/profile                                               | Stored on our backend; Gemini sees photo for scoring | Scores retained; photo ephemeral | Yes (core)        | App functionality                     |
| App activity → Other / in-app                        | Routine, settings, consents           | Yes                                                          | Backend only                                         | No                               | Partial           | App functionality                     |
| App info and performance                             | No SDK today                          | —                                                            | —                                                    | —                                | —                 | —                                     |
| Financial info                                       | Purchase handled by stores/RevenueCat | Store/RC hold payment details; we store **entitlement/plan** | RevenueCat webhook → our `entitlements`              | No                               | For Pro           | App functionality                     |

**Data deletion:** Users can delete account in-app or via public web form; associated rows removed via `delete_user_data` / account deletion path.

**Encryption:** Data encrypted in transit (TLS). At-rest encryption: **[verify]** with Supabase/hosting defaults.

---

## 4. Apple App Privacy (nutrition labels) — suggested mapping

> **[verify]** against current App Store Connect privacy questionnaire.

| Privacy type                                                                                     | Linked to user?                          | Used for tracking? | Purposes          |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------- | ------------------ | ----------------- |
| Contact Info — Email Address                                                                     | Yes                                      | No                 | App Functionality |
| Identifiers — User ID                                                                            | Yes                                      | No                 | App Functionality |
| Photos or Videos                                                                                 | Yes (while processing)                   | No                 | App Functionality |
| Health & Fitness — Other Health (wellness scores / skin profile) if required by Apple’s taxonomy | Yes                                      | No                 | App Functionality |
| Purchases                                                                                        | Via StoreKit; entitlement on our servers | No                 | App Functionality |

**Tracking:** Declare **No** unless a future SDK uses data for cross-app advertising (ATT). Current app does not.

**Third-party partners (functionality):**

| Partner                               | Role            | Data involved                                                     |
| ------------------------------------- | --------------- | ----------------------------------------------------------------- |
| Supabase (planned production auth/DB) | Auth + Postgres | Account, profile, scans metadata, routine, consents, entitlements |
| Google Gemini (via backend only)      | Image analysis  | Scan photo + prompt; response scores parsed server-side           |
| RevenueCat                            | Subscriptions   | App user id, entitlement events (webhook)                         |
| Apple / Google                        | Billing         | Payment processed by stores — we do not store card numbers        |

API keys for Gemini/RevenueCat secrets stay **server-side** (never in the Expo bundle).

---

## 5. Children / audience

- Product audience **18+** (compliance rule).
- Do **not** declare directed to children.
- **[verify]** age rating questionnaire answers match.

---

## 6. What we do **not** currently collect/share

- Advertising ID / ATT tracking
- Contacts, precise location, microphone, photos from library
- Social graph, web browsing history
- Sale of personal data to data brokers

---

## 7. Open items (`TODO(spec)` / legal)

1. Final Privacy Policy URL + retention sentence (photo delete-after-analysis is **implemented** — legal text must match).
2. Confirm whether Play expects wellness scores under “Health and fitness”.
3. Confirm IP/log retention with hosting provider.
4. When analytics/crash reporting is added, update this worksheet **before** shipping that build.
5. Anonymised data sharing default remains off / versioned consent (`data_sharing` enum exists; not productized for users yet).

---

## 8. Sign-off checklist

- [ ] Engineering: worksheet matches current code (this ticket)
- [ ] Legal: Privacy Policy + store forms
- [ ] Product: store listings / screenshots don’t contradict §1–2
- [ ] Re-run after any new SDK or data processor

---

## Document history

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2026-10-05 | DERM-063 initial worksheet from schema + pipeline + mobile permissions |
