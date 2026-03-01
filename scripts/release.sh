#!/usr/bin/env bash
set -euo pipefail

# Determine version bump from conventional commits since the last tag,
# then run npm version + push (which triggers the publish workflow).

# Find the latest v* tag, or fall back to the root commit
LAST_TAG=$(git describe --tags --match "v*" --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)

echo "Commits since ${LAST_TAG}:"
git log "${LAST_TAG}..HEAD" --oneline
echo ""

# Parse commit subjects since last tag
COMMITS=$(git log "${LAST_TAG}..HEAD" --pretty=format:"%s")

if [ -z "$COMMITS" ]; then
  echo "No new commits since ${LAST_TAG}. Nothing to release."
  exit 0
fi

# Determine the highest bump level
BUMP="patch"

while IFS= read -r msg; do
  # Major: any type with ! before colon, or BREAKING CHANGE anywhere
  if echo "$msg" | grep -qE '^[a-z]+(\(.+\))?!:|BREAKING CHANGE'; then
    BUMP="major"
    break
  fi
  # Minor: feat (without !)
  if echo "$msg" | grep -qE '^feat(\(.+\))?:'; then
    BUMP="minor"
  fi
done <<< "$COMMITS"

echo "Detected bump: ${BUMP}"
echo ""

# Bump version (updates package.json, package-lock.json, creates commit + tag)
npm version "$BUMP"

# Push commits and tags
git push && git push --tags

NEW_VERSION=$(node -p "require('./package.json').version")
echo ""
echo "Released v${NEW_VERSION}"
