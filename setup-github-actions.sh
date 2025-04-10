#!/bin/bash
# setup-github-actions.sh
# Script to set up GitHub Actions workflow for Aetherion Wallet

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}     GitHub Actions Setup for Aetherion Wallet     ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo

# Check if GITHUB_TOKEN is available
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${YELLOW}Warning: GITHUB_TOKEN environment variable is not set.${NC}"
  echo -e "${YELLOW}This script may have limited functionality without it.${NC}"
  echo
fi

# Ensure .github/workflows directory exists
mkdir -p .github/workflows

# Create needed secrets files
mkdir -p .github/secrets_templates

# Create GitHub Actions secrets template
echo -e "${BLUE}Creating GitHub Actions secrets templates...${NC}"
cat > .github/secrets_templates/github_actions_secrets.md << 'EOL'
# GitHub Actions Required Secrets

The following secrets need to be added to your GitHub repository for the deployment workflow to function correctly.

## How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings"
3. Select "Secrets and variables" from the sidebar, then "Actions"
4. Click "New repository secret" button
5. Add each secret as described below

## Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|--------------|
| `SSH_PRIVATE_KEY` | SSH private key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----` |
| `DEPLOY_SSH_HOST` | Server hostname or IP address | `atc.aifreedomtrust.com` |
| `DEPLOY_SSH_PORT` | SSH port for the server | `22` |
| `DEPLOY_SSH_USER` | SSH username | `deploy` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/dbname` |
| `SESSION_SECRET` | Secret for session encryption | `your-secure-session-secret` |
| `GITHUB_TOKEN` | GitHub personal access token | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your-db-password` |
| `DB_NAME` | Database name | `aetherion` |

## Optional Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|--------------|
| `SLACK_WEBHOOK_URL` | Webhook URL for Slack notifications | `https://hooks.slack.com/services/XXX/YYY/ZZZ` |
| `MATRIX_SERVER_URL` | Matrix server URL | `https://matrix.org` |
| `MATRIX_ACCESS_TOKEN` | Matrix access token | `syt_xxxxx` |
| `MATRIX_USER_ID` | Matrix user ID | `@user:matrix.org` |
| `MATRIX_DEPLOYMENT_ROOM_ID` | Matrix room ID for notifications | `!abcdef:matrix.org` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | `your-cloudflare-token` |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID | `your-cloudflare-zone-id` |

## Maintaining Secrets

- Rotate secrets periodically according to your security policy
- Never share these secrets or commit them to your codebase
- If a secret is compromised, regenerate it immediately
EOL

echo -e "${GREEN}Secrets template created at .github/secrets_templates/github_actions_secrets.md${NC}"

# Create the workflow file
echo -e "${BLUE}Setting up GitHub Actions workflow files...${NC}"

# Check if workflow exists already - don't overwrite it
if [ -f ".github/workflows/deploy-to-dapp.yml" ]; then
  echo -e "${YELLOW}Workflow file already exists: .github/workflows/deploy-to-dapp.yml${NC}"
  echo -e "${YELLOW}Skipping workflow creation to avoid overwriting existing configuration.${NC}"
else
  # Create deploy-to-dapp.yml using node.js script
  node github-actions-generator.js
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Workflow file created successfully!${NC}"
  else
    echo -e "${RED}Failed to create workflow file. See error above.${NC}"
    exit 1
  fi
fi

# Create branch protection setup
echo -e "${BLUE}Setting up branch protection configuration...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Warning: Node.js is not installed. Skipping branch protection setup.${NC}"
  echo -e "${YELLOW}Please install Node.js to use the branch protection setup feature.${NC}"
else
  echo -e "${BLUE}Branch protection setup ready.${NC}"
  echo -e "${BLUE}To configure branch protection, run:${NC}"
  echo -e "${GREEN}node .github/branch-protection-setup.js${NC}"
fi

echo
echo -e "${GREEN}GitHub Actions setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Add the required secrets to your GitHub repository"
echo -e "2. Push changes to the repository to trigger the workflow"
echo -e "3. Configure branch protection rules to enforce code quality"
echo
echo -e "${YELLOW}See .github/secrets_templates/github_actions_secrets.md for required secrets${NC}"