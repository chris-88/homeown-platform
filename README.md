# Homeown Platform (Cohort Zero)

This repo contains all runnable code + ops config for the Cohort Zero MVP platform.

## Canonical spec & tickets

The PRD and working tickets are canonical in the `homeown` docs repo (this Obsidian vault):
- `10_technology/platform-prd.md`
- `10_technology/build/work-order.md` and `10_technology/build/epic-*/story-*.md`

## Local dev (Sprint 0)

### Web app
```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

### Backend (Directus dev stack)
```bash
cd ops/directus
cp .env.example .env
docker compose up -d
```

