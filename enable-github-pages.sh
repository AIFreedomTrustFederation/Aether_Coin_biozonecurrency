#!/bin/bash
# GitHub Pages Setup Script for Aetherion Wallet
# This script performs the necessary steps to enable GitHub Pages for your repository

# Set color variables
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}====================================================================${NC}"
echo -e "${GREEN}       GitHub Pages Setup for Aetherion Wallet${NC}"
echo -e "${BLUE}====================================================================${NC}"
echo -e "${YELLOW}This script configures your repository for GitHub Pages deployment${NC}"
echo -e "${BLUE}====================================================================${NC}"

# Check if git is installed
if ! [ -x "$(command -v git)" ]; then
  echo -e "${RED}Error: git is not installed.${NC}" >&2
  exit 1
fi

# Check if gh (GitHub CLI) is installed
if ! [ -x "$(command -v gh)" ]; then
  echo -e "${YELLOW}Warning: GitHub CLI (gh) is not installed.${NC}"
  echo -e "${YELLOW}Some operations will require manual steps in GitHub's web interface.${NC}"
  USE_GH=false
else
  USE_GH=true
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
  echo -e "${RED}Error: Not a git repository. Please run this script from the root of your repository.${NC}" >&2
  exit 1
fi

# Ensure CNAME file exists
if [ ! -f CNAME ]; then
  echo -e "${YELLOW}CNAME file not found. Creating it...${NC}"
  echo "atc.aifreedomtrust.com" > CNAME
  echo -e "${GREEN}Created CNAME file with 'atc.aifreedomtrust.com'${NC}"
else
  echo -e "${GREEN}CNAME file exists. Content: $(cat CNAME)${NC}"
fi

# Ensure GitHub workflow directory exists
if [ ! -d .github/workflows ]; then
  echo -e "${YELLOW}GitHub workflows directory not found. Creating it...${NC}"
  mkdir -p .github/workflows
  echo -e "${GREEN}Created .github/workflows directory${NC}"
else
  echo -e "${GREEN}GitHub workflows directory exists${NC}"
fi

# Check if GitHub Pages workflow exists
if [ ! -f .github/workflows/github-pages-deploy.yml ]; then
  echo -e "${YELLOW}GitHub Pages workflow not found. Creating it...${NC}"
  
  # Create GitHub Pages workflow file
  cat > .github/workflows/github-pages-deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Copy CNAME file to build directory
        run: cp CNAME dist/
      
      - name: Setup Pages
        uses: actions/configure-pages@v3
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v1
        with:
          path: 'dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
EOF

  echo -e "${GREEN}Created GitHub Pages workflow file${NC}"
else
  echo -e "${GREEN}GitHub Pages workflow exists${NC}"
fi

# Commit the changes
echo -e "${YELLOW}Committing changes to the repository...${NC}"
git add CNAME .github/workflows/github-pages-deploy.yml
git commit -m "Configure GitHub Pages deployment"

echo -e "${GREEN}Changes committed. You now need to push to GitHub with:${NC}"
echo -e "${BLUE}git push origin main${NC}"

# If GitHub CLI is available, try to enable GitHub Pages
if [ "$USE_GH" = true ]; then
  echo -e "${YELLOW}Attempting to enable GitHub Pages using GitHub CLI...${NC}"
  
  # Check if logged in to GitHub CLI
  if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}You are not logged in to GitHub CLI. Please run 'gh auth login' first.${NC}"
  else
    # Get repository info
    REPO_INFO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
    
    if [ -n "$REPO_INFO" ]; then
      echo -e "${GREEN}Repository identified as: $REPO_INFO${NC}"
      
      # Enable GitHub Pages
      echo -e "${YELLOW}Enabling GitHub Pages...${NC}"
      gh api -X PUT repos/$REPO_INFO/pages -f source='{"branch":"gh-pages","path":"/"}'
      
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}GitHub Pages enabled successfully!${NC}"
      else
        echo -e "${YELLOW}Could not enable GitHub Pages via API. Please enable it manually:${NC}"
        echo -e "${BLUE}1. Go to your repository on GitHub${NC}"
        echo -e "${BLUE}2. Navigate to Settings > Pages${NC}"
        echo -e "${BLUE}3. Under 'Source', select 'GitHub Actions'${NC}"
      fi
    else
      echo -e "${YELLOW}Could not determine repository info. Please enable GitHub Pages manually:${NC}"
      echo -e "${BLUE}1. Go to your repository on GitHub${NC}"
      echo -e "${BLUE}2. Navigate to Settings > Pages${NC}"
      echo -e "${BLUE}3. Under 'Source', select 'GitHub Actions'${NC}"
    fi
  fi
else
  echo -e "${YELLOW}To enable GitHub Pages, please follow these steps:${NC}"
  echo -e "${BLUE}1. Go to your repository on GitHub${NC}"
  echo -e "${BLUE}2. Navigate to Settings > Pages${NC}"
  echo -e "${BLUE}3. Under 'Source', select 'GitHub Actions'${NC}"
fi

# DNS configuration instructions
echo -e "${BLUE}====================================================================${NC}"
echo -e "${YELLOW}DNS Configuration Instructions${NC}"
echo -e "${BLUE}====================================================================${NC}"
echo -e "${GREEN}Configure the following DNS records for your domain:${NC}"
echo -e ""
echo -e "${BLUE}A records for atc.aifreedomtrust.com:${NC}"
echo -e "   ${GREEN}185.199.108.153${NC}"
echo -e "   ${GREEN}185.199.109.153${NC}"
echo -e "   ${GREEN}185.199.110.153${NC}"
echo -e "   ${GREEN}185.199.111.153${NC}"
echo -e ""
echo -e "${YELLOW}Note: DNS propagation may take up to 24 hours.${NC}"
echo -e "${YELLOW}      GitHub Pages may take up to 24 hours to provision SSL certificates.${NC}"
echo -e "${BLUE}====================================================================${NC}"

echo -e "${GREEN}GitHub Pages setup complete!${NC}"