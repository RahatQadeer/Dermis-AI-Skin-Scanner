# Subscription disclosure review (DERM-065)

**Date:** 2026-10-05  
**Source:** PRODUCT.md plans/pricing + App Store / Play subscription disclosure norms (D3).  
**UI:** `PaywallScreen`, `PaywallPlanPicker`, `PaywallBillingSummary`, `PaywallLegalFooter`.

## Required disclosures — checklist

| Requirement                                     | Status | Where                                         |
| ----------------------------------------------- | ------ | --------------------------------------------- |
| Subscription title / product                    | OK     | Paywall title “Dermis Pro”                    |
| Length of subscription (annual / monthly)       | OK     | Plan cards + period labels                    |
| Price (localized from store when RC configured) | OK     | Plan cards; mock fallback when no offerings   |
| Savings % from real prices only                 | OK     | `computeSavingsPercent` / `savingsBadgeLabel` |
| Free trial terms (annual)                       | OK     | Trial note + `trialTimeline`                  |
| Monthly trial clarified (none in current offer) | OK     | `trialTimeline`                               |
| Auto-renewal                                    | OK     | `autoRenews`                                  |
| Renew / charge window (24h)                     | OK     | `renewWindow`                                 |
| Charged to Apple/Google account                 | OK     | `chargeToAccount`                             |
| How to cancel                                   | OK     | `cancelHint`                                  |
| Restore Purchases                               | OK     | Paywall CTA; Profile navigates to paywall     |
| Privacy Policy + Terms links                    | OK     | Footer (env URLs)                             |
| Selected-plan billing summary near CTA          | OK     | `PaywallBillingSummary`                       |

## CI guard

`apps/mobile/src/copy/subscriptionDisclosures.test.ts` asserts required paywall disclosure fields stay non-empty.

## Still `[verify]` / `TODO(spec)` before submission

1. Confirm live RevenueCat introductory offers match `trialTimeline` (trial eligibility by region).
2. Set `EXPO_PUBLIC_TERMS_URL` + `EXPO_PUBLIC_PRIVACY_URL` so footer links are tappable.
3. Screenshot review: disclosures readable without scrolling past fold if store reviewers require (may need layout QA).
4. Legal review of exact auto-renew wording vs Apple/Google current guidelines.

## Profile Restore

Profile **Restore Purchases** opens the paywall where restore runs via RevenueCat — acceptable; optional deep-link to auto-trigger restore can wait.
