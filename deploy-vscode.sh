#!/bin/bash
# deploy-vscode.sh
# VS Code deployment script for Aetherion Wallet with enhanced features
# This script integrates with the FractalCoin/IPFS secure credential storage system

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Print banner
echo -e "${CYAN}${BOLD}==============================================================="
echo -e "  Aetherion Wallet - VS Code Deployment"
echo -e "===============================================================${NC}"
echo ""

# Check if required files exist
if [ ! -f "deploy-to-aifreedomtrust.js" ]; then
  echo -e "${RED}Error: deploy-to-aifreedomtrust.js not found.${NC}"
  echo -e "${YELLOW}Make sure you are in the root directory of the Aetherion Wallet project.${NC}"
  exit 1
fi

# Process command line arguments
TARGET="wallet"
DEBUG=false
CREATE_WORKFLOW=false

for arg in "$@"
do
  case $arg in
    --target=*)
      TARGET="${arg#*=}"
      shift
      ;;
    --debug)
      DEBUG=true
      shift
      ;;
    --create-workflow)
      CREATE_WORKFLOW=true
      shift
      ;;
    --help)
      echo -e "${BLUE}Usage: ./deploy-vscode.sh [options]${NC}"
      echo ""
      echo -e "${BOLD}Options:${NC}"
      echo "  --target=ENDPOINT     Specify deployment target: wallet, dapp, or both (default: wallet)"
      echo "  --debug               Enable debug output"
      echo "  --create-workflow     Create GitHub Actions workflow before deploying"
      echo "  --help                Show this help message"
      echo ""
      echo -e "${BOLD}Examples:${NC}"
      echo "  ./deploy-vscode.sh --target=wallet"
      echo "  ./deploy-vscode.sh --target=dapp --debug"
      echo "  ./deploy-vscode.sh --target=both --create-workflow"
      exit 0
      ;;
    *)
      # Unknown option
      ;;
  esac
done

# Step 1: Generate GitHub Actions workflow if requested
if [ "$CREATE_WORKFLOW" = true ]; then
  echo -e "${MAGENTA}Generating GitHub Actions workflow...${NC}"
  
  # Create directory if it doesn't exist
  mkdir -p .github/workflows
  
  # Check if we have the generator script
  if [ -f "github-actions-generator.js" ]; then
    node github-actions-generator.js
  else
    # If not, copy the template directly
    if [ -f "github-deploy-ci-cd.yml" ]; then
      cp github-deploy-ci-cd.yml .github/workflows/deploy.yml
      echo -e "${GREEN}✓ GitHub Actions workflow created at .github/workflows/deploy.yml${NC}"
    else
      echo -e "${YELLOW}Warning: Could not generate GitHub Actions workflow.${NC}"
      echo -e "${YELLOW}Neither github-actions-generator.js nor github-deploy-ci-cd.yml found.${NC}"
    fi
  fi
  
  echo ""
fi

# Step 2: Prepare for deployment
echo -e "${BLUE}Preparing for deployment to ${BOLD}atc.aifreedomtrust.com/${TARGET}${NC}"
echo -e "${YELLOW}Target: ${TARGET}${NC}"

if [ "$DEBUG" = true ]; then
  echo -e "${YELLOW}Debug mode: Enabled${NC}"
fi

echo ""
echo -e "${BLUE}Starting deployment...${NC}"

# Step 3: Run the deployment script with appropriate arguments
DEBUG_FLAG=""
if [ "$DEBUG" = true ]; then
  DEBUG_FLAG="--debug"
fi

node deploy-to-aifreedomtrust.js --target=$TARGET $DEBUG_FLAG

# Check deployment status
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}${BOLD}==============================================================="
  echo -e "  Deployment Successful!"
  echo -e "===============================================================${NC}"
  echo ""
  echo -e "${CYAN}The Aetherion Wallet has been deployed to:${NC}"
  echo -e "${BOLD}https://atc.aifreedomtrust.com/${TARGET}${NC}"
  echo ""
  echo -e "${CYAN}To verify the deployment, visit the URL above.${NC}"
else
  echo ""
  echo -e "${RED}${BOLD}==============================================================="
  echo -e "  Deployment Failed"
  echo -e "===============================================================${NC}"
  echo ""
  echo -e "${YELLOW}Check the error messages above for details on why the deployment failed.${NC}"
  echo -e "${YELLOW}For troubleshooting help, see CODE-EDITOR-README.md${NC}"
fi

exit 0
