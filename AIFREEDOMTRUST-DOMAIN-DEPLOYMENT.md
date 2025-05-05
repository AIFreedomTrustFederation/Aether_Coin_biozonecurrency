# Aetherion Ecosystem Deployment to atc.aifreedomtrust.com

This guide provides specific instructions for deploying the Aetherion Ecosystem to atc.aifreedomtrust.com.

## Overview

The Aetherion Ecosystem will be deployed to atc.aifreedomtrust.com, a subdomain of aifreedomtrust.com. The deployment includes:

- Combined server routing traffic to multiple Vite instances
- Brand Showcase application (/brands)
- Aetherion Wallet application (/wallet)
- Third application (/app3)
- WebSocket server for real-time communication

## Prerequisites

1. Access to aifreedomtrust.com's cPanel
2. GitHub repository for the Aetherion Ecosystem
3. Node.js 14+ on the hosting server
4. GitHub Personal Access Token for automated deployments

## Deployment Process

The deployment will be handled by:

1. GitHub Actions for CI/CD pipeline
2. cPanel for hosting and domain configuration
3. PM2 for process management on the server

## Step 1: DNS Configuration

Configure DNS records for atc.aifreedomtrust.com:

1. Log in to your domain registrar or DNS management panel
2. Create an A record:
   - Name: atc
   - Type: A
   - Value: [Your server IP address]
   - TTL: 3600 (or default)

## Step 2: cPanel Setup

1. Log in to cPanel for aifreedomtrust.com
2. Create a subdomain:
   - Subdomain: atc
   - Document Root: /public_html/atc
3. Set up SSL certificate:
   - Navigate to SSL/TLS section
   - Request a Let's Encrypt certificate for atc.aifreedomtrust.com

## Step 3: Repository Setup

If your code is not already in a GitHub repository:

1. Create a new repository on GitHub
2. Initialize Git in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/aetherion-ecosystem.git
   git push -u origin main
   ```

3. Set up GitHub secrets:
   - Go to repository Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `CPANEL_SERVER`: aifreedomtrust.com
     - `CPANEL_USERNAME`: [Your cPanel username]
     - `CPANEL_PASSWORD`: [Your cPanel password]
     - `CPANEL_PATH`: /public_html/atc/
     - `GITHUB_TOKEN`: [Your GitHub token]

## Step 4: Configure GitHub Actions

1. Run the GitHub Actions generator script:
   ```bash
   node github-actions-generator.js
   ```

2. Commit and push the generated workflow file:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```

## Step 5: First Deployment

The first deployment will occur automatically after pushing the workflow file to GitHub. To monitor:

1. Go to the Actions tab in your GitHub repository
2. Watch the deployment workflow execute
3. Upon completion, check https://atc.aifreedomtrust.com

## Step 6: Verify Deployment

After deployment, verify:

1. Main site loads correctly at https://atc.aifreedomtrust.com
2. Brand Showcase works at https://atc.aifreedomtrust.com/brands
3. Aetherion Wallet works at https://atc.aifreedomtrust.com/wallet
4. Third application works at https://atc.aifreedomtrust.com/app3
5. API endpoints respond correctly

## Step 7: Configure Environment Variables

Set up environment variables on the server:

1. Create/edit `.env` file in the application root:
   ```
   NODE_ENV=production
   PORT=3000
   PUBLIC_URL=https://atc.aifreedomtrust.com
   ```

2. If using OpenAI or Stripe, add their API keys:
   ```
   OPENAI_API_KEY=sk-...
   STRIPE_SECRET_KEY=sk_...
   ```

## Ongoing Maintenance

### Updates and Deployments

For future updates:

1. Make changes to your local code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
3. GitHub Actions will automatically deploy the changes

### Monitoring

1. SSH into the server: `ssh username@aifreedomtrust.com`
2. Check application status: `pm2 status`
3. View logs: `pm2 logs aetherion-ecosystem`
4. Monitor performance: `pm2 monit`

### Rollbacks

If you need to roll back to a previous version:

1. In GitHub, navigate to Actions > Completed workflows
2. Find the successful workflow for the version you want to restore
3. Click "Re-run workflow"

## Domain Structure

After deployment, your domain structure will be:

- Main application: https://atc.aifreedomtrust.com/
- Brand Showcase: https://atc.aifreedomtrust.com/brands
- Aetherion Wallet: https://atc.aifreedomtrust.com/wallet
- Third Application: https://atc.aifreedomtrust.com/app3
- Status page: https://atc.aifreedomtrust.com/status
- API health endpoint: https://atc.aifreedomtrust.com/api/health
- WebSocket endpoint: wss://atc.aifreedomtrust.com/ws

## Custom Subdomain Setup

If you want to set up additional custom subdomains (e.g., biozoe.aifreedomtrust.com):

1. Add DNS A record for the new subdomain pointing to the same server IP
2. Configure Nginx/Apache to route traffic to the correct application
3. Add routing logic in the combined-server.js file to handle the new subdomain

## Troubleshooting

### Common Issues

1. **Application not accessible:**
   - Check if Node.js server is running: `pm2 status`
   - Verify Nginx/Apache configuration
   - Check firewall settings

2. **Deployment fails:**
   - Check GitHub Actions logs for errors
   - Verify GitHub secrets are correctly set
   - Ensure server has sufficient disk space

3. **SSL certificate issues:**
   - Renew Let's Encrypt certificate: `certbot renew`
   - Check certificate paths in Nginx/Apache configuration

## Contact and Support

For issues related to deployment, contact the AI Freedom Trust team at:

- Email: support@aifreedomtrust.com
- GitHub: Open an issue in the repository

## Reference Documentation

- [GitHub Actions Deployment Guide](./GITHUB-ACTIONS-DEPLOYMENT-GUIDE.md)
- [cPanel Deployment Guide](./CPANEL-DEPLOYMENT-GUIDE.md)