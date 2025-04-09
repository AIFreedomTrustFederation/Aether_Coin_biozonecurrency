#!/bin/bash
# Script to synchronize changes with GitHub
# This provides a command-line alternative to the GitHub Actions workflow

# Configuration - EDIT THESE VALUES
GITHUB_REPO="https://github.com/your-username/aetherion.git"
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting GitHub synchronization...${NC}"

# Check if GitHub repo is already configured as a remote
if ! git remote | grep -q "github"; then
  echo -e "${YELLOW}Adding GitHub as a remote...${NC}"
  git remote add github $GITHUB_REPO
fi

# Fetch the latest changes from GitHub
echo -e "${YELLOW}Fetching from GitHub...${NC}"
if ! git fetch github; then
  echo -e "${RED}Error fetching from GitHub. Check your network connection and repository URL.${NC}"
  exit 1
fi

# Stage all changes
echo -e "${YELLOW}Staging all changes...${NC}"
git add .

# Commit changes if there are any
if git diff --staged --quiet; then
  echo -e "${YELLOW}No changes to commit${NC}"
else
  echo -e "${YELLOW}Committing changes...${NC}"
  git commit -m "Automated sync from Replit on $(date)"
fi

# Push changes to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
if git push github $BRANCH; then
  echo -e "${GREEN}Successfully pushed changes to GitHub!${NC}"
else
  echo -e "${RED}Failed to push changes to GitHub.${NC}"
  echo -e "${YELLOW}Attempting to pull changes first and then push...${NC}"
  
  # Try to pull with rebase and then push again
  if git pull github $BRANCH --rebase; then
    if git push github $BRANCH; then
      echo -e "${GREEN}Successfully pushed changes to GitHub after pulling!${NC}"
    else
      echo -e "${RED}Failed to push even after pulling. You may need to resolve conflicts manually.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}Failed to pull changes. You may need to resolve conflicts manually.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Synchronization complete!${NC}"