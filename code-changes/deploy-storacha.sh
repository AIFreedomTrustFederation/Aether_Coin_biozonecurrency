#!/bin/bash
# deploy-storacha.sh
# Deploys the application to Storacha IPFS

# Check if STORACHA_API_KEY is set
if [ -z "$STORACHA_API_KEY" ]; then
  echo "❌ Error: STORACHA_API_KEY environment variable is not set."
  echo "Please set it using: export STORACHA_API_KEY=your_api_key"
  exit 1
fi

# Build the application if not already built
if [ ! -d "dist" ]; then
  echo "📦 Building the application..."
  npm run build
fi

# Deploy to IPFS using Storacha
echo "🚀 Deploying to Storacha IPFS..."
node --experimental-modules scripts/deploy-to-storacha.js

# Exit with the same status as the deployment script
exit $?

