# Aetherion Wallet GitHub Actions Deployment Guide

This comprehensive guide explains how to deploy the Aetherion Wallet application to `atc.aifreedomtrust.com/dapp` using GitHub Actions for continuous deployment.

## Overview

The deployment process uses GitHub Actions to automate the following steps:
1. Build the application
2. Package and deploy it to your target server
3. Configure the server to serve the application at `/dapp` path
4. Set up automatic health checks and rollbacks

## Prerequisites

Before you begin, make sure you have:

- A GitHub account with access to create repositories
- SSH access to the target server (atc.aifreedomtrust.com)
- A GitHub personal access token with `repo` scope
- PostgreSQL database setup

## Step 1: Create a GitHub Repository

If you haven't already created a GitHub repository for your project:

1. Sign in to GitHub
2. Click the "+" icon in the top right and select "New repository"
3. Fill in the details, make it public or private as needed
4. Initialize with a README.md
5. Click "Create repository"

## Step 2: Push Your Code to GitHub

Push your Aetherion Wallet code to the GitHub repository:

```bash
# Initialize git if not already done
git init

# Add your GitHub repository as the remote origin
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git

# Add all files
git add .

# Commit the files
git commit -m "Initial commit of Aetherion Wallet"

# Push to GitHub
git push -u origin main
```

## Step 3: Set Up GitHub Actions Secrets

You'll need to set up several secrets for the GitHub Actions workflow to access your server:

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `SSH_PRIVATE_KEY` | The SSH private key to access your server |
| `DEPLOY_SSH_HOST` | The hostname (atc.aifreedomtrust.com) |
| `DEPLOY_SSH_USER` | The SSH username for accessing the server |
| `DEPLOY_SSH_PORT` | The SSH port (usually 22) |
| `DATABASE_URL` | PostgreSQL database connection string |
| `SESSION_SECRET` | A secure random string for session encryption |
| `GITHUB_TOKEN` | GitHub personal access token for deployment verification |

To generate a secure random string for `SESSION_SECRET`, you can use:
```bash
openssl rand -hex 32
```

## Step 4: Ensure Workflow File is in Place

The GitHub Actions workflow file should be located at `.github/workflows/deploy-to-dapp.yml`. Make sure this file exists in your repository.

If you need to create or update it, you can use the automated setup script:

```bash
./setup-github-actions.sh
```

Alternatively, you can manually create the directory and file:

```bash
mkdir -p .github/workflows
# Copy the deploy-to-dapp.yml file we created to this directory
```

## Step 5: Configure Your Server

Before the first deployment, ensure your server is properly configured:

1. Install Node.js (version 18+)
2. Install PostgreSQL
3. Install Nginx
4. Configure Nginx to serve your application
5. Ensure your server has sudo access for the deployment user

## Step 6: Trigger Your First Deployment

You can trigger a deployment in two ways:

### Option 1: Push to main branch

Simply push changes to the main branch:

```bash
git add .
git commit -m "Update for deployment"
git push origin main
```

### Option 2: Manual trigger

1. Go to your GitHub repository
2. Click on "Actions"
3. Select "Deploy to AI Freedom Trust DApp" workflow
4. Click "Run workflow"
5. Choose the main branch 
6. Click "Run workflow"

## Step 7: Monitor Deployment Status

You can monitor the deployment status in several ways:

### Using the GitHub Actions tab

1. Go to your GitHub repository
2. Click on "Actions"
3. Check the status of the most recent workflow run

### Using the status check script

Run the deployment status check script:

```bash
# Make sure GITHUB_TOKEN is set in .env or as environment variable
node check-deploy-status.js
```

### Checking the deployed application

Once deployment is complete, visit:
https://atc.aifreedomtrust.com/dapp

To check the health status:
https://atc.aifreedomtrust.com/dapp/health

## Troubleshooting

If your deployment fails:

### Check GitHub Actions logs

1. Go to your GitHub repository
2. Click on "Actions"
3. Find the failed workflow run
4. Examine the logs for error messages

### Check server logs

SSH into your server and check:

```bash
# Check the systemd service status
sudo systemctl status aetherion.service

# Check the service logs
sudo journalctl -u aetherion.service

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Common issues and solutions

1. **SSH connection fails**:
   - Verify your SSH key is correct
   - Ensure the server IP/hostname is correct
   - Check that the user has appropriate permissions

2. **Nginx configuration fails**:
   - Run `sudo nginx -t` on the server to test configuration
   - Ensure no other services are using port 80/443

3. **Application service fails to start**:
   - Check that Node.js is installed correctly
   - Verify all environment variables are set
   - Check for errors in the application logs

## Automated Recovery

The workflow includes automatic rollback in case of deployment failure. If a deployment fails, the workflow will:

1. Restore the previous version from the backup
2. Restart the application service
3. Log the rollback in the Actions workflow

## Best Practices

1. **Test locally before deployment**: Always test your changes locally before pushing to GitHub
2. **Monitor logs**: Regularly check the application logs for any issues
3. **Secure your secrets**: Rotate your GitHub secrets periodically
4. **Database backups**: Regularly back up your PostgreSQL database
5. **Version control**: Tag important releases with version numbers

## Additional Resources

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Nginx documentation](https://docs.nginx.com/)
- [Systemd service management](https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units)

By following this guide, you should be able to successfully deploy your Aetherion Wallet application to `atc.aifreedomtrust.com/dapp` using GitHub Actions for continuous deployment.