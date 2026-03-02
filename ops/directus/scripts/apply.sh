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

if ! command -v jq >/dev/null 2>&1; then
  echo "Missing required command: jq" >&2
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

schema="$(jq -c '(.data // .)' "$SNAPSHOT_FILE")"

resp="$(
  curl -sS -X POST "${DIRECTUS_URL}/schema/diff" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d "$schema" \
    -w $'\n%{http_code}'
)"

status="${resp##*$'\n'}"
body="${resp%$'\n'*}"

if [[ "$status" == "204" ]]; then
  echo "✓ schema already up to date (no diff)"
  exit 0
fi

if [[ "$status" != "200" ]]; then
  echo "Failed to compute schema diff (status ${status}):" >&2
  echo "$body" | jq "." >&2 || true
  exit 1
fi

diff_data="$(echo "$body" | jq -c '.data')"

resp2="$(
  curl -sS -X POST "${DIRECTUS_URL}/schema/apply" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d "$diff_data" \
    -w $'\n%{http_code}'
)"

status2="${resp2##*$'\n'}"
body2="${resp2%$'\n'*}"

if [[ "$status2" != "204" && "$status2" != "200" ]]; then
  echo "Failed to apply schema diff (status ${status2}):" >&2
  echo "$body2" | jq "." >&2 || true
  exit 1
fi

echo "✓ applied snapshot: $SNAPSHOT_FILE"
