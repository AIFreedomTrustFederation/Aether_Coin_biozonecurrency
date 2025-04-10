#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Print banner
echo -e "${BLUE}================================================================${RESET}"
echo -e "${CYAN}  Aetherion Wallet - GitHub Release Package Creator${RESET}"
echo -e "${BLUE}================================================================${RESET}"

# Version
VERSION="1.0.0"
PACKAGE_DIR="aetherion-wallet-v${VERSION}"

# Check if the package directory exists
if [ ! -d "$PACKAGE_DIR" ]; then
    echo -e "${RED}Error: Package directory '$PACKAGE_DIR' not found.${RESET}"
    echo -e "${YELLOW}Please run ./create-deployment-package.sh first.${RESET}"
    exit 1
fi

echo -e "${GREEN}Found package directory: $PACKAGE_DIR${RESET}"

# Create a tarball for GitHub release
echo -e "${BLUE}Creating tarball for GitHub release...${RESET}"
TAR_FILE="aetherion-wallet-v${VERSION}.tar.gz"

# Remove previous tarball if it exists
if [ -f "$TAR_FILE" ]; then
    echo "Removing existing tarball..."
    rm -f "$TAR_FILE"
fi

# Create tarball
echo "Creating tarball: $TAR_FILE"
tar -czf "$TAR_FILE" "$PACKAGE_DIR"

# Verify tarball was created
if [ -f "$TAR_FILE" ]; then
    TARBALL_SIZE=$(du -h "$TAR_FILE" | cut -f1)
    echo -e "${GREEN}Successfully created tarball: $TAR_FILE (Size: $TARBALL_SIZE)${RESET}"
    echo -e "${YELLOW}Ready for GitHub release!${RESET}"
    echo -e "${CYAN}You can now use this tarball with the GitHub API to create a release.${RESET}"
else
    echo -e "${RED}Failed to create tarball.${RESET}"
    exit 1
fi

# Create GitHub release
echo -e "${BLUE}Do you want to create a GitHub release now? (y/n)${RESET}"
read -r answer
if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    echo -e "${YELLOW}Skipping GitHub release creation.${RESET}"
    echo -e "${GREEN}You can manually create a release using the GitHub web interface.${RESET}"
    exit 0
fi

# Ensure GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) is not installed. Cannot create release automatically.${RESET}"
    echo -e "${YELLOW}Please install GitHub CLI or create the release manually.${RESET}"
    exit 1
fi

echo -e "${BLUE}Creating GitHub release v${VERSION}...${RESET}"
gh release create "v${VERSION}" \
    --title "Aetherion Wallet v${VERSION}" \
    --notes-file "RELEASE-NOTES-v${VERSION}.md" \
    "$TAR_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully created GitHub release v${VERSION}!${RESET}"
else
    echo -e "${RED}Failed to create GitHub release.${RESET}"
    echo -e "${YELLOW}Please check your GitHub credentials and try again.${RESET}"
    exit 1
fi

echo -e "${GREEN}Release process completed successfully!${RESET}"