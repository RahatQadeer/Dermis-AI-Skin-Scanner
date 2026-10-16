# Performance and crash-free audit (DERM-070)

**Date:** 2026-10-05  
**Scope:** crash UX, list/render hygiene, scan memory caps, reduce-motion, CI guards.  
**Out of scope (ask-first):** Sentry / analytics SDK, FlashList, `expo-image`, native bundle budgets (DERM-081 EAS).

## Inventory

| Area            | Status                                                          |
| --------------- | --------------------------------------------------------------- |
| Hermes          | Expo 57 / RN 0.86 default (no explicit `jsEngine` override)     |
| Reanimated      | Loaded first in root layout; worklets dep present               |
| ErrorBoundary   | Custom `RootErrorBoundary` (compliant copy + retry)             |
| Crash SDK       | **Not shipped** — matches `data-safety-worksheet.md`            |
| Lists           | `ScrollView` + `.map()`; memoized `ListRow` / `ProductCard`     |
| Scroll clipping | `Screen` scroll → `removeClippedSubviews`                       |
| Scan upload     | Client resize/cap (`scanImageLimits.ts`) + server 8 MiB Zod max |
| Reduce motion   | Toast, Skeleton, FlashOverlay, mascot, confetti                 |
| CI web export   | Exists; no JS size ceiling yet                                  |

## Fixes in this ticket

1. Branded root `ErrorBoundary` with try-again; `__DEV__` logs error message.
2. `React.memo` on `ListRow` and `ProductCard`.
3. `removeClippedSubviews` on scrolled `Screen`.
4. CI: `performanceAudit.test.ts`.

## Crash-free strategy (pre-Sentry)

- Rely on Expo Router boundary + local try/catch on network/billing/camera paths.
- Measure crash-free on first EAS internal builds (DERM-081) via store pre-launch reports.
- Do **not** add Sentry until data-safety worksheet + ADR + `securityAudit` allowlist update.

## `[verify]` device QA

1. Cold start after font load (low-end Android).
2. Camera → resize → upload memory.
3. Reduce motion on/off for flash / confetti / mascot.
4. Long progress / recommendations scroll.
5. Force a render error in `__DEV__` and confirm retry recovers.

## Follow-ons

- **Sentry ticket:** ask before adding `@sentry/react-native`; update data-safety.
- **FlashList:** when API-backed history is large enough to need virtualization.
- Bundle size ceiling after first production web/native artifacts exist.
