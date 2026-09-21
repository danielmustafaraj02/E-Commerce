#!/usr/bin/env bash
# One-shot runner for the two translation-backfill scripts:
#   - update-product-descriptions.ts (fixes the Italian name/description
#     columns and fills in all 10 translated locales per product)
#   - apply-product-i18n.ts (fills in translated category names, plus a
#     redundant safety pass on products)
#
# Pulls production env vars, shows a dry-run of both scripts, asks for
# confirmation, then applies for real. Always cleans up the pulled
# credentials file, even on failure or Ctrl-C.
#
# Usage:
#   bash scripts/apply-all-translations.sh          # shows dry run, asks to confirm
#   bash scripts/apply-all-translations.sh --yes    # skips the prompt, applies immediately
#
# Requires: vercel CLI logged in and this project linked (`vercel link`).

set -euo pipefail
cd "$(dirname "$0")/.."

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
echo "==> DRY RUN: product names/descriptions (all locales)"
run scripts/update-product-descriptions.ts --dry-run

echo
echo "==> DRY RUN: category names (all locales)"
run scripts/apply-product-i18n.ts --dry-run

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
echo "==> Applying: product names/descriptions"
run scripts/update-product-descriptions.ts

echo
echo "==> Applying: category names"
run scripts/apply-product-i18n.ts

echo
echo "Done. Translations applied across all 11 locales."
