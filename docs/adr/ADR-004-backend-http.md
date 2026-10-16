# ADR-004: Backend HTTP package layout

**Status:** Accepted  
**Date:** 2026-10-05

## Decision

Place API code in `@dermis/backend` (`backend/` workspace): handlers → services → repositories + auth ports. HTTP uses the Fetch `Request`/`Response` model (Node `http` adapter for local listen). Supabase Auth/PostgREST are behind ports using `fetch` — no Edge runtime required for unit tests.

## Why

Matches Part C layering; keeps migrations under `backend/supabase/`; tests run in CI with in-memory auth/profile without live Supabase.

## Consequences

Deploy target (Edge Functions vs long-running Node) can wrap `createApp` later (`backend/functions/`). Mobile still mocks until DERM-050.
