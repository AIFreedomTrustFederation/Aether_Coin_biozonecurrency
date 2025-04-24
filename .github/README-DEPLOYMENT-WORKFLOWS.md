# Aetherion Website Deployment Workflows

This document explains the GitHub Actions deployment workflows for the Aetherion project.

## Active Deployment Workflow

### Clean Branch Deployment to ATC.aifreedomtrust.com

The primary production deployment workflow is now the "**Deploy Clean Branch to CPanel**" workflow. This workflow:

- Uses the `clean_fixes_20250410_163230` branch as the deployment source
- Deploys to `atc.aifreedomtrust.com/wallet`
- Includes the CodeStar feature (renamed from Codester)
- Automatically triggers on pushes to the `clean_fixes_20250410_163230` branch
- Can be manually triggered via the GitHub Actions UI

**Configuration File**: `.github/workflows/deploy-clean-branch-to-cpanel.yml`

## Deprecated/Staging Workflows

### Harmony Boost Deployment (Staging Only)

The "**Deploy Harmony to CPanel**" workflow has been modified to:

- Deploy to the staging environment only (`atc.aifreedomtrust.com/wallet-staging`)
- Not trigger automatically on pushes to any branch
- Be available for manual triggering via the GitHub Actions UI for testing purposes

**Configuration File**: `.github/workflows/deploy-harmony-to-cpanel.yml`

## Required Secrets

To use these workflows, you need the following secrets configured in your GitHub repository:

- `CPANEL_FTP_SERVER`: The cPanel FTP server address
- `CPANEL_FTP_USERNAME`: cPanel FTP username
- `CPANEL_FTP_PASSWORD`: cPanel FTP password
- `CPANEL_DB_USER`: Database username
- `CPANEL_DB_PASS`: Database password
- `CPANEL_DB_NAME`: Database name
- `JWT_SECRET`: Secret for JWT token generation
- `SESSION_SECRET`: Secret for session management

## Troubleshooting DNS Issues

If you encounter DNS issues with `atc.aifreedomtrust.com` (showing DNS_PROBE_FINISHED_NXDOMAIN errors):

1. Verify that the domain is properly registered and active
2. Check the DNS configuration in your domain registrar
3. Ensure there's an A record for "atc.aifreedomtrust.com" pointing to your server's IP
4. Verify your web server configuration includes this domain
5. Allow time for DNS propagation (up to 48 hours)

## Switching Between Branches

If you need to switch back to the Harmony Boost deployment, you can:

1. Modify `.github/workflows/deploy-harmony-to-cpanel.yml` to:
   - Re-enable the push trigger for a branch
   - Change the server directory back to `./public_html/wallet/`

2. Manually trigger a workflow run via the GitHub Actions UI

## Validating Deployment

After deployment:
- Visit `https://atc.aifreedomtrust.com/wallet` to see the main site
- Visit `https://atc.aifreedomtrust.com/wallet/codestar` to confirm the CodeStar page is working

## Important Notes

1. Only one branch should be configured to deploy to the production website folder (`./public_html/wallet/`) at a time.
2. Use staging environments for testing changes before deploying to production.
3. The clean branch deployment is the primary workflow and should be used for all production updates.