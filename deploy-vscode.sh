#!/bin/bash
# VS Code deploy script for Aetherion Wallet
# This script automates the deployment process from VS Code

echo "=== Aetherion Wallet Deployment from VS Code ==="
echo "Preparing deployment..."

# Generate GitHub Actions workflow if needed
if [ ! -f ".github/workflows/deploy.yml" ]; then
  echo "Generating GitHub Actions workflow..."
  node github-actions-generator.js
fi

# Run deployment
echo "Starting deployment to aifreedomtrust.com..."
node deploy-to-aifreedomtrust.js

echo "Deployment process complete!"
