#!/bin/bash

# Script to completely reset and reinitialize the project environment
# CAUTION: This will delete node_modules and other temporary files

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}       Project Reinitializer Tool      ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Check for a "force" flag
FORCE=false
if [ "$1" == "--force" ] || [ "$1" == "-f" ]; then
  FORCE=true
fi

# Check if backup should be skipped
SKIP_BACKUP=false
if [ "$1" == "--no-backup" ] || [ "$1" == "-n" ]; then
  SKIP_BACKUP=true
fi

# Warning and confirmation
if [ "$FORCE" != true ]; then
  echo -e "${RED}WARNING: This script will reset your project environment.${NC}"
  echo -e "${RED}It will perform the following actions:${NC}"
  echo -e " - ${YELLOW}Create a backup of your current state${NC}"
  echo -e " - ${YELLOW}Remove node_modules directory${NC}"
  echo -e " - ${YELLOW}Remove any build artifacts and caches${NC}"
  echo -e " - ${YELLOW}Reinstall all dependencies${NC}"
  echo -e " - ${YELLOW}Rebuild the project${NC}"
  echo ""
  echo -e "${RED}All your code changes will be preserved, but any untracked files may be lost.${NC}"
  echo -e "${RED}This operation cannot be undone except by restoring from the backup.${NC}"
  echo ""
  
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Operation cancelled.${NC}"
    exit 1
  fi
fi

# Create backup
if [ "$SKIP_BACKUP" != true ]; then
  echo -e "${GREEN}Creating backup before reset...${NC}"
  ./backup.sh
  if [ $? -ne 0 ]; then
    echo -e "${RED}Backup failed! Aborting reset for safety.${NC}"
    echo -e "${YELLOW}If you want to proceed anyway, use the --no-backup flag.${NC}"
    exit 1
  fi
fi

# Clean up node_modules and build artifacts
echo -e "${GREEN}Cleaning project directories...${NC}"
rm -rf node_modules
rm -rf dist build .cache
rm -rf client/node_modules
rm -rf server/node_modules
rm -rf .npm

# Clean package manager cache
echo -e "${GREEN}Clearing npm cache...${NC}"
npm cache clean --force

# Reinstall dependencies
echo -e "${GREEN}Reinstalling dependencies...${NC}"
npm install

# Migrate database if needed
if [ -f "db-migrate.sh" ]; then
  echo -e "${YELLOW}Do you want to reset and migrate the database? (y/n)${NC} "
  read -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Migrating database...${NC}"
    ./db-migrate.sh
  else
    echo -e "${YELLOW}Skipping database migration.${NC}"
  fi
fi

# Check for errors
if [ $? -ne 0 ]; then
  echo -e "${RED}Error during reinstallation. Please check the logs above.${NC}"
  exit 1
fi

echo -e "${GREEN}Project has been successfully reinitialized!${NC}"
echo -e "${YELLOW}You can now start the development server with 'npm run dev'${NC}"
exit 0