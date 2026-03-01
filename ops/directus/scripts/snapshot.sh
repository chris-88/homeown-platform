#!/usr/bin/env bash
set -euo pipefail

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:?set DIRECTUS_ADMIN_EMAIL}"
ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD:?set DIRECTUS_ADMIN_PASSWORD}"

OUT_DIR="${OUT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/schema}"
OUT_FILE="${OUT_FILE:-$OUT_DIR/snapshot.json}"

mkdir -p "$OUT_DIR"

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

curl -sS "${DIRECTUS_URL}/schema/snapshot" \
  -H "Authorization: Bearer ${token}" \
  | jq "." >"$OUT_FILE"

echo "Wrote snapshot: $OUT_FILE"

