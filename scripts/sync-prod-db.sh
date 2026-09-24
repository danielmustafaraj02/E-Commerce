#!/usr/bin/env bash
# Copies the production database over the local dev database.
#
# Run this yourself (not via Claude) — it pulls production credentials via
# the Vercel CLI, which Claude Code's auto mode refuses to do on its own.
#
# Usage: ./scripts/sync-prod-db.sh

set -euo pipefail
cd "$(dirname "$0")/.."

LOCAL_URL=$(grep '^DATABASE_URL=' .env | cut -d '=' -f2- | tr -d '"')
case "$LOCAL_URL" in
  *localhost*|*127.0.0.1*) ;;
  *)
    echo "Refusing to run: .env DATABASE_URL doesn't look like a local database ($LOCAL_URL)." >&2
    echo "This script overwrites whatever DATABASE_URL points to — only ever run it against local." >&2
    exit 1
    ;;
esac

command -v pg_dump >/dev/null || { echo "pg_dump not found on PATH (install the postgresql package)." >&2; exit 1; }
command -v psql >/dev/null || { echo "psql not found on PATH (install the postgresql package)." >&2; exit 1; }

TMP_ENV=$(mktemp)
TMP_DUMP=$(mktemp)
trap 'rm -f "$TMP_ENV" "$TMP_DUMP"' EXIT

echo "==> Pulling production environment from Vercel..."
npx vercel env pull "$TMP_ENV" --yes --environment=production

PROD_URL=$(grep '^DATABASE_URL=' "$TMP_ENV" | cut -d '=' -f2- | tr -d '"')
if [ -z "$PROD_URL" ]; then
  echo "Could not find DATABASE_URL in the pulled production environment." >&2
  exit 1
fi

echo "==> Dumping production database..."
pg_dump "$PROD_URL" --no-owner --no-privileges --clean --if-exists -f "$TMP_DUMP"

echo "==> Restoring into local database ($LOCAL_URL)..."
psql "$LOCAL_URL" -f "$TMP_DUMP"

echo "==> Done. Local database now mirrors production."
echo "    (temp files with production credentials/data have been removed)"
