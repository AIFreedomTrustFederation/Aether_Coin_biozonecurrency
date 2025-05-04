# GitHub Pages Deployment Guide for AI Freedom Trust

This guide provides comprehensive instructions for deploying the AI Freedom Trust ecosystem to GitHub Pages with custom domain integration.

## Organization Repository Setup

The main organization website should be set up as follows:

1. Create a repository named `AIFreedomTrustFederation.github.io`
2. This repository will automatically be published to `https://aifreedomtrustfederation.github.io/`

## Domain Configuration

### Custom Domain Setup

1. In your GitHub repository, go to Settings > Pages
2. Under "Custom domain", enter your domain (e.g., `aifreedomtrust.com` or `atc.aifreedomtrust.com`)
3. Check "Enforce HTTPS" (recommended)
4. Save the settings

### DNS Configuration

#### Using the Automated Script

We've created a DNS automation script to simplify this process:

```bash
# Make the script executable
chmod +x github-pages-dns-setup.sh

# Run the script
./github-pages-dns-setup.sh
```

The script will:
- Prompt for cPanel credentials
- Allow you to select which subdomain to configure
- Automatically set up the required DNS records
- Verify the DNS configuration

#### Manual DNS Configuration

If you prefer to manually configure DNS:

1. Log into your cPanel account
2. Navigate to the DNS Zone Editor
3. For organization site (aifreedomtrust.com):
   - Add a CNAME record with:
     - Name: `@` or empty (for the root domain)
     - Value: `aifreedomtrustfederation.github.io.` (note the trailing dot)
   - Add A records with:
     - Name: `@` or empty
     - Values: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

4. For subdomains (e.g., atc.aifreedomtrust.com):
   - Add a CNAME record with:
     - Name: `atc`
     - Value: `aifreedomtrustfederation.github.io.` (note the trailing dot)

## CNAME File

The CNAME file tells GitHub Pages which domain to use. Create a file named `CNAME` in the root of your repository with your domain:

```
atc.aifreedomtrust.com
```

## GitHub Actions Workflow

We've set up a GitHub Actions workflow that automatically deploys your site to GitHub Pages whenever you push changes to the main branch:

```yaml
# .github/workflows/ghpages-deploy.yml
name: GitHub Pages Deployment

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # ... deployment steps
```

## Project Repository Setup

For project-specific sites (e.g., Aether_Coin_biozonecurrency):

1. Go to the repository Settings > Pages
2. Set the Source to "GitHub Actions"
3. Add a workflow file similar to the one above
4. Create a CNAME file if using a custom domain

## Brand Subdomains

For each brand in your ecosystem, you can set up a separate subdomain:

1. Create the subdomain DNS records as described above
2. In the project repository, add a CNAME file with the subdomain
3. Configure GitHub Pages for the repository

## Verifying Deployment

After setting up GitHub Pages, verify:

1. Visit your custom domain (e.g., `https://atc.aifreedomtrust.com`)
2. Check that HTTPS is working correctly
3. Verify that all assets (images, CSS, JavaScript) load properly
4. Test navigation between pages

## Troubleshooting

### DNS Issues

- DNS changes can take 24-48 hours to propagate
- Verify your DNS records with `dig`:
  ```bash
  dig atc.aifreedomtrust.com
  ```

### GitHub Pages Issues

- Check the GitHub Pages settings in your repository
- Ensure your CNAME file has the correct domain
- Verify the GitHub Actions workflow is running successfully

### HTTPS Issues

- Ensure "Enforce HTTPS" is enabled in GitHub Pages settings
- Wait for GitHub to provision your SSL certificate (can take up to 24 hours)

## Best Practices

1. **File Organization**: Keep your site files well-organized for easier maintenance
2. **Minimalist Approach**: For GitHub Pages, keep the deployment minimal and focused
3. **Custom Domain Renewal**: Ensure your domain registration is up to date
4. **Regular Testing**: Periodically test your site to ensure it's working correctly

---

For additional help, refer to [GitHub's official documentation on GitHub Pages](https://docs.github.com/en/pages).