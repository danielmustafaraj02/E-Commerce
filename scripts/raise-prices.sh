#!/usr/bin/env bash
# One-shot runner for scripts/raise-prices.ts: pulls production env vars,
# shows a dry-run, asks for confirmation, then applies for real. Always
# cleans up the pulled credentials file, even on failure or Ctrl-C.
#
# Usage:
#   bash scripts/raise-prices.sh <euros>          # shows dry run, asks to confirm
#   bash scripts/raise-prices.sh <euros> --yes    # skips the prompt, applies immediately
#
# Requires: vercel CLI logged in and this project linked (`vercel link`).

set -euo pipefail
cd "$(dirname "$0")/.."

EUROS="${1:?Usage: bash scripts/raise-prices.sh <euros> [--yes]}"
AUTO_YES=false
for arg in "$@"; do
  [[ "$arg" == "--yes" ]] && AUTO_YES=true
done

ENV_FILE=".env.production.local"
cleanup() { rm -f "$ENV_FILE"; }
trap cleanup EXIT

echo "==> Pulling production environment variables..."
vercel env pull "$ENV_FILE" --environment=production

if ! command -v dotenv >/dev/null 2>&1 && [ ! -d node_modules/dotenv-cli ]; then
  echo "==> Installing dotenv-cli (dev dependency, one-time)..."
  npm install -D dotenv-cli
fi

run() { npx dotenv -e "$ENV_FILE" -- npx tsx "$@"; }

echo
echo "==> DRY RUN: raise all prices by €${EUROS}"
run scripts/raise-prices.ts "$EUROS" --dry-run

echo
if [ "$AUTO_YES" = true ]; then
  echo "==> --yes passed, applying without prompting."
else
  read -r -p "Apply the changes above to PRODUCTION now? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted — no changes made."
    exit 0
  fi
fi

echo
echo "==> Applying"
run scripts/raise-prices.ts "$EUROS"

echo
echo "Done."
