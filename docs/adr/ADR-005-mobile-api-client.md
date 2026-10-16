# ADR-005: Mobile typed API client with mock fallback

## Status

Accepted (DERM-050)

## Context

Epic 2 screens used in-memory mocks. Epic 3 exposed REST under `/v1/*`. The app must call the backend without shipping secrets, and CI/demo builds must keep working without a server.

## Decision

1. Typed `fetch` client in `apps/mobile/src/lib/api` using `EXPO_PUBLIC_API_URL`.
2. When the URL is empty, features keep mock/local state (default for CI).
3. When set, login mints a memory-backend bearer (`user:<uuid>:<email>`) via `SessionProvider` until Supabase Auth is wired.
4. Feature modules own `api/` wrappers; hooks choose API vs mock.

TanStack Query is deferred until caching/invalidation becomes painful (architecture allows introducing it later with approval).

## Consequences

- Profile settings, account export/delete, routine mutations, and home quota overlay work against a live `@dermis/backend`.
- Scan upload wired (051); RevenueCat wired (052). Progress history and full consent UI remain (060).
