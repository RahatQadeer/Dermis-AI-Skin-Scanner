# ADR-002: Theme tokens and no hard-coded hex

**Status:** Accepted  
**Date:** 2026-10-05

## Decision

All app colours, spacing, radii, typography, shadows, and motion durations live under `apps/mobile/src/theme/`. Hex colour literals are allowed only in `colors.ts`; ESLint `no-restricted-syntax` rejects hex elsewhere in `*.ts`/`*.tsx`.

Fonts: Fredoka (headings) and Nunito (body) via `@expo-google-fonts/*`.

## Why

Part B4 / DERM-003 — one design system, light theme now with room for dark later.

## Consequences

Native config (`app.json`) may still use brand hex for splash/adaptive icons (not TypeScript). Components must import tokens.
