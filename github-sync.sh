#!/bin/bash

# Script to sync Aetherion with GitHub
# Uses Node.js with ES Module support

echo "Preparing to sync Aetherion with GitHub..."

# Add package.json and package-lock.json to resolve merge conflicts
git add package.json package-lock.json

# Commit any changes to resolve conflicts
git commit -m "Fix merge conflicts in package.json and package-lock.json"

# Run the sync script with ES Module flag
echo "Running GitHub sync script..."
node --experimental-modules sync-to-github.js

echo "GitHub sync process completed."