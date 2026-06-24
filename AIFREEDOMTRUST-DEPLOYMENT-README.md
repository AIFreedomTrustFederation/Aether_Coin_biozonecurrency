# Aetherion Wallet Deployment to <www.atc.aifreedomtrust.com>

This guide explains how to deploy the Aetherion Wallet application to both IPFS/Filecoin (decentralized storage) and <www.atc.aifreedomtrust.com> (traditional hosting) using the automated deployment scripts.

## Overview

The comprehensive deployment scripts automate the entire process of deploying your Aetherion Wallet application to:

1. **IPFS/Filecoin via Web3.Storage** - For decentralized, censorship-resistant hosting
2. **Traditional web hosting at <www.atc.aifreedomtrust.com>** - For a custom domain with HTTPS

This dual deployment approach ensures your application is accessible through both decentralized and traditional web infrastructure.

## Prerequisites

Before running the deployment scripts, ensure you have:

1. **Web3.Storage Account**: Create an account at [Web3.Storage](https://web3.storage/) to get an API token.
2. **FractalCoin API Key**: Required for the Filecoin bridge integration (optional).
3. **Node.js and npm**: Make sure you have Node.js and npm installed.
4. **SSH Access**: SSH credentials for the server hosting <www.atc.aifreedomtrust.com>.
5. **Environment Setup**: The script will help you configure your `.env` file with the necessary credentials.

## Deployment Scripts

Three versions of the deployment script are provided to accommodate different operating systems:

1. **JavaScript (Node.js)**: `deploy-to-aifreedomtrust-full.js`
2. **PowerShell (Windows)**: `deploy-to-aifreedomtrust-full.ps1`
3. **Bash (Linux/Mac/WSL)**: `deploy-to-aifreedomtrust-full.sh`

Choose the script that matches your operating system.

## Running the Deployment Scripts

### For Windows Users (PowerShell)

Run the PowerShell script:

```powershell
.\deploy-to-aifreedomtrust-full.ps1
```

### For Linux/Mac/WSL Users (Bash)

Make the script executable and run it:

```bash
chmod +x deploy-to-aifreedomtrust-full.sh
./deploy-to-aifreedomtrust-full.sh
```

### For Any Platform (Node.js)

Run the JavaScript version:

```bash
node deploy-to-aifreedomtrust-full.js
```

## What the Scripts Do

The deployment scripts perform the following steps:

1. **Environment Validation**: Check for required tools and environment variables.
2. **Credential Collection**: Collect SSH credentials for the server.
3. **Dependency Installation**: Install all necessary npm packages.
4. **Application Building**: Clean, check, and build your application.
5. **Web3.Storage Deployment**: Upload your built application to IPFS/Filecoin via Web3.Storage.
6. **FractalCoin-Filecoin Bridge Setup**: Configure the bridge between FractalCoin and Filecoin (if enabled).
7. **Traditional Hosting Deployment**: Deploy to <www.atc.aifreedomtrust.com> via SSH.
8. **Nginx Configuration**: Set up Nginx to serve your application.
9. **HTTPS Setup**: Configure HTTPS with Let's Encrypt.
10. **Deployment Verification**: Verify the deployment and provide access URLs.

## Deployment Output

After successful deployment, you'll receive:

1. **IPFS CID**: The Content Identifier for your application on IPFS/Filecoin.
2. **Gateway URL**: A URL to access your application via an IPFS gateway.
3. **Bridge CID**: The identifier for your FractalCoin-Filecoin bridge (if configured).
4. **Traditional URL**: The URL to access your application at <www.atc.aifreedomtrust.com>.

## Accessing Your Deployed Application

Your application will be accessible via:

- **Traditional Web**: `https://www.atc.aifreedomtrust.com/`
- **IPFS Gateway**: `https://{CID}.ipfs.dweb.link/`

## Troubleshooting

If you encounter issues during deployment:

1. **Check the Log File**: The script creates a detailed log file in the `deployment-logs` directory.
2. **Verify Credentials**: Ensure your Web3.Storage token, FractalCoin API key, and SSH credentials are valid.
3. **Check Build Process**: Make sure your application builds successfully locally before deployment.
4. **Network Issues**: Verify your internet connection and firewall settings.
5. **Server Configuration**: Ensure the server has Node.js installed and the necessary permissions.

## Additional Resources

- [Web3.Storage Documentation](https://web3.storage/docs/)
- [Filecoin Documentation](https://docs.filecoin.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

If you need assistance with the deployment process, please contact the Aetherion support team or open an issue in the project repository.

Enjoy deploying your Aetherion Wallet application!
