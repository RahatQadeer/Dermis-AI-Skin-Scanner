# ADR-006: RevenueCat on mobile

**Status:** Accepted (DERM-052)

## Context

Pro billing must use App Store / Play Billing via RevenueCat. Server plan tier remains authoritative via the existing webhook (`DERM-042`).

## Decision

1. Use `react-native-purchases` on iOS/Android only; web uses stub module (`revenueCatApi.web.ts`) so CI/static export stays green.
2. Configure with `EXPO_PUBLIC_REVENUECAT_*_API_KEY`; when unset, paywall shows mock reference prices and purchase/restore explain billing is unavailable.
3. `Purchases.logIn(appUserId)` uses the UUID from the memory bearer (later Supabase user id) so webhook events match backend rows.
4. After purchase/restore, app bumps `QuotaRefreshProvider` to re-fetch `GET /v1/quota` — no client-side plan override.

## Consequences

- Sandbox/store QA requires RevenueCat project, products, and entitlement id `pro`.
- Entitlement may lag webhook by seconds; copy sets expectations on paywall success toast.
