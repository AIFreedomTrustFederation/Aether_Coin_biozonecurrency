# GitHub Deployment Guide for atc.aifreedomtrust.com/dapp

This guide explains how to deploy the Aetherion wallet application to the AI Freedom Trust domain at `atc.aifreedomtrust.com/dapp` using GitHub Actions.

## Overview

The deployment process uses GitHub Actions to automatically:
1. Build the application
2. Package the necessary files
3. Deploy to the target server
4. Configure Nginx to serve the application at the /dapp path
5. Set up and manage the systemd service

## Setup Requirements

Before you can deploy, you need to set up the following GitHub secrets:

1. `SSH_PRIVATE_KEY`: The SSH private key to connect to your server
2. `DEPLOY_SSH_HOST`: The host domain (atc.aifreedomtrust.com)
3. `DEPLOY_SSH_USER`: SSH username for the server
4. `DEPLOY_SSH_PORT`: SSH port (usually 22)
5. `DATABASE_URL`: PostgreSQL database connection string
6. `SESSION_SECRET`: Secret for session cookies
7. `GITHUB_TOKEN`: GitHub personal access token

## Adding GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each of the required secrets mentioned above

## Deployment Methods

### Automatic Deployment

The workflow is configured to automatically deploy when code is pushed to the `main` branch.

### Manual Deployment

You can also trigger a deployment manually:

1. Go to your GitHub repository
2. Click on "Actions"
3. Select "Deploy to AI Freedom Trust DApp" workflow
4. Click "Run workflow"
5. Select the main branch and click "Run workflow"

## Server Configuration

The deployment workflow will:

1. Set up an Nginx configuration for the /dapp path
2. Create a systemd service for the application if it doesn't exist
3. Ensure the application starts on system boot
4. Configure environment variables for the DApp deployment target

## Verifying Deployment

After deployment, the workflow will:

1. Check if the application service is running
2. Perform a basic health check
3. Log the deployment status

You can manually verify by visiting: `https://atc.aifreedomtrust.com/dapp`

## Rollback Procedure

If deployment fails, the workflow will:

1. Automatically restore from the backup taken before deployment
2. Restart the application service

## Additional Notes

- The deployment creates backups before making changes
- All server operations require sudo access for the SSH user
- The application runs as a systemd service named "aetherion"

## Troubleshooting

If you encounter issues:

1. Check the GitHub Actions workflow logs
2. Verify server logs with: `sudo journalctl -u aetherion.service`
3. Ensure Nginx configuration is valid: `sudo nginx -t`
4. Restart the service manually: `sudo systemctl restart aetherion.service`