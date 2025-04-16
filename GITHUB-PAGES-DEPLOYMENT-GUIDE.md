# Aetherion Wallet GitHub Pages Deployment Guide

This guide provides step-by-step instructions for setting up GitHub Pages deployment for the Aetherion Wallet. This is part of the hybrid deployment strategy that uses GitHub Pages for the frontend and CPanel for the backend API.

## Prerequisites

1. A GitHub account with access to the Aetherion repository
2. Admin access to the GitHub repository settings
3. A domain (atc.aifreedomtrust.com) with ability to manage DNS records
4. SSH access to the repository (for pushing changes)

## Setup Process

### 1. Repository Configuration

Ensure your repository contains:

- A `CNAME` file in the root with `atc.aifreedomtrust.com` (already added)
- The GitHub Actions workflow file in `.github/workflows/github-pages-deploy.yml` (already added)

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to Settings > Pages
3. Under "Source," select "GitHub Actions"
4. This will allow the deployment workflow to publish to GitHub Pages

### 3. Configure DNS

1. Log in to your domain registrar (where atc.aifreedomtrust.com is registered)
2. Create the following DNS records:

   | Type  | Name                  | Value                        | TTL    |
   |-------|----------------------|------------------------------|--------|
   | A     | atc                  | 185.199.108.153              | 1 hour |
   | A     | atc                  | 185.199.109.153              | 1 hour |
   | A     | atc                  | 185.199.110.153              | 1 hour |
   | A     | atc                  | 185.199.111.153              | 1 hour |

   *Note: These are GitHub's IP addresses for GitHub Pages*

3. If using Cloudflare, ensure SSL is set to "Full" or "Full (Strict)" mode

### 4. Trigger the Deployment

1. Push any commit to the `main` branch:
   ```bash
   git add .
   git commit -m "Trigger GitHub Pages deployment"
   git push origin main
   ```

2. This will automatically trigger the GitHub Actions workflow

### 5. Verify the Deployment

1. Go to your GitHub repository
2. Navigate to Actions tab
3. You should see the "Deploy to GitHub Pages" workflow running
4. Once completed, visit https://atc.aifreedomtrust.com to verify deployment

### 6. Troubleshooting

If your deployment isn't working:

1. Check if the GitHub Pages site is published:
   - Go to Settings > Pages
   - Verify if it shows "Your site is published at https://atc.aifreedomtrust.com"

2. Check DNS propagation:
   ```bash
   dig atc.aifreedomtrust.com +noall +answer
   ```

3. Verify SSL certificate:
   - Visit https://atc.aifreedomtrust.com and check the browser's security indicator
   - If there's a certificate issue, wait 24 hours as GitHub Pages SSL provisioning can take time

4. Check the GitHub Actions logs for any errors

### 7. SSL Configuration

GitHub Pages automatically provisions an SSL certificate for your custom domain. This process may take up to 24 hours after DNS propagation is complete.

1. Ensure "Enforce HTTPS" is enabled in your repository's Pages settings
2. If the option is grayed out, wait for DNS propagation to complete

## Backend Integration

Remember that this setup only deploys the frontend. For the complete solution:

1. Deploy the backend API to your CPanel hosting using the `deploy-to-aifreedomtrust.sh` script
2. Ensure the frontend is correctly configured to use the API endpoint at `https://atc.aifreedomtrust.com/api`

## Regular Maintenance

1. Each push to the `main` branch will automatically deploy changes to GitHub Pages
2. To update only the backend, use the CPanel deployment script without updating GitHub Pages
3. Monitor GitHub Actions for any deployment failures

## Security Considerations

1. GitHub Pages sites are always public, even with private repositories
2. Do not include sensitive information in the frontend code
3. All API calls should use HTTPS
4. Implement proper CORS policies on the backend to prevent unauthorized access

For additional support, contact the Aetherion development team.