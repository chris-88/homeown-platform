#!/usr/bin/env bash
set -euo pipefail

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:?set DIRECTUS_ADMIN_EMAIL}"
ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD:?set DIRECTUS_ADMIN_PASSWORD}"

DAYS="${DAYS:-30}"
cutoff="$(date -u -d "-${DAYS} days" '+%Y-%m-%dT%H:%M:%SZ')"

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

ids="$(
  curl -sS "${DIRECTUS_URL}/items/calculator_snapshots" \
    -H "Authorization: Bearer ${token}" \
    --get \
    --data-urlencode "fields[]=id" \
    --data-urlencode "limit=-1" \
    --data-urlencode "filter[client_id][_null]=true" \
    --data-urlencode "filter[date_updated][_lt]=${cutoff}" \
    | jq -r ".data[].id"
)"

if [[ -z "$ids" ]]; then
  echo "No anonymous snapshots to delete (cutoff: ${cutoff})."
  exit 0
fi

count=0
while IFS= read -r id; do
  if [[ -z "$id" || "$id" == "null" ]]; then
    continue
  fi

  curl -sS -X DELETE "${DIRECTUS_URL}/items/calculator_snapshots/${id}" \
    -H "Authorization: Bearer ${token}" >/dev/null
  count=$((count + 1))
done <<<"$ids"

echo "Deleted ${count} anonymous calculator snapshots (cutoff: ${cutoff})."

