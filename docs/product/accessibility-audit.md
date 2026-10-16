# Accessibility audit (DERM-066)

**Date:** 2026-10-05  
**Scope:** Shared primitives + high-traffic flows (auth, scan, paywall, results/progress).  
**Baseline:** WCAG 2.1 AA for text contrast; ≥44pt touch targets; explicit SR labels on interactive / progress UI.

## Method

1. Inventory interactive controls and progress widgets.
2. Measure theme colour pairs with `contrastRatio` (`apps/mobile/src/lib/contrast.ts`).
3. Fix critical gaps in shared components; document remaining `[verify]` device QA.
4. CI: `apps/mobile/src/lib/accessibilityAudit.test.ts`.

## Theme contrast (AA ≥4.5:1)

| Pair                         | Status | Notes                                      |
| ---------------------------- | ------ | ------------------------------------------ |
| ink on background / surface  | OK     | Unchanged                                  |
| mute on background / surface | OK     | Darkened `#61705C` → `#5E6D59`             |
| inkMuted on bg / surface     | OK     | Darkened `#8A9885` → `#5F6E5A`             |
| pink (links) on surface      | OK     | Darkened `#E9849A` → `#B84D66`             |
| white on green (selected UI) | OK     | Darkened `#5FA36A` → `#45804F`             |
| sky / amber on surface       | N/A    | Decorative / chart accents — not body text |
| red on surface               | OK*    | UI / danger accents; verify button labels  |

\*Not asserted in CI for every decorative pair; body/link pairs are guarded.

## Touch targets (≥44pt)

| Control             | Change                                         |
| ------------------- | ---------------------------------------------- |
| `Chip`              | `minHeight: touchTargets.min`                  |
| `SegmentedControl`  | Segment + row use `touchTargets.min`           |
| `IconButton`        | Already ≥44; now references `touchTargets.min` |
| `ZoneMap` markers   | Visual size unchanged; `hitSlop` pads to ≥44   |
| `TabBar` / `Button` | Already ≥44                                    |

## Screen reader / semantics

| Item           | Change                                                                |
| -------------- | --------------------------------------------------------------------- |
| `ProgressRing` | `accessibilityLabel` + existing `progressbar` value                   |
| `ScoreBar`     | `accessibilityLabel` (`label, N of 100`); child nodes not announced   |
| Legal footers  | Explicit `accessibilityLabel` on links; auth links not nested in Text |
| Camera preview | `previewA11y` label on live + mock preview                            |

## CI guard

`accessibilityAudit.test.ts` asserts:

- `touchTargets.min === 44`
- Required text/UI contrast pairs ≥4.5:1
- Chip / SegmentedControl / IconButton source uses `touchTargets.min`
- ProgressRing / ScoreBar expose `accessibilityLabel`

## Remaining `[verify]` (device QA)

1. VoiceOver (iOS) + TalkBack (Android) smoke: welcome → quiz → paywall → home → camera → results → profile.
2. Dynamic type / large content size (AppText does not yet set `maxFontSizeMultiplier` policy).
3. Reduce-motion: confirm mascot / confetti / skeleton honour `useReduceMotion`.
4. Zone map dense markers: confirm hitSlop does not cause accidental adjacent activation.
5. Store screenshots after pink/green darkening (brand still recognisable).

## Out of scope this ticket

Full WCAG AA of every screen, ESLint jsx-a11y plugin, dynamic-type product policy.
