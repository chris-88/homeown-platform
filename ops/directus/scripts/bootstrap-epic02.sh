#!/usr/bin/env bash
set -euo pipefail

DIRECTUS_URL="${DIRECTUS_URL:-${DIRECTUS_PUBLIC_URL:-http://localhost:8055}}"
ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:?set DIRECTUS_ADMIN_EMAIL}"
ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD:?set DIRECTUS_ADMIN_PASSWORD}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd jq

API_STATUS=""
API_BODY=""

api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"

  local resp
  if [[ -n "$data" ]]; then
    resp="$(
      curl -sS -X "$method" "${DIRECTUS_URL}${path}" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "$data" \
        -w $'\n%{http_code}'
    )"
  else
    resp="$(
      curl -sS -X "$method" "${DIRECTUS_URL}${path}" \
        -H "Authorization: Bearer ${token}" \
        -w $'\n%{http_code}'
    )"
  fi

  API_STATUS="${resp##*$'\n'}"
  API_BODY="${resp%$'\n'*}"
}

api_get_query() {
  local path="$1"
  shift

  local resp
  resp="$(
    curl -sS --get "${DIRECTUS_URL}${path}" \
      -H "Authorization: Bearer ${token}" \
      "$@" \
      -w $'\n%{http_code}'
  )"

  API_STATUS="${resp##*$'\n'}"
  API_BODY="${resp%$'\n'*}"
}

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

echo "Directus Epic 02 bootstrap: ${DIRECTUS_URL}"

public_policy_id="$(
  api GET "/policies"
  if [[ "$API_STATUS" != "200" ]]; then
    echo "Failed to fetch policies (status ${API_STATUS})." >&2
    echo "$API_BODY" | jq "." >&2 || true
    exit 1
  fi

  echo "$API_BODY" \
    | jq -r '.data[] | select(.name == "$t:public_label" or .name == "Public") | .id' \
    | head -n 1
)"

if [[ -z "$public_policy_id" || "$public_policy_id" == "null" ]]; then
  echo "Failed to find Directus Public policy id (expected name \"$t:public_label\" or \"Public\")." >&2
  exit 1
fi

echo "Public policy id: ${public_policy_id}"

api GET "/policies/${public_policy_id}"
if [[ "$API_STATUS" != "200" ]]; then
  echo "Failed to fetch Public policy (status ${API_STATUS})." >&2
  echo "$API_BODY" | jq "." >&2 || true
  exit 1
fi

public_policy_app_access="$(echo "$API_BODY" | jq -r '.data.app_access')"
if [[ "$public_policy_app_access" != "true" ]]; then
  api PATCH "/policies/${public_policy_id}" '{"app_access":true}'
  if [[ "$API_STATUS" != "200" ]]; then
    echo "Failed to enable app_access on Public policy (status ${API_STATUS})." >&2
    echo "$API_BODY" | jq "." >&2 || true
    exit 1
  fi
  echo "✓ enabled Public policy app_access"
else
  echo "✓ Public policy app_access already enabled"
fi

apply_epic02_schema() {
  api GET "/schema/snapshot"
  if [[ "$API_STATUS" != "200" ]]; then
    echo "Failed to fetch schema snapshot (status ${API_STATUS}):" >&2
    echo "$API_BODY" | jq "." >&2 || true
    exit 1
  fi

  local current
  current="$(echo "$API_BODY" | jq -c '.data')"

  local desired
  desired="$(
    echo "$current" | jq -c '
      def upsert_collection($c):
        .collections = (
          (.collections // [])
          | if any(.[]; .collection == $c.collection)
            then map(if .collection == $c.collection then . * $c else . end)
            else . + [$c]
            end
        );

      def upsert_field($f):
        .fields = (
          (.fields // [])
          | if any(.[]; .collection == $f.collection and .field == $f.field)
            then map(if .collection == $f.collection and .field == $f.field then . * $f else . end)
            else . + [$f]
            end
        );

      .
      | .collections = ((.collections // []) | map(select(.collection != "test_uuid")))
      | .fields = ((.fields // []) | map(select(.collection != "test_uuid")))
      | .relations = (
          (.relations // [])
          | map(
              select(
                ((.collection // "") != "test_uuid")
                and ((.related_collection // "") != "test_uuid")
                and ((.many_collection // "") != "test_uuid")
                and ((.one_collection // "") != "test_uuid")
              )
            )
        )
      | upsert_collection({
          collection: "calculator_snapshots",
          meta: {
            icon: "calculate",
            note: "Anonymous calculator snapshots (no PII).",
            hidden: false,
            singleton: false
          },
          schema: { name: "calculator_snapshots" }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "id",
          type: "uuid",
          meta: { hidden: true, interface: "input", readonly: true },
          schema: {
            data_type: "uuid",
            default_value: "gen_random_uuid()",
            is_nullable: false,
            is_unique: true,
            is_primary_key: true,
            has_auto_increment: false
          }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "anon_session_id",
          type: "string",
          meta: { interface: "input", required: true },
          schema: { is_nullable: false, is_unique: true }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "client_id",
          type: "uuid",
          meta: { interface: "input" },
          schema: { is_nullable: true }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "inputs_json",
          type: "json",
          meta: { interface: "input-code", options: { language: "json" }, required: true },
          schema: { is_nullable: false }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "outputs_json",
          type: "json",
          meta: { interface: "input-code", options: { language: "json" }, required: true },
          schema: { is_nullable: false }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "calc_version",
          type: "string",
          meta: { interface: "input" },
          schema: { is_nullable: true }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "results_presented_signature",
          type: "string",
          meta: {
            interface: "input",
            hidden: true,
            readonly: true,
            note: "Internal signature used to dedupe calc_results_presented events."
          },
          schema: { is_nullable: true }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "date_created",
          type: "timestamp",
          meta: { interface: "datetime", readonly: true, hidden: true, special: ["date-created"] },
          schema: { data_type: "timestamp with time zone", default_value: "CURRENT_TIMESTAMP", is_nullable: true }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "date_updated",
          type: "timestamp",
          meta: { interface: "datetime", readonly: true, hidden: true, special: ["date-updated"] },
          schema: { data_type: "timestamp with time zone", default_value: "CURRENT_TIMESTAMP", is_nullable: true }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "user_created",
          type: "uuid",
          meta: { interface: "input", readonly: true, hidden: true, special: ["user-created"] },
          schema: { data_type: "uuid", is_nullable: true }
        })
      | upsert_field({
          collection: "calculator_snapshots",
          field: "user_updated",
          type: "uuid",
          meta: { interface: "input", readonly: true, hidden: true, special: ["user-updated"] },
          schema: { data_type: "uuid", is_nullable: true }
        })

      | upsert_collection({
          collection: "events",
          meta: {
            icon: "bolt",
            note: "Append-only event log (staff-visible by default).",
            hidden: false,
            singleton: false
          },
          schema: { name: "events" }
        })
      | upsert_field({
          collection: "events",
          field: "event_type",
          type: "string",
          meta: { interface: "input", required: true },
          schema: { is_nullable: false }
        })
      | upsert_field({
          collection: "events",
          field: "client_id",
          type: "uuid",
          meta: { interface: "input" },
          schema: { is_nullable: true }
        })
      | upsert_field({
          collection: "events",
          field: "property_case_id",
          type: "uuid",
          meta: { interface: "input" },
          schema: { is_nullable: true }
        })
      | upsert_field({
          collection: "events",
          field: "actor_role",
          type: "string",
          meta: {
            interface: "select-dropdown",
            options: {
              choices: [
                { text: "client", value: "client" },
                { text: "staff", value: "staff" },
                { text: "agent", value: "agent" },
                { text: "system", value: "system" }
              ]
            },
            required: true
          },
          schema: { is_nullable: false, default_value: "system" }
        })
      | upsert_field({
          collection: "events",
          field: "actor_user_id",
          type: "uuid",
          meta: { interface: "input" },
          schema: { is_nullable: true }
        })
      | upsert_field({
          collection: "events",
          field: "payload",
          type: "json",
          meta: { interface: "input-code", options: { language: "json" }, required: true },
          schema: { is_nullable: false }
        })
      | upsert_field({
          collection: "events",
          field: "visibility",
          type: "string",
          meta: {
            interface: "select-dropdown",
            options: {
              choices: [
                { text: "client", value: "client" },
                { text: "staff", value: "staff" }
              ]
            },
            required: true
          },
          schema: { is_nullable: false, default_value: "staff" }
        })
      | upsert_field({
          collection: "events",
          field: "date_created",
          type: "timestamp",
          meta: { interface: "datetime", readonly: true, hidden: true, special: ["date-created"] },
          schema: { data_type: "timestamp with time zone", default_value: "CURRENT_TIMESTAMP", is_nullable: true }
        })
      | upsert_field({
          collection: "events",
          field: "date_updated",
          type: "timestamp",
          meta: { interface: "datetime", readonly: true, hidden: true, special: ["date-updated"] },
          schema: { data_type: "timestamp with time zone", default_value: "CURRENT_TIMESTAMP", is_nullable: true }
        })
      | upsert_field({
          collection: "events",
          field: "user_created",
          type: "uuid",
          meta: { interface: "input", readonly: true, hidden: true, special: ["user-created"] },
          schema: { data_type: "uuid", is_nullable: true }
        })
      | upsert_field({
          collection: "events",
          field: "user_updated",
          type: "uuid",
          meta: { interface: "input", readonly: true, hidden: true, special: ["user-updated"] },
          schema: { data_type: "uuid", is_nullable: true }
        })
    '
  )"

  api POST "/schema/diff" "$desired"

  if [[ "$API_STATUS" == "204" ]]; then
    echo "✓ schema already up to date"
    return 0
  fi

  if [[ "$API_STATUS" != "200" ]]; then
    echo "Failed to compute schema diff (status ${API_STATUS}):" >&2
    echo "$API_BODY" | jq "." >&2 || true
    exit 1
  fi

  local diff_data
  diff_data="$(echo "$API_BODY" | jq -c '.data')"

  api POST "/schema/apply" "$diff_data"

  if [[ "$API_STATUS" != "204" && "$API_STATUS" != "200" ]]; then
    echo "Failed to apply schema diff (status ${API_STATUS}):" >&2
    echo "$API_BODY" | jq "." >&2 || true
    exit 1
  fi

  echo "✓ schema applied"
}

ensure_permission() {
  local collection="$1"
  local action="$2"
  local fields_json="$3"

  api_get_query "/permissions" \
    --data-urlencode "limit=1" \
    --data-urlencode "filter[policy][_eq]=${public_policy_id}" \
    --data-urlencode "filter[collection][_eq]=${collection}" \
    --data-urlencode "filter[action][_eq]=${action}"

  if [[ "$API_STATUS" != "200" ]]; then
    echo "Failed to query existing permission (${collection}:${action}) (status ${API_STATUS}):" >&2
    echo "$API_BODY" | jq "." >&2 || true
    exit 1
  fi

  local existing_id
  existing_id="$(echo "$API_BODY" | jq -r '.data[0].id // empty')"

  local payload
  payload="$(
    jq -n \
      --arg policy "$public_policy_id" \
      --arg collection "$collection" \
      --arg action "$action" \
      --argjson fields "$fields_json" \
      '{
        policy: $policy,
        collection: $collection,
        action: $action,
        permissions: {},
        validation: {},
        presets: {},
        fields: $fields
      }'
  )"

  if [[ -n "$existing_id" ]]; then
    api PATCH "/permissions/${existing_id}" "$payload"
    if [[ "$API_STATUS" != "200" ]]; then
      echo "Failed to update permission ${existing_id} (${collection}:${action}) (status ${API_STATUS}):" >&2
      echo "$API_BODY" | jq "." >&2 || true
      exit 1
    fi
    echo "✓ updated public permission: ${collection}:${action}"
    return 0
  fi

  api POST "/permissions" "$payload"
  if [[ "$API_STATUS" != "200" && "$API_STATUS" != "201" ]]; then
    echo "Failed to create permission (${collection}:${action}) (status ${API_STATUS}):" >&2
    echo "$API_BODY" | jq "." >&2 || true
    exit 1
  fi

  echo "✓ created public permission: ${collection}:${action}"
}

apply_epic02_schema

ensure_permission "calculator_snapshots" "create" \
  '["id","anon_session_id","inputs_json","outputs_json","calc_version"]'
ensure_permission "calculator_snapshots" "update" \
  '["anon_session_id","inputs_json","outputs_json","calc_version"]'

echo "Done. Next:"
echo "- Restart Directus to load hook extensions (if just added)."
echo "- Run: bash scripts/snapshot.sh"
