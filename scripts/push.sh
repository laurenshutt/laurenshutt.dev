#!/bin/bash

# Source-only push: commit what's in the working tree and send it to GitHub.
# No build and no server upload -- `npm run deploy` is the one that puts the
# site live. Useful for checkpointing work from one machine to another.

set -e

git add .

read -p "📝 Enter commit message: " COMMIT_MSG

git commit -m "$COMMIT_MSG" || echo "No changes to commit"

echo "Pushing to GitHub..."
git push origin main

echo "Pushed. Note: the live site is unchanged -- run npm run deploy for that."
