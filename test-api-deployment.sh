#!/bin/bash
# API Deployment Test Script for Aetherion Wallet
# This script tests the API endpoints after deployment

# Set color variables
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="https://atc.aifreedomtrust.com/api"

# Print banner
echo -e "${BLUE}====================================================================${NC}"
echo -e "${GREEN}       Aetherion Wallet API Deployment Test${NC}"
echo -e "${BLUE}====================================================================${NC}"
echo -e "${YELLOW}Testing API endpoints at ${BASE_URL}${NC}"
echo -e "${BLUE}====================================================================${NC}"

# Check if curl is installed
if ! [ -x "$(command -v curl)" ]; then
  echo -e "${RED}Error: curl is not installed.${NC}" >&2
  exit 1
fi

# Function to test an endpoint
test_endpoint() {
  local endpoint=$1
  local method=$2
  local data=$3
  local description=$4
  
  echo -e "${YELLOW}Testing ${description} (${method} ${endpoint})...${NC}"
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -X GET "${BASE_URL}${endpoint}" -H "Accept: application/json")
  else
    response=$(curl -s -X "${method}" "${BASE_URL}${endpoint}" -H "Content-Type: application/json" -H "Accept: application/json" -d "${data}")
  fi
  
  # Check if response contains "status"
  if echo "$response" | grep -q "status"; then
    status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d '"' -f 4)
    
    if [ "$status" == "success" ] || [ "$status" == "ok" ]; then
      echo -e "${GREEN}✓ ${description} test passed${NC}"
    else
      echo -e "${RED}✗ ${description} test failed: $response${NC}"
    fi
  else
    echo -e "${RED}✗ ${description} test failed: Invalid response - $response${NC}"
  fi
  
  echo ""
}

# Test health endpoint
test_endpoint "/health" "GET" "" "Health check"

# Test wallet API info
test_endpoint "/wallet" "GET" "" "Wallet API info"

# Test node marketplace API info
test_endpoint "/node-marketplace" "GET" "" "Node Marketplace API info"

# Optional tests that would require an actual account
if [ "$1" == "--with-account" ]; then
  echo -e "${YELLOW}Testing with account credentials...${NC}"
  
  # You would need to provide actual credentials here
  test_endpoint "/wallet/balance/your_wallet_address" "GET" "" "Wallet balance"
  
  test_endpoint "/node-marketplace/list" "GET" "" "Node marketplace listings"
fi

echo -e "${BLUE}====================================================================${NC}"
echo -e "${GREEN}API deployment tests completed!${NC}"
echo -e "${BLUE}====================================================================${NC}"