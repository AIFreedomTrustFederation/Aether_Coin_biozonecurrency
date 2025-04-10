#!/bin/bash

# GitHub Sync Script for Aetherion
# This script automates the process of synchronizing changes with GitHub

echo "=== Aetherion GitHub Sync ==="
echo "Starting synchronization process..."

# Source environment variables
if [ -f .env ]; then
  source .env
else
  echo "Error: .env file not found!"
  echo "Please run ./setup-github-sync.sh first to configure GitHub sync."
  exit 1
fi

# Check if GitHub token is available
# First try from .env file, then from environment
if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN not found in .env file, checking environment variables..."
  if [ -n "$REPLIT_GITHUB_TOKEN" ]; then
    echo "Found GITHUB_TOKEN in environment variables."
    export GITHUB_TOKEN="$REPLIT_GITHUB_TOKEN"
  else
    echo "Error: GitHub token not found in .env file or environment variables!"
    echo "Please run ./setup-github-sync.sh to configure your token."
    exit 1
  fi
fi

# Run the trigger script
echo "Triggering GitHub workflow..."
cd scripts && npm run trigger-sync

# Check if the trigger was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "Synchronization process initiated successfully!"
  echo "Check your GitHub repository Actions tab to see the workflow run."
  echo ""
  echo "Note: The actual synchronization will happen on GitHub's servers."
  echo "This may take a few minutes to complete."
else
  echo ""
  echo "Error: Failed to trigger the synchronization workflow."
  echo "Please check the error messages above for more information."
  echo ""
  echo "For troubleshooting, see GITHUB-SYNC-TROUBLESHOOTING.md"
fi