#!/bin/bash

# Check if the LLM service is available
echo "Checking LLM service availability..."

LLM_ENDPOINT=${LLM_ENDPOINT:-"http://localhost:8000"}
echo "Using LLM endpoint: $LLM_ENDPOINT"

# Attempt to connect to the health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" $LLM_ENDPOINT/health)

if [ "$response" -eq 200 ]; then
  echo "✅ LLM service is available and healthy"
  exit 0
else
  echo "❌ LLM service is not available (HTTP status: $response)"
  echo ""
  echo "Please ensure:"
  echo "1. The LLM service is running"
  echo "2. The LLM_ENDPOINT environment variable is correctly set"
  echo "3. Network connectivity to the LLM service"
  echo ""
  echo "Expected environment variables:"
  echo "- LLM_ENDPOINT: URL of the LLM service"
  echo "- FRACTALCOIN_API_KEY: API key for authentication"
  exit 1
fi