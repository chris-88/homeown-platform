# Directus dev stack (local)

This is the local dev stack for Directus + Postgres + MinIO (private file storage) + Gotenberg (PDF rendering).

## First run

```bash
cp .env.example .env
docker compose up -d
```

- Directus: `http://localhost:8055`
- MinIO: `http://localhost:9001`
- Gotenberg: `http://localhost:3000`

## Notes

- CORS is configured via `DIRECTUS_CORS_ORIGIN` (default: `http://localhost:5173`).
- MinIO bucket is created on startup by the `minio-init` service.
- Schema snapshot/apply scripts live in `scripts/`.

## Schema snapshots

From this folder (after the stack is running):

```bash
set -a; source .env; set +a
bash scripts/snapshot.sh
```

To apply a saved snapshot:

```bash
set -a; source .env; set +a
bash scripts/apply.sh
```

## Epic 02 (public calculator) — Directus setup notes

These are the minimum backend requirements for the anonymous-first calculator in `apps/web`.

### Collections

Create collections per the canonical spec in the docs repo:
- `calculator_snapshots` (unique `anon_session_id`, json `inputs_json`, json `outputs_json`, string `calc_version`, nullable `client_id`)
- `events` (append-only event log)

### Public role permissions (minimum)

For `calculator_snapshots`:
- **Create:** allow fields `id`, `anon_session_id`, `inputs_json`, `outputs_json`, `calc_version`
- **Update:** allow fields `anon_session_id`, `inputs_json`, `outputs_json`, `calc_version`
- **Read/List:** disallow (public must not be able to list/read arbitrary snapshots)

Notes:
- The web app uses `anon_session_id` as the record `id` so it can update without reading.
- `anon_session_id` must be unguessable (the web app uses `crypto.randomUUID()`).

### Flow 1 — `calc_results_presented` (engagement evidence)

Goal: whenever `calculator_snapshots` is created/updated (debounced by the web app), insert a staff-visible `events` row:
- `event_type = calc_results_presented`
- `visibility = staff`
- `actor_role = system`
- payload includes `anon_session_id`, `calc_version`, and a small summary of outputs (no free-text, no identifying fields)

Implementation approach (MVP):
- Trigger: items create + items update on `calculator_snapshots`
- Step: read the updated snapshot (by key)
- Step: create an `events` item from snapshot fields
- Optional volume control: read the most recent event for the session and only emit if the output summary changed

### Flow 2 — 30-day retention (anonymous snapshots)

Goal: delete only anonymous snapshots after 30 days:
- delete where `client_id IS NULL` and `date_updated < now() - 30 days`
- schedule daily (MVP)

If you prefer cron (instead of a Directus schedule flow), you can run:

```bash
set -a; source .env; set +a
bash scripts/cleanup-anon-snapshots.sh
```
