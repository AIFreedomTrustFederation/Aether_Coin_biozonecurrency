# FractalCoin to Filecoin Deployment Guide

This guide explains how to deploy your FractalCoin project to Filecoin using the automated deployment scripts.

## Overview

The deployment scripts automate the process of deploying your FractalCoin project to Filecoin via Web3.Storage. This eliminates the need for a local server and leverages decentralized storage for your application.

## Prerequisites

Before running the deployment scripts, ensure you have:

1. **Web3.Storage Account**: Create an account at [Web3.Storage](https://web3.storage/) to get an API token.
2. **FractalCoin API Key**: Required for the Filecoin bridge integration.
3. **Node.js and npm**: Make sure you have Node.js and npm installed.
4. **Environment Setup**: Configure your `.env` file with the necessary credentials.

## Setting Up Your Environment

Create a `.env` file in your project root with the following variables:

```env
# Required for Web3.Storage deployment
WEB3_STORAGE_TOKEN=your_web3_storage_token

# FractalCoin-Filecoin Bridge Configuration
SETUP_FILECOIN_INTEGRATION=true
FRACTALCOIN_API_KEY=your_fractalcoin_api_key
FRACTALCOIN_API_ENDPOINT=https://api.fractalcoin.network/v1
FRACTALCOIN_FILECOIN_ALLOCATION=20

# Optional: ENS Configuration (if you want to use an ENS domain)
ENS_PRIVATE_KEY=your_ethereum_private_key_for_ens_domain
ENS_DOMAIN=your-domain.eth
```

## Running the Deployment Scripts

### For Windows Users (PowerShell)

Run the PowerShell script:

```powershell
.\deploy-fractalcoin-to-filecoin.ps1
```

### For Linux/Mac/WSL Users (Bash)

Make the script executable and run it:

```bash
chmod +x deploy-fractalcoin-to-filecoin.sh
./deploy-fractalcoin-to-filecoin.sh
```

## What the Scripts Do

The deployment scripts perform the following steps:

1. **Environment Validation**: Check for required tools and environment variables.
2. **Dependency Installation**: Install all necessary npm packages.
3. **Application Building**: Clean, check, and build your application.
4. **Web3.Storage Deployment**: Upload your built application to IPFS/Filecoin via Web3.Storage.
5. **FractalCoin-Filecoin Bridge Setup**: Configure the bridge between FractalCoin and Filecoin.
6. **ENS Domain Configuration**: Update ENS records if configured.
7. **Deployment Verification**: Verify the deployment and provide access URLs.

## Deployment Output

After successful deployment, you'll receive:

1. **IPFS CID**: The Content Identifier for your application on IPFS/Filecoin.
2. **Gateway URL**: A URL to access your application via an IPFS gateway.
3. **Bridge CID**: The identifier for your FractalCoin-Filecoin bridge (if configured).
4. **ENS URL**: A URL to access your application via ENS (if configured).

## Accessing Your Deployed Application

Your application will be accessible via:

- **IPFS Gateway**: `https://{CID}.ipfs.dweb.link/`
- **ENS Domain**: `https://{your-domain}.eth.link/` (if configured)

## Troubleshooting

If you encounter issues during deployment:

1. **Check the Log File**: The script creates a detailed log file with the format `fractalcoin-deployment-YYYYMMDD-HHMMSS.log`.
2. **Verify Credentials**: Ensure your Web3.Storage token and FractalCoin API key are valid.
3. **Check Build Process**: Make sure your application builds successfully locally before deployment.
4. **Network Issues**: Verify your internet connection and firewall settings.

## Additional Resources

- [Web3.Storage Documentation](https://web3.storage/docs/)
- [Filecoin Documentation](https://docs.filecoin.io/)
- [ENS Documentation](https://docs.ens.domains/)

## Support

If you need assistance with the deployment process, please contact the FractalCoin support team or open an issue in the project repository.

Enjoy deploying your FractalCoin project to Filecoin!
