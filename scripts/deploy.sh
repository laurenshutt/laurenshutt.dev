#!/bin/bash

set -e

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

echo "Building site..."
npm run build

echo "Committing changes..."
git add .

read -p "📝 Enter commit message: " COMMIT_MSG

git commit -m "$COMMIT_MSG" || echo "No changes to commit"

echo "Pushing latest commits..."
git push origin main

echo "Creating release folder..."
# Reuse the previous release as a baseline so only changed files upload
# (each release is a fresh empty dir, so without this rsync re-sends everything).
PREV=$(ssh deploy@23.187.248.117 'readlink -f /var/www/site/current' 2>/dev/null || true)
ssh deploy@23.187.248.117 "mkdir -p /var/www/site/releases/$TIMESTAMP"

echo "Uploading files..."
# --checksum: Vite rewrites every file with a fresh mtime each build, so compare by
#   content, not timestamp. --link-dest hard-links unchanged files from the previous
#   release (instant, ~no extra disk); only changed files actually transfer.
rsync -az --checksum --delete \
  ${PREV:+--link-dest="$PREV"} \
  dist/ \
  deploy@23.187.248.117:/var/www/site/releases/$TIMESTAMP/

echo "Switching live site..."
ssh deploy@23.187.248.117 "
ln -sfn /var/www/site/releases/$TIMESTAMP /var/www/site/current
"

echo "Deployment complete!"
