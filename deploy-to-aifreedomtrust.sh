#!/bin/bash
# Deployment script launcher for Aetherion Wallet
# This script launches the Node.js deployment script

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}    AETHERION WALLET DEPLOYMENT LAUNCHER     ${NC}"
echo -e "${BLUE}    Target: atc.aifreedomtrust.com           ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to run the deployment script.${NC}"
    exit 1
fi

# Check if the deployment script exists
if [ ! -f "deploy-to-aifreedomtrust.js" ]; then
    echo -e "${RED}Deployment script not found. Please make sure deploy-to-aifreedomtrust.js exists in the current directory.${NC}"
    exit 1
fi

# Execute the Node.js deployment script
echo -e "${GREEN}Starting Aetherion Wallet deployment process...${NC}"
node deploy-to-aifreedomtrust.js

# Check if the script executed successfully
if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed. Please check the log file for details.${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment script completed.${NC}"
