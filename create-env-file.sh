#!/bin/bash
# create-env-file.sh
# This script generates environment-specific .env files for deployment

# Terminal colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get environment type from command line argument
ENV_TYPE=$1

# Validate environment type
if [[ "$ENV_TYPE" != "production" && "$ENV_TYPE" != "staging" && "$ENV_TYPE" != "development" ]]; then
  echo -e "${RED}Invalid environment type. Please specify 'production', 'staging', or 'development'.${NC}"
  echo "Usage: $0 <environment-type>"
  exit 1
fi

echo -e "${BLUE}Generating ${ENV_TYPE} environment file...${NC}"

# Check if base .env file exists
if [[ ! -f ".env.example" ]]; then
  echo -e "${YELLOW}Warning: .env.example not found. Creating a minimal base file.${NC}"
  touch .env.example
fi

# Check if environment-specific file exists
if [[ ! -f ".env.${ENV_TYPE}" ]]; then
  echo -e "${RED}Error: .env.${ENV_TYPE} not found. Please create this file first.${NC}"
  exit 1
fi

# Create the destination .env file
echo "# This file was generated automatically by create-env-file.sh for ${ENV_TYPE} environment" > .env
echo "# Generated on: $(date)" >> .env
echo "" >> .env

# Copy base environment variables from .env.example
echo -e "${BLUE}Adding base environment variables...${NC}"
grep -v "^#" .env.example | grep -v "^$" >> .env

# Add environment-specific variables, overriding any duplicates
echo -e "${BLUE}Adding ${ENV_TYPE}-specific environment variables...${NC}"
grep -v "^#" ".env.${ENV_TYPE}" | grep -v "^$" >> .env

# Ensure NODE_ENV is set correctly
sed -i '/^NODE_ENV=/d' .env
echo "NODE_ENV=${ENV_TYPE}" >> .env

# Make sure the file has the right permissions
chmod 600 .env

echo -e "${GREEN}Environment file for ${ENV_TYPE} created successfully!${NC}"
echo -e "${BLUE}File: $(pwd)/.env${NC}"

# Count variables in the file
VAR_COUNT=$(grep -v "^#" .env | grep "=" | wc -l)
echo -e "${BLUE}Total environment variables: ${VAR_COUNT}${NC}"

# Check for potentially missing sensitive variables
SENSITIVE_VARS=("DATABASE_URL" "JWT_SECRET" "SESSION_SECRET" "API_KEY" "GITHUB_TOKEN")
MISSING_SENSITIVE=0

echo -e "${BLUE}Checking for potentially missing sensitive variables...${NC}"
for VAR in "${SENSITIVE_VARS[@]}"; do
  if ! grep -q "^${VAR}=" .env; then
    echo -e "${YELLOW}Warning: ${VAR} is not set in the environment file.${NC}"
    MISSING_SENSITIVE=$((MISSING_SENSITIVE + 1))
  fi
done

if [[ $MISSING_SENSITIVE -eq 0 ]]; then
  echo -e "${GREEN}All expected sensitive variables are present.${NC}"
else
  echo -e "${YELLOW}${MISSING_SENSITIVE} sensitive variables might be missing.${NC}"
  echo -e "${YELLOW}Make sure to add them before deploying.${NC}"
fi

echo -e "${GREEN}Environment setup complete for ${ENV_TYPE}!${NC}"