# GitHub Actions Deployment Guide for Aetherion Ecosystem

This guide provides step-by-step instructions for deploying the Aetherion Ecosystem to atc.aifreedomtrust.com using GitHub Actions and cPanel.

## Overview

The deployment process uses GitHub Actions for continuous integration and deployment (CI/CD). When you push changes to the main branch of your GitHub repository, the following actions are automatically performed:

1. The code is built and tested
2. A deployment package is created
3. The package is uploaded to your cPanel hosting
4. The application is configured and started

## Prerequisites

Before setting up the deployment pipeline, ensure you have:

1. A GitHub repository containing the Aetherion Ecosystem code
2. cPanel access to aifreedomtrust.com with the ability to create subdomains
3. Node.js installed on the cPanel server (contact your hosting provider if needed)

## Setup Instructions

### 1. Configure GitHub Repository

First, ensure your code is in a GitHub repository:

```bash
# Initialize Git repository (if not already done)
git init

# Add GitHub remote
git remote add origin https://github.com/yourusername/aetherion-ecosystem.git

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for deployment"

# Push to GitHub
git push -u origin main
```

### 2. Generate GitHub Actions Workflow

We've created a script that generates the necessary GitHub Actions workflow file:

```bash
# Run the workflow generator script
node github-actions-generator.js
```

This will create a `.github/workflows/deploy.yml` file in your project.

### 3. Configure GitHub Secrets

In your GitHub repository, navigate to:
Settings > Secrets and variables > Actions

Add the following secrets:

- `CPANEL_SERVER`: Your cPanel server hostname (e.g., aifreedomtrust.com)
- `CPANEL_USERNAME`: Your cPanel username
- `CPANEL_PASSWORD`: Your cPanel password
- `CPANEL_PATH`: Path to deploy to on cPanel (e.g., /public_html/atc/)
- `SLACK_WEBHOOK_URL`: (Optional) Slack webhook URL for notifications

### 4. Push the Workflow File to GitHub

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### 5. Configure cPanel

In your cPanel account:

1. Create the subdomain `atc.aifreedomtrust.com` if it doesn't exist
2. Create a directory structure that matches your deployment path
3. Ensure Node.js is available (minimum version 14)

### 6. Trigger Deployment

The initial deployment will be triggered automatically when you push the workflow file. For subsequent deployments:

- Pushing to the main branch will trigger automatic deployment
- You can also manually trigger deployment from the "Actions" tab in your GitHub repository

### 7. Verify Deployment

After the workflow completes:

1. Check the Actions tab in your GitHub repository for logs
2. Visit https://atc.aifreedomtrust.com to verify the application is running
3. Test the main routes:
   - Brand Showcase: https://atc.aifreedomtrust.com/brands
   - Aetherion Wallet: https://atc.aifreedomtrust.com/wallet
   - Third Application: https://atc.aifreedomtrust.com/app3

## Deployment Scripts

We've created two deployment scripts to assist with the process:

1. `deploy-to-aifreedomtrust.js`: Main deployment script used by GitHub Actions
2. `github-actions-generator.js`: Generates the GitHub Actions workflow file

## Troubleshooting

If you encounter deployment issues:

1. Check the GitHub Actions logs for specific error messages
2. Verify your cPanel credentials are correct
3. Ensure Node.js is available on the server
4. Check the server logs in cPanel for any runtime errors
5. Verify file permissions on the server (files should be readable and executables should be executable)

## Manual Deployment

If you need to deploy manually:

```bash
# Run the deployment script
node deploy-to-aifreedomtrust.js
```

Follow the prompts to provide credentials and complete the deployment.

## Support

If you encounter persistent issues or need assistance with the deployment process, please contact the AI Freedom Trust team.