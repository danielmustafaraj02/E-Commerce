#!/usr/bin/env bash
# Apply catalog translations (from murano-manifest.json) to the production database.
#
# The automated nightly runs (Hindi PR #54, Arabic PR #56, Chinese PR #58)
# fixed em-dash and punctuation issues in the manifest but could not write
# to the database because no DATABASE_URL was provided.  This script pulls
# the production DATABASE_URL from Vercel, runs a dry-run first, and then
# applies the changes.
#
# Usage:
#   cd E-Commerce
#   bash scripts/apply-translations-to-prod.sh          # interactive (asks before applying)
#   bash scripts/apply-translations-to-prod.sh --force   # skip confirmation

set -euo pipefail
cd "$(dirname "$0")/.."

FORCE=false
[[ "${1:-}" == "--force" ]] && FORCE=true

echo "=== Perla Murano Glass — Apply catalog translations to production ==="
echo ""

# 1. Pull the production DATABASE_URL from Vercel
echo "→ Pulling production DATABASE_URL from Vercel..."
TMPENV=$(mktemp)
trap 'rm -f "$TMPENV"' EXIT
vercel env pull "$TMPENV" --yes 2>/dev/null
PROD_DB_URL=$(grep '^DATABASE_URL=' "$TMPENV" | head -1 | cut -d'=' -f2- | tr -d '"')

if [[ -z "$PROD_DB_URL" ]]; then
  echo "ERROR: Could not retrieve DATABASE_URL from Vercel."
  echo "Make sure you are logged in (run 'vercel login') and linked to the project."
  echo "Or set DATABASE_URL manually:  DATABASE_URL='postgres://...' npx tsx scripts/apply-product-i18n.ts"
  exit 1
fi

echo "  ✓ Got DATABASE_URL (${PROD_DB_URL:0:30}...)"
echo ""

# 2. Dry run first
echo "→ Running dry run..."
echo ""
DATABASE_URL="$PROD_DB_URL" npx tsx scripts/apply-product-i18n.ts --dry-run
echo ""

# 3. Ask for confirmation (unless --force)
if [[ "$FORCE" != true ]]; then
  read -rp "Apply these translations to the production database? [y/N] " answer
  if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# 4. Apply for real
echo ""
echo "→ Applying translations to production database..."
echo ""
DATABASE_URL="$PROD_DB_URL" npx tsx scripts/apply-product-i18n.ts
echo ""
echo "=== Done. Switch the site to each language and spot-check a few product pages. ==="
