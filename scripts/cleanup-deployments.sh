#!/bin/bash
# Delete all Vercel deployments except the most recent one

set -e

echo "Fetching deployments..."
DEPLOYMENTS=$(vercel list --json 2>/dev/null | jq -r '.deployments | sort_by(.createdAt) | reverse[] | .url')

if [ -z "$DEPLOYMENTS" ]; then
  echo "❌ No deployments found or failed to fetch. Make sure you're logged in: vercel login"
  exit 1
fi

DEPLOYMENT_ARRAY=($DEPLOYMENTS)
TOTAL=${#DEPLOYMENT_ARRAY[@]}

if [ $TOTAL -le 1 ]; then
  echo "✅ Only $TOTAL deployment found. Nothing to delete."
  exit 0
fi

KEEP_URL=${DEPLOYMENT_ARRAY[0]}
echo "📊 Found $TOTAL deployments. Keeping the latest: $KEEP_URL"
echo ""

# Delete all except the first (most recent)
DELETED=0
for i in "${!DEPLOYMENT_ARRAY[@]}"; do
  if [ $i -gt 0 ]; then
    DEPLOYMENT_URL=${DEPLOYMENT_ARRAY[$i]}
    echo "🗑️  Deleting $DEPLOYMENT_URL..."
    vercel remove $DEPLOYMENT_URL --yes 2>/dev/null || echo "⚠️  Failed to delete $DEPLOYMENT_URL"
    ((DELETED++))
  fi
done

echo ""
echo "✅ Done! Deleted $DELETED deployments. Kept 1 (the latest)."
