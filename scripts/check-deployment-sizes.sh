#!/bin/bash
# Show deployment storage sizes

echo "Fetching deployments with sizes..."
vercel list --json 2>/dev/null | jq -r '.deployments | sort_by(.createdAt) | reverse[] | "\(.createdAt | strftime("%Y-%m-%d %H:%M")) | \(.state) | \(.target // "preview") | \(.url)"' | while read -r line; do
  echo "$line"
done | column -t -s '|'

echo ""
echo "Total deployments: $(vercel list --json 2>/dev/null | jq '.deployments | length')"
echo ""
echo "To see raw JSON with all fields:"
echo "  vercel list --json | jq '.deployments[] | {url, createdAt, state, target}'"
