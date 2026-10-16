# Health declarations and disclaimers (DERM-064)

**Date:** 2026-10-05  
**Source of truth:** PRODUCT.md “Required disclaimers” + `apps/mobile/src/copy/compliance.ts`

## Required messages

| Requirement                          | Copy key                                               | Notes                                             |
| ------------------------------------ | ------------------------------------------------------ | ------------------------------------------------- |
| Not a medical device                 | `compliance.notMedicalDevice` / `healthDeclaration`    | Also Welcome quiz footnote                        |
| Wellness estimates, not diagnosis    | `compliance.estimatesOnly` / `healthDeclaration`       |                                                   |
| Consult dermatologist / professional | `compliance.consultProfessional` / `healthDeclaration` | Qualified use — not an unqualified clinical claim |

Canonical full block: `compliance.healthDeclaration`.

## In-app surfaces

| Surface               | Presentation                                    |
| --------------------- | ----------------------------------------------- |
| Welcome               | Quiz footnote + `HealthDisclaimer`              |
| Home                  | `HealthDisclaimer` compact                      |
| Analysing             | `HealthDisclaimer` compact                      |
| Results               | `HealthDisclaimer` full                         |
| PDF export            | `compliance.healthDeclaration`                  |
| Recommendations       | Existing subtitle/footnote + `HealthDisclaimer` |
| AI consent            | `HealthDisclaimer` full                         |
| Privacy screen        | `privacy.notMedical` → healthDeclaration        |
| Profile About         | `HealthDisclaimer` full                         |
| Profile identity line | Estimates-only (compact under name)             |

Component: `apps/mobile/src/components/HealthDisclaimer.tsx`.

## Store listings (DERM-069)

Use these strings (or legal-approved equivalents) in App Store / Play descriptions:

- `compliance.storeListingNotMedicalDevice`
- `compliance.storeListingWellnessEstimates`
- `compliance.consultProfessional`

See `docs/product/store-readiness-audit.md` and `docs/store/listing-copy.draft.md`.

## Sign-off

- [x] Engineering: surfaces wired to shared copy
- [ ] Legal: store listing wording
- [ ] Product: screenshot review still shows disclaimers where required
