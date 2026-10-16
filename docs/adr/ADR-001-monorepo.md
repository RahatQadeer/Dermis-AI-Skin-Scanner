# ADR-001: npm workspaces monorepo

**Status:** Accepted  
**Date:** 2026-10-05

## Decision

Use npm workspaces with `apps/mobile`, `packages/domain`, and a future `backend/`.

## Why

Matches Cursor prompt v3 layout; shared domain package without publishing; simple for a one-team app.

## Consequences

Root `npm run ci` orchestrates quality gates. Git remote: https://github.com/RahatQadeer/Dermis-AI-Skin-Scanner.git
