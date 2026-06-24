#!/bin/bash
# initial-sync.sh
#
# This script performs the initial synchronization between the repositories.
# It clones both repositories if they don't exist, then runs the sync script.
#
# Usage: ./initial-sync.sh

# Configuration
SOURCE_REPO_URL="https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency.git"
TARGET_REPO_URL="https://github.com/AIFreedomTrustFederation/biozone-harmony-boost.git"
WORK_DIR="/tmp/frontend-sync-workspace"
SOURCE_DIR="${WORK_DIR}/Aether_Coin_biozonecurrency"
TARGET_DIR="${WORK_DIR}/biozone-harmony-boost"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Create workspace
mkdir -p "${WORK_DIR}"
cd "${WORK_DIR}"

echo -e "${YELLOW}Starting initial synchronization process...${NC}"

# Clone repositories if they don't exist
if [ ! -d "${SOURCE_DIR}" ]; then
  echo -e "${YELLOW}Cloning source repository...${NC}"
  git clone "${SOURCE_REPO_URL}" "${SOURCE_DIR}"
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to clone source repository. Aborting.${NC}"
    exit 1
  fi
fi

if [ ! -d "${TARGET_DIR}" ]; then
  echo -e "${YELLOW}Cloning target repository...${NC}"
  git clone "${TARGET_REPO_URL}" "${TARGET_DIR}"
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to clone target repository. Aborting.${NC}"
    exit 1
  fi
fi

# Copy sync script to workspace
cp "${SOURCE_DIR}/scripts/sync-frontend-repos.sh" "${WORK_DIR}/"
chmod +x "${WORK_DIR}/sync-frontend-repos.sh"

# Update paths in the sync script
sed -i "s|SOURCE_REPO=\"/path/to/Aether_Coin_biozonecurrency\"|SOURCE_REPO=\"${SOURCE_DIR}\"|" "${WORK_DIR}/sync-frontend-repos.sh"
sed -i "s|TARGET_REPO=\"/path/to/biozone-harmony-boost\"|TARGET_REPO=\"${TARGET_DIR}\"|" "${WORK_DIR}/sync-frontend-repos.sh"

# Run the sync script
echo -e "${YELLOW}Running synchronization script...${NC}"
bash "${WORK_DIR}/sync-frontend-repos.sh" --force

# Check if sync was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Synchronization completed successfully!${NC}"
  
  # Commit and push changes to target repository
  echo -e "${YELLOW}Committing changes to target repository...${NC}"
  cd "${TARGET_DIR}"
  
  # Configure Git
  git config user.name "Frontend Sync Bot"
  git config user.email "bot@aifreedomtrust.com"
  
  # Add all changes
  git add .
  
  # Commit changes
  git commit -m "Sync frontend code from Aether_Coin_biozonecurrency"
  
  # Ask if user wants to push changes
  read -p "Do you want to push changes to the target repository? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Pushing changes to target repository...${NC}"
    git push
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Changes pushed successfully!${NC}"
    else
      echo -e "${RED}Failed to push changes. You may need to push manually.${NC}"
    fi
  else
    echo -e "${YELLOW}Changes not pushed. You can push them manually later.${NC}"
  fi
  
  echo -e "${GREEN}Initial synchronization process completed!${NC}"
  echo "Source repository: ${SOURCE_DIR}"
  echo "Target repository: ${TARGET_DIR}"
else
  echo -e "${RED}Synchronization failed. Check the logs for details.${NC}"
  exit 1
fi