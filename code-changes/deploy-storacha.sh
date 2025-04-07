#!/bin/bash
# Decentralized deployment script for Aetherion using Storacha
# Uploads the application to IPFS via Storacha
# Optionally updates ENS domain records

# Load environment variables
source .env

# Check for required environment variables
if [ -z "$STORACHA_API_KEY" ]; then
  echo "Error: STORACHA_API_KEY is required for deployment"
  exit 1
fi

# Build the application
echo "Building application..."
npm run build

# Deploy to Storacha (IPFS alternative)
echo "Deploying to IPFS via Storacha..."
# Using the deploy-to-storacha.js script from scripts directory
node --experimental-modules scripts/deploy-to-storacha.js

# Check if ENS integration is configured
if [ -n "$ENS_DOMAIN" ] && [ -n "$ENS_PRIVATE_KEY" ]; then
  echo "ENS integration handled by the deploy-to-storacha.js script"
  # No additional action needed here
fi

echo "Deployment complete!"
echo "Your application can now be accessed via IPFS gateways and ENS (if configured)"
echo "See deployment log for specific URLs"
