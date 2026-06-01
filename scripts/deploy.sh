#!/bin/bash

set -e

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

echo "Building site..."
npm run build

echo "Committing changes..."
git add .

git commit -m "Deploy $TIMESTAMP" || echo "No changes to commit"

echo "Pushing latest commits..."
git push origin main

echo "Creating release folder..."
ssh deploy@23.187.248.117 "
mkdir -p /var/www/site/releases/$TIMESTAMP
"

echo "Uploading files..."
rsync -az --delete \
dist/ \
deploy@23.187.248.117:/var/www/site/releases/$TIMESTAMP/

echo "Switching live site..."
ssh deploy@23.187.248.117 "
ln -sfn /var/www/site/releases/$TIMESTAMP /var/www/site/current
"

echo "Deployment complete!"
