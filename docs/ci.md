# Continuous integration

**Repo:** [RahatQadeer/Dermis-AI-Skin-Scanner](https://github.com/RahatQadeer/Dermis-AI-Skin-Scanner)

## Workflow

GitHub Actions runs on every **pull request** and on **push** to `main` / `master`:

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run verify:max-lines`
6. `npm test`
7. `npm run build` (Expo web export for `@dermis/mobile`)

Config: `.github/workflows/ci.yml`

## Local

```bash
npm run ci
```

`HUSKY=0` is set in CI so `prepare` does not run Husky hooks on the runner.

## Required checks (GitHub)

To satisfy DERM-002 (“red CI blocks merge”), in the repo **Settings → Branches → Branch protection**:

- Require status check **CI / quality** (or the job name shown on PRs) before merging.

Until the repo is on GitHub, run `npm run ci` locally before opening PRs.
