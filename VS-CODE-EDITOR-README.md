# VS Code Integration for Aetherion Wallet CI/CD

This document explains how to use Visual Studio Code with the Aetherion Wallet's enhanced CI/CD and deployment capabilities.

## Overview

The VS Code integration provides a seamless way to:

1. Generate GitHub Actions workflow files from the CI-CD-GUIDE.txt
2. Deploy the Aetherion Wallet directly to atc.aifreedomtrust.com (/wallet and /dapp endpoints)
3. Manage deployment credentials securely using FractalCoin/IPFS integration
4. Set up automated CI/CD pipelines for continuous deployment

## Installation

To set up the VS Code integration:

1. Ensure you have VS Code installed
2. Open the Aetherion Wallet project in VS Code
3. Open a terminal and run:

```bash
node vs-code-ci-cd-installer.js
```

This will:
- Create the necessary .vscode configuration files
- Set up tasks for workflow generation and deployment
- Create launch configurations for debugging
- Generate a deployment script specifically for VS Code

## Using the VS Code Integration

### Generating GitHub Actions Workflows

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Tasks: Run Task"
3. Select "Generate GitHub Actions Workflow"

This task will:
- Read the CI-CD-GUIDE.txt file
- Generate a comprehensive GitHub Actions workflow YAML
- Create the file at `.github/workflows/deploy.yml`
- Enhance the workflow with FractalCoin integration for secure credential storage
- Add quantum security verification steps

### Deploying Directly from VS Code

#### Option 1: Using VS Code Tasks

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Tasks: Run Task"
3. Select "Deploy to aifreedomtrust.com"

#### Option 2: Using the Deployment Script

1. Open a terminal in VS Code
2. Run:

```bash
./deploy-vscode.sh
```

#### Option 3: Using the Run and Debug Panel

1. Open the Run and Debug panel (`Ctrl+Shift+D` or `Cmd+Shift+D`)
2. Select "Deploy to aifreedomtrust.com" from the dropdown
3. Click the green play button

## Advanced Features

### Secure Credential Management

The deployment process uses FractalCoin's secure credential storage system to:
- Securely store deployment credentials
- Encrypt sensitive information
- Store backups in a decentralized manner
- Provide quantum-resistant protection for secrets

### Multi-Target Deployment

You can deploy to different targets:
- `/wallet` endpoint (default)
- `/dapp` endpoint
- Both endpoints simultaneously

To specify the target:
1. Open `deploy-to-aifreedomtrust.js`
2. Use the `--target` flag:
   - `node deploy-to-aifreedomtrust.js --target=wallet`
   - `node deploy-to-aifreedomtrust.js --target=dapp`
   - `node deploy-to-aifreedomtrust.js --target=both`

### GitHub Actions Integration

The generated workflow includes:
- Automated testing with quantum security checks
- Security scanning using GitHub CodeQL
- Dependency vulnerability scanning
- Backup and rollback mechanisms
- Deployment verification with health checks
- Slack notifications

## Troubleshooting

If you encounter issues:

1. Check the terminal output for error messages
2. Verify your SSH credentials are set up correctly
3. Use the `--debug` flag with deployment scripts for verbose output:
   ```
   node deploy-to-aifreedomtrust.js --debug
   ```
4. Check the server logs:
   ```
   ssh user@atc.aifreedomtrust.com "sudo journalctl -u aetherion"
   ```

## Required Secrets

The following secrets are needed for deployment:

- `DEPLOY_SSH_USER`: SSH username for atc.aifreedomtrust.com
- `DEPLOY_SSH_HOST`: Host address (atc.aifreedomtrust.com)
- `DEPLOY_SSH_PORT`: SSH port (usually 22)
- `SSH_PRIVATE_KEY`: Private SSH key for authentication
- `DATABASE_URL`: PostgreSQL database connection string
- `SESSION_SECRET`: Secret for session encryption
- `FRACTALCOIN_SECURE_KEY`: Key for FractalCoin secure credential storage
- `SLACK_WEBHOOK_URL`: Webhook URL for Slack notifications (optional)

## Further Reading

For more detailed information, refer to:
- `DEPLOYMENT.md` - General deployment documentation
- `CI-CD-GUIDE.txt` - GitHub Actions setup instructions
- `deploy-to-aifreedomtrust.js` - Enhanced deployment script documentation