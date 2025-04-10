#!/bin/bash
# github-release.sh
# Script to create a GitHub release for Aetherion Wallet

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display usage information
function usage() {
  echo "Usage: $0 <version> [options]"
  echo
  echo "Arguments:"
  echo "  version       Version number for the release (e.g., 1.0.0)"
  echo
  echo "Options:"
  echo "  -b, --branch  The branch to create release from (default: main)"
  echo "  -p, --prerelease Mark as pre-release"
  echo "  -d, --draft   Create as draft release"
  echo "  -n, --notes   Path to release notes file"
  echo "  -h, --help    Show this help message"
  echo
  echo "Environment Variables:"
  echo "  GITHUB_TOKEN  GitHub personal access token (required)"
  echo "  GITHUB_REPO   GitHub repository in format owner/repo (default: aifreedomtrust/aetherion-wallet)"
  exit 1
}

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}     GitHub Release Creator for Aetherion Wallet     ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo

# Check for required arguments
if [ $# -lt 1 ]; then
  echo -e "${RED}Error: Version number is required${NC}"
  usage
fi

VERSION=$1
shift

# Default values
BRANCH="main"
PRERELEASE="false"
DRAFT="false"
RELEASE_NOTES=""
GITHUB_REPO=${GITHUB_REPO:-"aifreedomtrust/aetherion-wallet"}

# Parse options
while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--branch)
      BRANCH="$2"
      shift 2
      ;;
    -p|--prerelease)
      PRERELEASE="true"
      shift
      ;;
    -d|--draft)
      DRAFT="true"
      shift
      ;;
    -n|--notes)
      RELEASE_NOTES="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo -e "${RED}Error: Unknown option: $1${NC}"
      usage
      ;;
  esac
done

# Validate GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}Error: GITHUB_TOKEN environment variable is not set${NC}"
  echo "Please set the GITHUB_TOKEN environment variable with a personal access token that has 'repo' scope"
  exit 1
fi

# Create release tag
TAG_NAME="v$VERSION"

echo -e "${BLUE}Creating GitHub release for Aetherion Wallet${NC}"
echo -e "Repository: ${GITHUB_REPO}"
echo -e "Version:    ${VERSION}"
echo -e "Tag:        ${TAG_NAME}"
echo -e "Branch:     ${BRANCH}"
echo -e "Prerelease: ${PRERELEASE}"
echo -e "Draft:      ${DRAFT}"
echo

# Get release notes
if [ -n "$RELEASE_NOTES" ] && [ -f "$RELEASE_NOTES" ]; then
  NOTES_CONTENT=$(cat "$RELEASE_NOTES")
  echo -e "${BLUE}Using release notes from: $RELEASE_NOTES${NC}"
else
  # Generate automatic release notes from commits
  echo -e "${BLUE}No release notes file provided. Generating from commits...${NC}"
  NOTES_CONTENT="# Aetherion Wallet v$VERSION

## What's New

$(git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~50)..HEAD | grep -v "Merge" | head -10)

## Installation

- Download the latest version from [GitHub Releases](https://github.com/$GITHUB_REPO/releases)
- Follow the installation instructions in the [documentation](https://github.com/$GITHUB_REPO/blob/main/README.md)

## Feedback

Please report any issues on the [GitHub issue tracker](https://github.com/$GITHUB_REPO/issues)"
fi

# Create temporary release notes file
TEMP_NOTES=$(mktemp)
echo "$NOTES_CONTENT" > "$TEMP_NOTES"

# Build the release package
echo -e "${BLUE}Building release package...${NC}"
PACKAGE_NAME="aetherion-wallet-$VERSION.tar.gz"

# Check if the package exists
if [ -f "$PACKAGE_NAME" ]; then
  echo -e "${YELLOW}Package already exists: $PACKAGE_NAME${NC}"
else
  echo -e "${BLUE}Creating package...${NC}"
  npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
  fi
  
  # Create release package
  tar -czf "$PACKAGE_NAME" \
    --exclude="node_modules" \
    --exclude=".git" \
    dist \
    server-redirect.js \
    package.json \
    README.md \
    LICENSE
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create package!${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Package created: $PACKAGE_NAME${NC}"
fi

# Create release using GitHub API
echo -e "${BLUE}Creating GitHub release...${NC}"

# Create release
RELEASE_DATA=$(curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "{
    \"tag_name\": \"$TAG_NAME\",
    \"target_commitish\": \"$BRANCH\",
    \"name\": \"Aetherion Wallet $VERSION\",
    \"body\": $(echo "$NOTES_CONTENT" | jq -s -R .),
    \"draft\": $DRAFT,
    \"prerelease\": $PRERELEASE
  }" \
  "https://api.github.com/repos/$GITHUB_REPO/releases")

# Check for errors
if [[ "$RELEASE_DATA" == *"errors"* ]] || [[ "$RELEASE_DATA" == *"message"* ]]; then
  echo -e "${RED}Failed to create release:${NC}"
  echo "$RELEASE_DATA" | jq -r '.message'
  exit 1
fi

# Extract release ID and upload URL
RELEASE_ID=$(echo "$RELEASE_DATA" | jq -r '.id')
UPLOAD_URL=$(echo "$RELEASE_DATA" | jq -r '.upload_url' | sed -e "s/{?name,label}//")

if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" == "null" ]; then
  echo -e "${RED}Failed to extract release ID!${NC}"
  exit 1
fi

echo -e "${GREEN}Release created: ID $RELEASE_ID${NC}"

# Upload release asset
echo -e "${BLUE}Uploading release package...${NC}"
UPLOAD_RESPONSE=$(curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/gzip" \
  -H "Accept: application/vnd.github.v3+json" \
  --data-binary @"$PACKAGE_NAME" \
  "$UPLOAD_URL?name=$PACKAGE_NAME")

# Check for upload errors
if [[ "$UPLOAD_RESPONSE" == *"errors"* ]] || [[ "$UPLOAD_RESPONSE" == *"message"* && "$UPLOAD_RESPONSE" != *"created_at"* ]]; then
  echo -e "${RED}Failed to upload release asset:${NC}"
  echo "$UPLOAD_RESPONSE" | jq -r '.message'
  exit 1
fi

ASSET_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.browser_download_url')

echo -e "${GREEN}Release asset uploaded: $ASSET_URL${NC}"
echo
echo -e "${GREEN}GitHub release created successfully!${NC}"
echo -e "Release URL: https://github.com/$GITHUB_REPO/releases/tag/$TAG_NAME"
echo -e "Download URL: $ASSET_URL"

# Clean up
rm "$TEMP_NOTES"