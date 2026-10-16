# ADR-003: Shared domain package with split exports

**Status:** Accepted  
**Date:** 2026-10-05

## Decision

Put pure rules in `@dermis/domain`:

- `@dermis/domain` — types + display helpers (`scoreColor`, `deltaColor`) for the app
- `@dermis/domain/server` — `calculateIndex`, quota, gating, password strength for the backend

## Why

Server is source of truth for index/quota/entitlement; sharing formula code without letting the client enforce it.

## Consequences

Backend imports `server`; mobile must not use `server` for enforcement. Unit tests run via Node `--experimental-strip-types`.
