#!/bin/bash

# ==================================================
# Install dependencies required for decentralized deployment
# ==================================================

echo "Installing Web3.Storage dependencies..."
npm install --save-dev web3.storage ethers dotenv

echo "Installing Filecoin integration dependencies..."
npm install --save-dev @filecoin-shipyard/lotus-client-rpc @filecoin-shipyard/lotus-client-provider-nodejs @filecoin-shipyard/lotus-client-schema ipfs-http-client

echo "Dependencies installed successfully!"
echo "You can now use ./deploy-decentralized.sh to deploy your application"