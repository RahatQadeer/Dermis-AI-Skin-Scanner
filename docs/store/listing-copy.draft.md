# Store listing copy (draft) — DERM-069

All fields marked `TODO(spec)` need legal/product approval. Do not paste prototype prices as “current” store prices.

## App name

- **Name:** Dermis
- **Subtitle / short name:** `TODO(spec)`

## Descriptions

### Short (Play ≤80 chars) / subtitle support

`TODO(spec)`

### Full description

`TODO(spec)` — must include (or legal equivalents of) these compliance strings from `apps/mobile/src/copy/compliance.ts`:

- storeListingNotMedicalDevice: Dermis is a wellness app, not a medical device. It does not diagnose, treat, cure, or prevent disease.
- storeListingWellnessEstimates: Skin scores are estimates for personal wellness tracking only.
- consultProfessional: For medical concerns, consult a dermatologist or other qualified professional.

### Keywords (iOS)

`TODO(spec)`

### What’s New

`TODO(spec)`

## Banned claims (PRODUCT.md D4)

Do not introduce marketing claims from the PRODUCT.md D4 banned list. Prefer cloud + Google Gemini framing already used in-app. Automated guard: `apps/mobile/src/copy/claimsAudit.ts` (also run against this draft in CI).
