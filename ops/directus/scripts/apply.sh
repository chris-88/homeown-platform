#!/usr/bin/env bash
set -euo pipefail

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:?set DIRECTUS_ADMIN_EMAIL}"
ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD:?set DIRECTUS_ADMIN_PASSWORD}"

SNAPSHOT_FILE="${SNAPSHOT_FILE:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/schema/snapshot.json}"

if [[ ! -f "$SNAPSHOT_FILE" ]]; then
  echo "Snapshot file not found: $SNAPSHOT_FILE" >&2
  exit 1
fi

token="$(
  curl -sS -X POST "${DIRECTUS_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
    | jq -r ".data.access_token"
)"

if [[ -z "$token" || "$token" == "null" ]]; then
  echo "Failed to obtain Directus access token" >&2
  exit 1
fi

payload="$(jq -n --slurpfile snapshot "$SNAPSHOT_FILE" '{ snapshot: $snapshot[0] }')"

curl -sS -X POST "${DIRECTUS_URL}/schema/apply" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  | jq "."

echo "Applied snapshot: $SNAPSHOT_FILE"

