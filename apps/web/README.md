# Web app (Vite + React + TS)

## Env vars (non-secret)

Set these in `.env` (see `.env.example`):

- `VITE_DIRECTUS_URL` (e.g. `http://localhost:8055`)
- `VITE_APP_ENV` (`dev|staging|prod`)
- `VITE_APP_VERSION` (git SHA or semver)

For GitHub Pages deploys, set `VITE_DIRECTUS_URL` via repository variables (or workflow env) so the production build does not point to localhost.

## Routing (GitHub Pages)

This app uses hash routing so deep links work on GitHub Pages:

- `/#/calc`
- `/#/auth/login`
- `/#/app/client`
- `/#/app/agent`

## Commands

```bash
cp .env.example .env
npm install
npm run dev
```

## Epic 02 (calculator) — data guardrails

- Anonymous-first: no identifying inputs.
- Snapshot writes go to Directus `calculator_snapshots` with strict numeric/enum schemas (see `src/calc/model.ts`).
