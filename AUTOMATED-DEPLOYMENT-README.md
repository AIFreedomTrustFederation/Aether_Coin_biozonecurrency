# Automated Deployment for Aetherion SaaS App

This guide explains how to use the deployment scripts to fully deploy your Aetherion SaaS application to atc.aifreedomtrust.com.

## Overview

The automated deployment scripts handle the entire deployment process from start to finish:

1. Validates environment and prerequisites
2. Collects or uses stored credentials
3. Builds all components (client, server, api-gateway, quantum-validator)
4. Deploys to Web3.Storage (IPFS/Filecoin) if configured
5. Sets up FractalCoin-Filecoin bridge if enabled
6. Deploys to traditional hosting at atc.aifreedomtrust.com
7. Configures Nginx, DNS and HTTPS
8. Verifies all deployments
9. Sets up monitoring and sends notifications

## Prerequisites

Before running the deployment scripts, ensure you have:

- Node.js 16 or later installed
- SSH access to your server at atc.aifreedomtrust.com
- SSH private key for authentication
- Proper DNS configuration for atc.aifreedomtrust.com
- Server with Nginx and Certbot installed

## Deployment Options

### Option 1: Simplified Deployment (Recommended)

We've created simplified deployment scripts that use the existing `deploy-to-aifreedomtrust-full.js` script:

#### For Windows (Advanced Deployment)

```powershell
# Run the simplified PowerShell script
.\deploy-simple.ps1
```

#### For Linux/macOS/WSL

```bash
# Make the script executable
chmod +x deploy-simple.sh

# Run the script
./deploy-simple.sh
```

### Option 2: Advanced Deployment

For more control over the deployment process, you can use the comprehensive deployment scripts:

#### For Windows

```powershell
# Ensure execution policy allows running scripts
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run the script
.\deploy-all-in-one.ps1
```

## What to Expect

When you run the script:

1. You'll be prompted for deployment credentials (SSH username, host, port, etc.)
2. The script will build all components of the application
3. It will package and upload the application to your server
4. It will configure the server, Nginx, and SSL certificates
5. It will verify the deployment and send notifications
6. Upon completion, your application will be available at <https://atc.aifreedomtrust.com/dapp>

## Credentials Storage

The script offers to save your deployment credentials for future use. These are stored in:

- Bash script: `.deploy-credentials` file
- PowerShell script: `.deploy-credentials.json` file

## Logs

Detailed logs of the deployment process are saved in the `deployment-logs` directory with timestamps.

## Troubleshooting

If the deployment fails, check:

1. The deployment logs in the `deployment-logs` directory
2. Server logs via SSH: `sudo journalctl -u aetherion --no-pager -n 100`
3. Nginx configuration: `sudo nginx -t`
4. SSL certificate status: `sudo certbot certificates`

## Manual Verification

After deployment, you can manually verify:

1. Visit <https://atc.aifreedomtrust.com/dapp> in your browser
2. Check if all features are working correctly
3. Verify SSL certificate is valid (check the lock icon in your browser)

## Support

If you encounter issues with the deployment scripts, please contact the development team or refer to the detailed deployment documentation in `DEPLOYMENT-AIFREEDOMTRUST.md`.
