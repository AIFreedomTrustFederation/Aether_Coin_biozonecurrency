#!/bin/bash

# Script to set up GitHub synchronization for Aetherion
# This script helps configure the GitHub synchronization process

echo "=== Aetherion GitHub Sync Setup ==="
echo "This script will help you set up GitHub synchronization for Aetherion."

# Default values from your current configuration
DEFAULT_USERNAME="AIFreedomTrustFederation"
DEFAULT_REPO="Aether_Coin_biozonecurrency"

# Ask for GitHub username with default value
read -p "Enter your GitHub username [$DEFAULT_USERNAME]: " GITHUB_USERNAME
GITHUB_USERNAME=${GITHUB_USERNAME:-$DEFAULT_USERNAME}

# Ask for repository name with default value
read -p "Enter your GitHub repository name [$DEFAULT_REPO]: " REPO_NAME
REPO_NAME=${REPO_NAME:-$DEFAULT_REPO}

# Check if token exists in environment variables first
if [ -n "$REPLIT_GITHUB_TOKEN" ]; then
  echo "Found GITHUB_TOKEN in environment variables, using that value."
  GITHUB_TOKEN="$REPLIT_GITHUB_TOKEN"
else
  # Ask for GitHub personal access token
  read -p "Enter your GitHub personal access token (with workflow permissions): " GITHUB_TOKEN
fi

# Make sure we have a token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: No GitHub token provided. Cannot continue."
  exit 1
fi

# Update the environment file with GitHub token
if grep -q "GITHUB_TOKEN" .env; then
  # Token already exists, update it
  sed -i "s/GITHUB_TOKEN=.*/GITHUB_TOKEN=$GITHUB_TOKEN/" .env
else
  # Token doesn't exist, add it
  echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> .env
fi

# Store GitHub username and repo in .env as well for reference
if grep -q "GITHUB_USERNAME" .env; then
  sed -i "s/GITHUB_USERNAME=.*/GITHUB_USERNAME=$GITHUB_USERNAME/" .env
else
  echo "GITHUB_USERNAME=$GITHUB_USERNAME" >> .env
fi

if grep -q "GITHUB_REPO" .env; then
  sed -i "s/GITHUB_REPO=.*/GITHUB_REPO=$REPO_NAME/" .env
else
  echo "GITHUB_REPO=$REPO_NAME" >> .env
fi

# Update the trigger-github-sync.js file with the correct username and repo
sed -i "s/const GITHUB_USERNAME = '.*';/const GITHUB_USERNAME = '$GITHUB_USERNAME';/" scripts/trigger-github-sync.js
sed -i "s/const REPO_NAME = '.*';/const REPO_NAME = '$REPO_NAME';/" scripts/trigger-github-sync.js

echo ""
echo "GitHub synchronization configured successfully!"
echo "Username: $GITHUB_USERNAME"
echo "Repository: $REPO_NAME"
echo "Token: <hidden>"
echo ""
echo "You can now run the sync process by executing:"
echo "  ./github-sync.sh"
echo ""
echo "Remember to create a 'REPLIT_GIT_URL' secret in your GitHub repository settings"
echo "with the URL to your Replit Git repository."