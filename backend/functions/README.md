# Edge / deploy adapters

Thin wrappers around `createBackendFromEnv` / `createApp` from `@dermis/backend`.

DERM-041 ships a Node HTTP listener (`npm run start --workspace=@dermis/backend`).
Supabase Edge Function entrypoints can import the same `createApp` handler later without rewriting services.
