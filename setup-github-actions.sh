#!/bin/bash
# GitHub Actions Setup Script for Aetherion Wallet Deployment
# This script helps initialize the GitHub repository for automated deployment

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  echo -e "${RED}GitHub CLI (gh) is not installed. Please install it first.${NC}"
  echo "Visit: https://cli.github.com/manual/installation"
  exit 1
fi

# Check if user is authenticated with GitHub
if ! gh auth status &> /dev/null; then
  echo -e "${YELLOW}You are not authenticated with GitHub CLI. Let's authenticate.${NC}"
  gh auth login
fi

# Print banner
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}    AETHERION WALLET - GITHUB ACTIONS SETUP  ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Get repository info if not in a GitHub repo
if ! gh repo view &> /dev/null; then
  echo -e "${YELLOW}No GitHub repository detected. Let's set one up.${NC}"
  
  read -p "Enter GitHub username or organization: " github_user
  read -p "Enter repository name: " repo_name
  
  echo -e "${BLUE}Creating GitHub repository ${github_user}/${repo_name}...${NC}"
  gh repo create "${github_user}/${repo_name}" --public --source=.
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create GitHub repository. Please try again.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Repository created successfully!${NC}"
else
  # Get the current repo info
  repo_info=$(gh repo view --json nameWithOwner -q .nameWithOwner)
  github_user=$(echo $repo_info | cut -d'/' -f1)
  repo_name=$(echo $repo_info | cut -d'/' -f2)
  
  echo -e "${GREEN}Using existing repository: ${repo_info}${NC}"
fi

# Create GitHub directory structure if it doesn't exist
mkdir -p .github/workflows

# Copy workflow files
if [ -f ".github/workflows/deploy-to-dapp.yml" ]; then
  echo -e "${GREEN}GitHub workflow file already exists.${NC}"
else
  echo -e "${BLUE}Setting up GitHub workflow file...${NC}"
  # Check if the deployment workflow file exists
  if [ -f "deploy-to-dapp.yml" ]; then
    cp deploy-to-dapp.yml .github/workflows/
  else
    echo -e "${YELLOW}Workflow file not found in current directory.${NC}"
    echo -e "${YELLOW}Using the one we created in .github/workflows/deploy-to-dapp.yml${NC}"
  fi
fi

# Setting up secrets
echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}    SETTING UP DEPLOYMENT SECRETS            ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "${YELLOW}You'll need to set up several secrets for deployment:${NC}"
echo "1. SSH_PRIVATE_KEY - Your SSH private key for the server"
echo "2. DEPLOY_SSH_HOST - The hostname (atc.aifreedomtrust.com)"
echo "3. DEPLOY_SSH_USER - Your SSH username"
echo "4. DEPLOY_SSH_PORT - SSH port (usually 22)"
echo "5. DATABASE_URL - PostgreSQL database connection string"
echo "6. SESSION_SECRET - Secret for session cookies"
echo -e "${YELLOW}Would you like to set up these secrets now? (y/n)${NC}"
read -p "> " setup_secrets

if [ "$setup_secrets" = "y" ] || [ "$setup_secrets" = "Y" ]; then
  # SSH_PRIVATE_KEY
  echo ""
  echo -e "${BLUE}Setting up SSH_PRIVATE_KEY${NC}"
  echo "Enter the path to your SSH private key file (e.g., ~/.ssh/id_rsa):"
  read -p "> " ssh_key_path
  
  if [ -f "$ssh_key_path" ]; then
    ssh_key=$(cat "$ssh_key_path")
    gh secret set SSH_PRIVATE_KEY -b"$ssh_key"
    echo -e "${GREEN}SSH_PRIVATE_KEY set successfully!${NC}"
  else
    echo -e "${RED}SSH key file not found. Skipping this step.${NC}"
  fi
  
  # DEPLOY_SSH_HOST
  echo ""
  echo -e "${BLUE}Setting up DEPLOY_SSH_HOST${NC}"
  read -p "Enter the hostname (e.g., atc.aifreedomtrust.com): " ssh_host
  gh secret set DEPLOY_SSH_HOST -b"$ssh_host"
  
  # DEPLOY_SSH_USER
  echo ""
  echo -e "${BLUE}Setting up DEPLOY_SSH_USER${NC}"
  read -p "Enter the SSH username: " ssh_user
  gh secret set DEPLOY_SSH_USER -b"$ssh_user"
  
  # DEPLOY_SSH_PORT
  echo ""
  echo -e "${BLUE}Setting up DEPLOY_SSH_PORT${NC}"
  read -p "Enter the SSH port (default: 22): " ssh_port
  ssh_port=${ssh_port:-22}
  gh secret set DEPLOY_SSH_PORT -b"$ssh_port"
  
  # DATABASE_URL
  echo ""
  echo -e "${BLUE}Setting up DATABASE_URL${NC}"
  read -p "Enter the PostgreSQL database connection string: " db_url
  gh secret set DATABASE_URL -b"$db_url"
  
  # SESSION_SECRET
  echo ""
  echo -e "${BLUE}Setting up SESSION_SECRET${NC}"
  # Generate a random session secret
  session_secret=$(openssl rand -hex 32)
  echo "Generated a random session secret."
  gh secret set SESSION_SECRET -b"$session_secret"
  
  # GITHUB_TOKEN
  echo ""
  echo -e "${BLUE}Setting up GITHUB_TOKEN${NC}"
  echo "For deployment verification, we need to use the GitHub token."
  echo "Would you like to use your current GitHub token or enter a new one?"
  echo "1. Use current token"
  echo "2. Enter a new token"
  read -p "> " token_choice
  
  if [ "$token_choice" = "1" ]; then
    token=$(gh auth token)
    gh secret set GITHUB_TOKEN -b"$token"
  else
    read -p "Enter your GitHub personal access token: " custom_token
    gh secret set GITHUB_TOKEN -b"$custom_token"
  fi
  
  echo -e "${GREEN}All secrets set successfully!${NC}"
else
  echo -e "${YELLOW}Skipping secrets setup. You will need to set them up manually.${NC}"
fi

# Push workflow to GitHub
echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}    FINALIZING SETUP                         ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

echo -e "${YELLOW}Would you like to push the workflow file to GitHub now? (y/n)${NC}"
read -p "> " push_now

if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
  echo -e "${BLUE}Pushing changes to GitHub...${NC}"
  git add .github/workflows/deploy-to-dapp.yml
  git commit -m "Add GitHub Actions workflow for deploying to atc.aifreedomtrust.com/dapp"
  git push
  
  echo -e "${GREEN}Workflow pushed successfully!${NC}"
  echo ""
  echo -e "${BLUE}You can now trigger a deployment by:${NC}"
  echo "1. Going to your GitHub repository"
  echo "2. Clicking on 'Actions'"
  echo "3. Selecting 'Deploy to AI Freedom Trust DApp'"
  echo "4. Clicking 'Run workflow'"
else
  echo -e "${YELLOW}Skipping push. You will need to push the changes manually.${NC}"
fi

echo ""
echo -e "${GREEN}GitHub Actions setup complete!${NC}"
echo -e "${GREEN}Your Aetherion wallet is now configured for deployment to atc.aifreedomtrust.com/dapp${NC}"