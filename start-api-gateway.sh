#!/bin/bash

# Start the API Gateway for the Aetherion Blockchain Wallet
# This script starts the API Gateway process that sits between the frontend and backend,
# providing quantum-resistant security and request validation.

set -e

# Source the environment manager to ensure variables are loaded
source ./env-manager.sh

# Load environment variables
load_env

# Define colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Aetherion API Gateway...${NC}"

# Check if required environment variables are set
if [[ -z "$API_GATEWAY_PORT" ]]; then
  echo -e "${RED}Error: API_GATEWAY_PORT is not set in your .env file.${NC}"
  echo -e "${YELLOW}Defaulting to port 4000.${NC}"
  export API_GATEWAY_PORT=4000
fi

if [[ -z "$BACKEND_URL" ]]; then
  echo -e "${RED}Error: BACKEND_URL is not set in your .env file.${NC}"
  echo -e "${YELLOW}Defaulting to http://localhost:5000.${NC}"
  export BACKEND_URL=http://localhost:5000
fi

# Start the API Gateway
echo -e "${GREEN}Starting API Gateway on port ${API_GATEWAY_PORT}...${NC}"
echo -e "${GREEN}Routing API requests to backend at ${BACKEND_URL}${NC}"

# Navigate to the API Gateway directory
cd api-gateway

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing API Gateway dependencies...${NC}"
  npm install
fi

# Run the API Gateway
echo -e "${GREEN}Launching API Gateway...${NC}"
npx tsx src/index.ts

# This script shouldn't reach here unless there's an error
echo -e "${RED}API Gateway stopped unexpectedly.${NC}"
exit 1