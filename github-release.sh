#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Banner
echo -e "${BLUE}================================================================${RESET}"
echo -e "${BLUE}  Aetherion Wallet - GitHub Release Creator${RESET}"
echo -e "${BLUE}================================================================${RESET}"

# Configuration
VERSION="v1.0.0"
REPO="AIFreedomTrustFederation/Aether_Coin_biozonecurrency"
RELEASE_NOTES_FILE="RELEASE-NOTES-${VERSION}.md"
PACKAGE_FILE="aetherion-wallet-v1.0.0.tar.gz"

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN environment variable is required${RESET}"
    echo -e "${YELLOW}Please set your GitHub token:${RESET}"
    echo "export GITHUB_TOKEN=your_token_here"
    exit 1
fi

# Check if files exist
if [ ! -f "$RELEASE_NOTES_FILE" ]; then
    echo -e "${RED}Error: Release notes file '$RELEASE_NOTES_FILE' not found${RESET}"
    exit 1
fi

if [ ! -f "$PACKAGE_FILE" ]; then
    echo -e "${RED}Error: Package file '$PACKAGE_FILE' not found${RESET}"
    echo "Looking for alternative package file..."
    
    # Try without 'v' prefix
    if [[ "$VERSION" == v* ]]; then
        ALT_PACKAGE_FILE="aetherion-wallet-${VERSION:1}.tar.gz"
        if [ -f "$ALT_PACKAGE_FILE" ]; then
            echo "Found alternative package file: $ALT_PACKAGE_FILE"
            PACKAGE_FILE="$ALT_PACKAGE_FILE"
        fi
    else
        ALT_PACKAGE_FILE="aetherion-wallet-v${VERSION}.tar.gz"
        if [ -f "$ALT_PACKAGE_FILE" ]; then
            echo "Found alternative package file: $ALT_PACKAGE_FILE"
            PACKAGE_FILE="$ALT_PACKAGE_FILE"
        fi
    fi
    
    if [ ! -f "$PACKAGE_FILE" ]; then
        echo -e "${RED}Error: Could not find any suitable package file${RESET}"
        exit 1
    fi
fi

# Create release
echo -e "${BLUE}Creating GitHub release ${VERSION}...${RESET}"

# Read release notes
RELEASE_NOTES=$(cat "$RELEASE_NOTES_FILE")

# Create JSON payload for the release
PAYLOAD=$(cat << EOF
{
  "tag_name": "${VERSION}",
  "name": "Aetherion Wallet ${VERSION}",
  "body": $(echo "$RELEASE_NOTES" | jq -Rs .),
  "draft": false,
  "prerelease": false
}
EOF
)

# Create the release
echo "Creating release on GitHub..."
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "https://api.github.com/repos/${REPO}/releases")

# Check for errors
if echo "$RESPONSE" | grep -q "message"; then
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message')
    if [ "$ERROR_MSG" != "null" ]; then
        echo -e "${RED}Error creating release: $ERROR_MSG${RESET}"
        echo "$RESPONSE" | jq .
        exit 1
    fi
fi

# Extract upload URL and release URL
UPLOAD_URL=$(echo "$RESPONSE" | jq -r '.upload_url' | sed 's/{?name,label}//')
RELEASE_URL=$(echo "$RESPONSE" | jq -r '.html_url')

if [ -z "$UPLOAD_URL" ] || [ "$UPLOAD_URL" == "null" ]; then
    echo -e "${RED}Failed to get upload URL from response${RESET}"
    echo "$RESPONSE" | jq .
    exit 1
fi

echo -e "${GREEN}Release created successfully: $RELEASE_URL${RESET}"

# Upload the asset
echo -e "${BLUE}Uploading asset: $PACKAGE_FILE...${RESET}"
ASSET_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @"$PACKAGE_FILE" \
  "${UPLOAD_URL}?name=$(basename "$PACKAGE_FILE")")

# Check for errors
if echo "$ASSET_RESPONSE" | grep -q "message"; then
    ERROR_MSG=$(echo "$ASSET_RESPONSE" | jq -r '.message')
    if [ "$ERROR_MSG" != "null" ]; then
        echo -e "${RED}Error uploading asset: $ERROR_MSG${RESET}"
        echo "$ASSET_RESPONSE" | jq .
        exit 1
    fi
fi

# Extract download URL
DOWNLOAD_URL=$(echo "$ASSET_RESPONSE" | jq -r '.browser_download_url')

if [ -z "$DOWNLOAD_URL" ] || [ "$DOWNLOAD_URL" == "null" ]; then
    echo -e "${RED}Failed to get download URL from response${RESET}"
    echo "$ASSET_RESPONSE" | jq .
    exit 1
fi

echo -e "${GREEN}Asset uploaded successfully: $DOWNLOAD_URL${RESET}"
echo -e "${GREEN}GitHub release process completed!${RESET}"