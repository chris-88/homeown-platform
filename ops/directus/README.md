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
