# ADR-009: AI consent gate before first scan

**Status:** Accepted (DERM-060)

## Context

PRODUCT.md requires an explicit screen before the first scan that names Google Gemini, with no analysis API call until consent is recorded. DERM-051 added a mid-upload sheet only.

## Decision

1. Full-screen `AiConsentScreen` at `/(scan)/ai-consent` is the primary gate.
2. All scan entry points use `scanEntryHref` / `useScanNavigation` (camera only after grant).
3. `ConsentProvider` loads grant from API when live, else AsyncStorage for the consent version.
4. In-app `PrivacyScreen` explains cloud/Gemini flow; public Privacy Policy URL remains the legal doc.
5. Analysing sheet remains a fallback if the API returns `consent_required`.

## Consequences

- Retention wording stays draft (`TODO(spec)`) until legal sign-off.
- Camera redirects to consent if opened without a grant.
