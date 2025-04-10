#!/bin/bash
# rotate-secrets.sh
# Script to rotate secrets for Aetherion Wallet deployment

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}     Aetherion Wallet Deployment Secrets Rotation     ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo

# Check for environment argument
if [ $# -lt 1 ]; then
  echo -e "${YELLOW}Usage: $0 <environment>${NC}"
  echo -e "${YELLOW}Environment must be one of: development, staging, production${NC}"
  exit 1
fi

ENVIRONMENT=$1
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
  echo -e "${YELLOW}Environment must be one of: development, staging, production${NC}"
  exit 1
fi

echo -e "${BLUE}Starting secrets rotation for $ENVIRONMENT environment...${NC}"

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
  echo -e "${YELLOW}GitHub CLI not found. Some features will be limited.${NC}"
fi

# Ensure backup directory exists
mkdir -p ./secrets_backup

# Timestamp for backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="./secrets_backup/secrets_${ENVIRONMENT}_${TIMESTAMP}.env"

# Load current secrets from .env file
echo -e "${BLUE}Backing up current environment...${NC}"
if [ -f ".env.${ENVIRONMENT}" ]; then
  cp ".env.${ENVIRONMENT}" "$BACKUP_FILE"
  echo -e "${GREEN}Current secrets backed up to $BACKUP_FILE${NC}"
else
  echo -e "${YELLOW}Warning: .env.${ENVIRONMENT} file not found. Creating new configuration.${NC}"
  touch "$BACKUP_FILE"
fi

# Define secrets that need rotation
SECRETS_TO_ROTATE=(
  "SESSION_SECRET"
  "JWT_SECRET"
  "API_GATEWAY_KEY"
)

# Generate new secrets
echo -e "${BLUE}Generating new secrets...${NC}"

# Function to generate secure random string
generate_secret() {
  LENGTH=${2:-64}
  head -c 1000 /dev/urandom | tr -dc 'a-zA-Z0-9!@#$%^&*()-_=+[]{}|;:,.<>?' | head -c $LENGTH
}

# Create or update environment file
ENV_FILE=".env.${ENVIRONMENT}"
touch "$ENV_FILE"

# Process each secret
for SECRET in "${SECRETS_TO_ROTATE[@]}"; do
  echo -e "${BLUE}Rotating $SECRET...${NC}"
  
  # Generate new secret value
  NEW_VALUE=$(generate_secret "$SECRET")
  
  # Check if secret already exists in file
  if grep -q "^$SECRET=" "$ENV_FILE"; then
    # Update existing secret
    sed -i "s|^$SECRET=.*|$SECRET=$NEW_VALUE|" "$ENV_FILE"
  else
    # Add new secret
    echo "$SECRET=$NEW_VALUE" >> "$ENV_FILE"
  fi
  
  # Update GitHub repository secret if GitHub CLI is available
  if command -v gh &> /dev/null; then
    echo -e "${BLUE}Updating GitHub repository secret $SECRET...${NC}"
    if gh secret set "$SECRET" -b "$NEW_VALUE" 2>/dev/null; then
      echo -e "${GREEN}GitHub secret '$SECRET' updated successfully${NC}"
    else
      echo -e "${YELLOW}Failed to update GitHub secret '$SECRET'. Check your authentication and permissions.${NC}"
    fi
  fi
  
  echo -e "${GREEN}Secret '$SECRET' rotated successfully${NC}"
done

# Special handling for other secrets that have different rotation procedures
echo -e "${BLUE}Checking for special secrets that require manual rotation...${NC}"

# DATABASE_URL - warn only, requires separate process
echo -e "${YELLOW}Note: DATABASE_URL was not automatically rotated. Database credentials should be rotated separately.${NC}"

# GitHub token - warn only, requires manual rotation
echo -e "${YELLOW}Note: GITHUB_TOKEN was not automatically rotated. Visit https://github.com/settings/tokens to create a new token.${NC}"

# Deploy keys - warn only, requires manual rotation
echo -e "${YELLOW}Note: SSH_PRIVATE_KEY was not automatically rotated. Use 'ssh-keygen' to create new keys and update server authorized_keys.${NC}"

echo
echo -e "${GREEN}Secrets rotation completed for $ENVIRONMENT environment!${NC}"
echo -e "${YELLOW}Remember to:${NC}"
echo -e "1. Commit the updated .env.${ENVIRONMENT} file to your repository"
echo -e "2. Deploy the application to apply the new secrets"
echo -e "3. Update any external services that use these secrets"
echo -e "4. Verify that the application works correctly after rotation"
echo -e "5. Store backup safely: $BACKUP_FILE"

# Create a new deployment environment file
echo -e "${BLUE}Creating new environment file for deployment...${NC}"
./create-env-file.sh "$ENVIRONMENT"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}New environment file created successfully${NC}"
else
  echo -e "${RED}Failed to create new environment file${NC}"
fi