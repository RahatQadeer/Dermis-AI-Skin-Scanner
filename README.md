# Dermis

Mobile skin wellness app — **Expo SDK 57**, npm workspaces monorepo.

**GitHub:** https://github.com/RahatQadeer/Dermis-AI-Skin-Scanner

## Docs

- Handoff: `docs/product/PROGRESS.md`
- Backlog: `docs/product/PHASES.md`
- Product truth: `docs/product/PRODUCT.md`, `docs/product/SCREENS.md`

## Setup

```bash
npm install
npm run mobile    # Expo dev server (apps/mobile)
npm run lint
npm run typecheck
npm run verify:max-lines
HUSKY=0 npm run ci   # full CI locally
```

CI details: `docs/ci.md`.

Add `docs/Dermis_App_Documentation.pdf` and `docs/screens/` when available.

Rules: `.cursor/rules/` and `Dermis_Cursor_Prompt_v3.md`.
