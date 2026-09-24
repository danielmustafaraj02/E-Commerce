#!/usr/bin/env bash
# Applies the one-time production setup that code can't do on deploy, then
# lists what's left for a person to decide. Safe to re-run: each step only
# adds what's missing, and every write is shown as a dry run and confirmed
# first.
#
# Steps:
#   1. Shipping zones (scripts/setup-shipping-zones.ts): free Europe (EU + UK,
#      CH, NO, SM, VA, MC), €30 USA & Canada, €40 rest of world; turns off the
#      store-wide free-shipping threshold; adds VAT rules for new destinations
#      (Italian 22% inside the EU, 0% on exports — check the EU rate with your
#      accountant once cross-border EU sales pass €10,000 a year).
#   2. A read-only status check (scripts/pending-checklist.ts).
#
# Usage:
#   bash scripts/apply-pending.sh          # dry run, asks before applying
#   bash scripts/apply-pending.sh --yes    # applies without asking
#
# Uses .env.production.local if you have one; otherwise pulls production
# variables with the Vercel CLI into a temporary file and deletes it after.

set -euo pipefail
cd "$(dirname "$0")/.."

AUTO_YES=false
for arg in "$@"; do
  [[ "$arg" == "--yes" ]] && AUTO_YES=true
done

ENV_FILE=".env.production.local"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE=".env.pending-setup.tmp"
  cleanup() { rm -f "$ENV_FILE"; }
  trap cleanup EXIT
  echo "==> No .env.production.local — pulling production variables (removed afterwards)..."
  vercel env pull "$ENV_FILE" --environment=production
fi

run() {
  (
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    npx tsx "$@"
  )
}

confirm() {
  if [ "$AUTO_YES" = true ]; then
    return 0
  fi
  read -r -p "$1 [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]]
}

echo
echo "==> 1/2 Shipping zones, free-shipping threshold and tax rules — DRY RUN"
run scripts/setup-shipping-zones.ts --dry-run
echo
if confirm "Apply the shipping changes above to PRODUCTION?"; then
  run scripts/setup-shipping-zones.ts
else
  echo "Skipped — no shipping changes made."
fi

echo
echo "==> 2/2 Status"
run scripts/pending-checklist.ts

cat <<'EOF'

Still to decide by a person (no script can do these):
  • Create "Complete the Look" sets in Admin > Catalog > Looks.
  • Check the product descriptions that call the beads "mouth-blown":
    the Murano museum describes beads as lampworked or cut from cane.
  • Preview deployments run migrations on the production database
    (the Preview DATABASE_URL is the live one): give previews their own
    Neon branch, or migrate only when VERCEL_ENV=production.
  • Before discounting a product in the next 30 days, check the audit log
    that it wasn't cheaper earlier (price history began with this release).
EOF

echo
echo "Done."
