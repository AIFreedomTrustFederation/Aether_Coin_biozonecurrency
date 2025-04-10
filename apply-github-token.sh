#!/bin/bash

# Script to directly apply the GitHub token from environment variables to the .env file
# This is useful when using the Replit secrets manager

echo "=== Aetherion GitHub Token Update ==="
echo "This script will update your GitHub token in the .env file from environment variables."

# Check if token exists in environment variables
if [ -n "$GITHUB_TOKEN" ]; then
  echo "Found GITHUB_TOKEN in environment variables."
  
  # Update the environment file with GitHub token
  if grep -q "GITHUB_TOKEN=" .env; then
    # Token already exists, update it
    sed -i "s/GITHUB_TOKEN=.*/GITHUB_TOKEN=$GITHUB_TOKEN/" .env
  else
    # Token doesn't exist, add it
    echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> .env
  fi
  
  echo "GitHub token updated successfully in .env file."
  echo "You can now run the sync process by executing:"
  echo "  ./github-sync.sh"
else
  echo "Error: GITHUB_TOKEN not found in environment variables."
  echo "Please add it using the Replit Secrets management tool."
  exit 1
fi