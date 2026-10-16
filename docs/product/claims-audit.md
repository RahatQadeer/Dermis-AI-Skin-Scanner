# Claims and copy audit (DERM-061)

**Date:** 2026-10-05  
**Scope:** `apps/mobile/src/copy/**` (+ related mock product blurbs checked manually)

## Method

1. Manual review against PRODUCT.md banned list (D4).
2. Automated guard: `apps/mobile/src/copy/claimsAudit.test.ts` fails CI if banned substrings reappear in the copy catalog.

## Required disclaimers — present

| Requirement                       | Location                                      |
| --------------------------------- | --------------------------------------------- |
| Not a medical device              | Welcome footnote, Profile about, PDF, consent |
| Consult dermatologist / clinician | `compliance.consultProfessional`, PDF         |
| Wellness / estimates framing      | Home, analysing, results, recommendations     |

## Banned list — status

| Claim / pattern                        | Status                                            |
| -------------------------------------- | ------------------------------------------------- |
| On-device / photos never leave device  | Cleared; privacy bullet rewritten                 |
| Clinical / Derm-built clinical         | None found                                        |
| 41k profiles / fixed score projections | None found                                        |
| 68 landmarks                           | Absent; analysing steps remain TBD (`TODO(spec)`) |
| UV index card                          | Not in app (SCREENS: remove or wire — N/A)        |
| Skin age as measurement                | Not shown                                         |
| “Full zone map on every scan”          | Paywall/results clarified to **each Pro scan**    |
| Treatment-directive retinol/etc.       | None found; routine/recs wellness-framed          |

## Copy touch-ups in this ticket

- Privacy cloud bullet (user-facing, not meta “claim” wording)
- Auth mascot idle (avoid “stay between us” ambiguity)
- Paywall + results zone-map Pro wording

## Remaining `TODO(spec)` (not invented)

1. Final photo retention / Privacy Policy sentence (legal)
2. Analysing landmark/step naming if pipeline changes
3. Product catalog source (recommendations footnote already honest)
4. Store listing screenshots/text (out of app copy tree)

## Automation

- `findBannedClaim` + catalog walk in `claimsAudit.test.ts`
- Dev gallery copy is included in the catalog walk (keep it clean too)
