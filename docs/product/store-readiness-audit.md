# Store readiness audit (DERM-069 / Part D7)

**Date:** 2026-10-05  
**Depends on:** DERM-061 claims, DERM-063 data safety, DERM-064 health, DERM-065 subscriptions, DERM-068 security.  
**Blocks:** DERM-083 production submission (“D7 complete”).

## Engineering inventory

| Asset / field                 | Status                                                                 |
| ----------------------------- | ---------------------------------------------------------------------- |
| App icon 1024×1024            | OK — `apps/mobile/assets/images/icon.png` (CI)                         |
| Splash icon                   | OK — `splash-icon.png` wired in `app.json`                             |
| Android adaptive icon         | OK — fg/bg 512, mono 432                                               |
| Play feature graphic 1024×500 | **Missing** — add under `docs/store/android/` before Play listing      |
| Store screenshots             | **Missing** — see `docs/store/screenshot-guide.md`                     |
| Listing draft                 | Template — `docs/store/listing-copy.draft.md` (`TODO(spec)`)           |
| Privacy / Terms URLs          | Env stubs; production HTTPS **TODO(spec)**                             |
| Support URL                   | Documented in `docs/store/public-urls.md` — **TODO(spec)**             |
| Public account deletion URL   | Backend `GET /delete-account`; canonical HTTPS host **TODO(spec)**     |
| Demo account for reviewers    | Template only — `docs/store/demo-account.template.md`                  |
| Age rating 18+                | Policy in compliance + data-safety; console questionnaire **[verify]** |
| Bundle ID / package / EAS     | DERM-081                                                               |

## Store console checklist

### App Store Connect

- [ ] App icon / screenshots (required device sizes) **[verify]** current Apple sizes
- [ ] Name, subtitle, description, keywords — legal-approved; no PRODUCT.md D4 banned claims
- [ ] Privacy Policy URL (https)
- [ ] Support URL (https)
- [ ] Age rating questionnaire → **17+ / 18+** per product policy
- [ ] App Privacy nutrition labels match `data-safety-worksheet.md`
- [ ] Subscription group + localized prices via RevenueCat / ASC
- [ ] Demo account notes for review (when API auth is live)

### Google Play Console

- [ ] Hi-res icon, feature graphic, phone/tablet screenshots **[verify]** sizes
- [ ] Short + full description — D4 clean; health strings from `compliance.ts`
- [ ] Privacy Policy URL
- [ ] Data safety form matches `data-safety-worksheet.md`
- [ ] Content rating → audience **18+**
- [ ] Account deletion URL (Play policy) → deployed `/delete-account`
- [ ] Demo credentials for review if gated features need login

## Sign-off

- [x] Engineering: icon/splash inventory + CI asset guards + store doc pack
- [ ] Legal: listing copy, Privacy/Terms/Support URLs, deletion policy wording
- [ ] Product: screenshots captured; demo account filled for staging; age forms submitted

## Related docs

- `docs/store/` — listing, screenshots, demo account, public URLs
- `docs/product/claims-audit.md`, `health-declarations.md`, `data-safety-worksheet.md`, `subscription-disclosure-review.md`, `security-audit.md`
