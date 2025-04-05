#!/bin/bash
# Decentralized deployment script for Aetherion
# Uploads the application to IPFS/Filecoin via Web3.Storage
# Optionally updates ENS domain records and configures FractalCoin-Filecoin integration

# Load environment variables
source .env

# Check for required environment variables
if [ -z "$WEB3_STORAGE_TOKEN" ]; then
  echo "Error: WEB3_STORAGE_TOKEN is required for deployment"
  exit 1
fi

# Build the application
echo "Building application..."
npm run build

# Deploy to Web3.Storage (IPFS/Filecoin)
echo "Deploying to IPFS/Filecoin via Web3.Storage..."
# Using the deploy-to-web3.js script from scripts directory
node scripts/deploy-to-web3.js

# Check if ENS integration is configured
if [ -n "$ENS_DOMAIN" ] && [ -n "$ENS_PRIVATE_KEY" ]; then
  echo "Updating ENS record for $ENS_DOMAIN..."
  # This will be handled by the deploy-to-web3.js script
  # No additional action needed here
fi

# Check if FractalCoin-Filecoin integration is enabled
if [ "$SETUP_FILECOIN_INTEGRATION" = "true" ] && [ -n "$FRACTALCOIN_API_KEY" ]; then
  echo "Setting up FractalCoin-Filecoin integration..."
  node scripts/fractalcoin-filecoin-bridge.js
fi

echo "Deployment complete!"
echo "Your application can now be accessed via IPFS gateways and ENS (if configured)"
echo "See deployment log for specific URLs"
