#!/bin/bash
#
# SIMPLIFIED DEPLOYMENT SCRIPT FOR AETHERION SAAS APP
# Target: atc.aifreedomtrust.com
#
# This script automates the deployment process using Node.js

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Print banner
echo -e "${MAGENTA}=============================================${NC}"
echo -e "${MAGENTA}    AETHERION SIMPLIFIED DEPLOYMENT SCRIPT    ${NC}"
echo -e "${MAGENTA}    Target: atc.aifreedomtrust.com            ${NC}"
echo -e "${MAGENTA}=============================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install it and try again.${NC}"
    exit 1
fi

# Check if deploy-to-aifreedomtrust-full.js exists
DEPLOY_SCRIPT="deploy-to-aifreedomtrust-full.js"
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    echo -e "${RED}ERROR: $DEPLOY_SCRIPT not found in the current directory.${NC}"
    exit 1
fi

# Run the deployment script
echo -e "${CYAN}Starting deployment process using $DEPLOY_SCRIPT...${NC}"
echo -e "${YELLOW}This may take several minutes. Please be patient.${NC}"
echo ""

# Run the Node.js deployment script
node $DEPLOY_SCRIPT

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}=== DEPLOYMENT COMPLETED SUCCESSFULLY ===${NC}"
    echo -e "${GREEN}Your application is now available at: https://atc.aifreedomtrust.com/dapp${NC}"
else
    echo -e "\n${RED}=== DEPLOYMENT FAILED ===${NC}"
    echo -e "${RED}Please check the logs for more information.${NC}"
fi

# Keep the window open
echo -e "\n${CYAN}Press Enter to exit...${NC}"
read