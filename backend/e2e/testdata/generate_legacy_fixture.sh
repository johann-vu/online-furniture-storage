#!/usr/bin/env bash
#
# Generates the legacy (PocketBase v0.22.2) data directory used by the e2e tests
# to verify that existing production data survives the upgrade.
#
# Usage: ./generate_legacy_fixture.sh <path-to-legacy-app-binary>
#
# The legacy binary can be built from the last commit before the upgrade:
#   git worktree add /tmp/legacy 4d17f64
#   mkdir -p /tmp/legacy/backend/cmd/frontend/browser && touch /tmp/legacy/backend/cmd/frontend/browser/index.html
#   (cd /tmp/legacy/backend && GOTOOLCHAIN=go1.22.12 CGO_ENABLED=0 go build -o /tmp/legacy-app ./cmd)

set -euo pipefail

APP="${1:?path to legacy app binary required}"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/legacy_v0.22"
SCHEMA="$HERE/../../pb_schema_v0.22.json"
ADDR="127.0.0.1:8099"
API="http://$ADDR/api"

export STORAGE_SECRET="e2e-test-secret-0123456789abcdef"

rm -rf "$OUT"
mkdir -p "$OUT"

start_server() {
  "$APP" serve --http "$ADDR" --dir "$OUT" >/dev/null 2>&1 &
  PID=$!
  trap 'kill $PID 2>/dev/null || true' EXIT

  until curl -sf "$API/health" >/dev/null; do
    kill -0 $PID 2>/dev/null || { echo "legacy server exited" >&2; exit 1; }
    sleep 0.2
  done
}

stop_server() {
  kill $PID
  wait $PID 2>/dev/null || true
  trap - EXIT
}

# the legacy binary has no "migrate" command, serving once applies the migrations
start_server
stop_server
"$APP" admin create admin@example.com "admin-password-123" --dir "$OUT" >/dev/null
start_server

ADMIN_TOKEN=$(curl -sSf -X POST "$API/admins/auth-with-password" \
  -H 'Content-Type: application/json' \
  -d '{"identity":"admin@example.com","password":"admin-password-123"}' | jq -r .token)

jq '{collections: ., deleteMissing: false}' "$SCHEMA" |
  curl -sSf -X PUT "$API/collections/import" -H "Authorization: $ADMIN_TOKEN" \
    -H 'Content-Type: application/json' -d @- >/dev/null

# staff user that logs in by username
USER_ID=$(curl -sSf -X POST "$API/collections/users/records" -H "Authorization: $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"username":"helper","password":"helper-password-123","passwordConfirm":"helper-password-123","name":"Helga Helper"}' | jq -r .id)

# 1x1 png
PHOTO="$(mktemp -d)/photo.png"
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' >"$PHOTO"

create_offer() {
  curl -sSf -X POST "$API/collections/offers/records" \
    -F "title=$1" -F "size=$2" -F "available_until=$3" -F "name=$4" -F "phone=$5" \
    -F "category=$6" -F "description=$7" -F "photos=@$PHOTO" | jq -r .id
}

OFFER_SOFA=$(create_offer "Sofa" "200x90" "2099-12-31" "Max Mustermann" "+49 170 1234567" "furniture" "Gemütliches Sofa")
create_offer "Fahrrad" "28 Zoll" "2099-06-30" "Erika Musterfrau" "0151 7654321" "bike" "Damenrad" >/dev/null
create_offer "Alter Schrank" "180x60" "2020-01-01" "Otto Normal" "030 123456" "furniture" "Abgelaufen" >/dev/null
create_offer "Tisch" "120x80" "2099-01-01" "Paula Probe" "0176 111222" "furniture" "Esstisch" >/dev/null

USER_TOKEN=$(curl -sSf -X POST "$API/collections/users/auth-with-password" \
  -H 'Content-Type: application/json' \
  -d '{"identity":"helper","password":"helper-password-123"}' | jq -r .token)

curl -sSf -X POST "$API/collections/comments/records" -H "Authorization: $USER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"offer\":\"$OFFER_SOFA\",\"author\":\"$USER_ID\",\"text\":\"Wird morgen abgeholt\"}" >/dev/null

stop_server

# simulate the race condition of the old in-memory counter: two offers share a number
sqlite3 "$OUT/data.db" "UPDATE offers SET number = 2 WHERE title = 'Tisch';"

# logs are not needed and only bloat the fixture
rm -f "$OUT"/logs.db*
sqlite3 "$OUT/data.db" "VACUUM; PRAGMA wal_checkpoint(TRUNCATE);"
rm -f "$OUT"/data.db-shm "$OUT"/data.db-wal

echo "fixture written to $OUT"
