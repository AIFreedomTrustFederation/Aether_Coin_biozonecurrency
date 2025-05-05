# Aetherion Ecosystem Deployment Guide

This guide provides instructions for deploying the Aetherion Ecosystem to atc.aifreedomtrust.com using cPanel.

## Overview

The Aetherion Ecosystem consists of multiple components:
- Brand Showcase (accessible at /brands)
- Aetherion Wallet (accessible at /wallet)
- Third Application (accessible at /app3)

We provide two scripts to assist with the deployment process:

1. `create-cpanel-package.js`: Creates a deployment package from your Replit environment
2. `deploy-to-cpanel.sh`: Deploys the package to your cPanel server

## Quick Start Guide

### Step 1: Create the Deployment Package

From your Replit environment, run:

```bash
node create-cpanel-package.js
```

This script will:
- Create a new directory called `deployment-package`
- Generate a tar.gz file containing your application
- Create example environment files and documentation

### Step 2: Download the Package

- In the Replit file explorer, locate the newly created package in the `deployment-package` directory
- Right-click on the file and select "Download"

### Step 3: Upload to cPanel

- Log in to your cPanel account at https://crispr.fah-dc3-ds.com/
- Navigate to the File Manager
- Upload the package to your home directory

### Step 4: Deploy Using the Terminal

- Open the Terminal in cPanel
- Extract the package:
  ```bash
  tar -xzf aetherion-ecosystem-[timestamp].tar.gz
  ```
- Make the deployment script executable:
  ```bash
  chmod +x deploy-to-cpanel.sh
  ```
- Run the deployment script:
  ```bash
  ./deploy-to-cpanel.sh
  ```
- Follow the prompts to complete the deployment

## Deployment Options

The deployment script supports two deployment methods:

### From a Package (Default)

```bash
./deploy-to-cpanel.sh --package
```

This method uses the package you've uploaded to cPanel.

### From GitHub

```bash
./deploy-to-cpanel.sh --github
```

This method pulls the code directly from your GitHub repository. You'll need to update the GitHub repository URL in the script before using this method.

## Environment Configuration

During deployment, you'll be prompted to enter any required API keys. Alternatively, you can edit the `deploy-to-cpanel.sh` script and add your API keys before running it:

```bash
# API Keys - Replace with your actual keys or leave empty
OPENAI_API_KEY="sk_..."
STRIPE_SECRET_KEY="sk_..."
```

## Verification

After deployment, verify that the application is running correctly by visiting:

- Main application: https://atc.aifreedomtrust.com/
- Brand Showcase: https://atc.aifreedomtrust.com/brands
- Aetherion Wallet: https://atc.aifreedomtrust.com/wallet
- Third Application: https://atc.aifreedomtrust.com/app3

## Troubleshooting

If you encounter issues during deployment:

1. Check the deployment logs that are displayed during the process
2. Connect to your server via SSH or cPanel Terminal
3. Check the application logs:
   ```bash
   pm2 logs aetherion-ecosystem
   ```
4. Restart the application:
   ```bash
   pm2 restart aetherion-ecosystem
   ```

## Additional Documentation

For more detailed information, see:
- [GitHub Actions Deployment Guide](./GITHUB-ACTIONS-DEPLOYMENT-GUIDE.md)
- [cPanel Deployment Guide](./CPANEL-DEPLOYMENT-GUIDE.md)
- [AIFREEDOMTRUST Domain Deployment](./AIFREEDOMTRUST-DOMAIN-DEPLOYMENT.md)