# Aetherion Wallet Deployment Guide

This guide provides detailed instructions for deploying Aetherion Wallet to various environments using different deployment methods.

## Table of Contents
- [Environment Setup](#environment-setup)
- [Deployment Methods](#deployment-methods)
  - [GitHub Actions Deployment](#github-actions-deployment)
  - [Manual Deployment](#manual-deployment)
- [Database Management](#database-management)
- [Security Considerations](#security-considerations)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Environment Setup

Before deployment, you need to set up the appropriate environment configuration:

1. Choose the target environment (development, staging, or production)
2. Ensure the corresponding `.env.<environment>` file exists and is properly configured
3. Create the final environment file with:

```bash
./create-env-file.sh <environment>
```

### Required Environment Variables

The following variables should be defined in your environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment name | `production` |
| `PORT` | Application port | `3000` |
| `HOST` | Host to bind to | `0.0.0.0` |
| `BASE_URL` | Base URL for the application | `https://atc.aifreedomtrust.com` |
| `DEPLOY_PATH` | Path for the application | `/dapp` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/dbname` |
| `SESSION_SECRET` | Secret for session encryption | `your-secure-session-secret` |
| `GITHUB_TOKEN` | GitHub personal access token | `ghp_xxxxxxxxxxxx` |

## Deployment Methods

### GitHub Actions Deployment

The recommended way to deploy Aetherion Wallet is through GitHub Actions, which provides automated CI/CD pipelines.

#### Setup GitHub Actions

1. Set up GitHub Actions for your repository:

```bash
./setup-github-actions.sh
```

2. Add the required secrets to your GitHub repository:

   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Add all the required secrets listed in `.github/secrets_templates/github_actions_secrets.md`

3. Push changes to trigger the workflow:

```bash
git push origin main
```

#### Manual Workflow Trigger

You can also manually trigger the workflow from GitHub:

1. Go to your repository on GitHub
2. Navigate to Actions → "Deploy to AI Freedom Trust DApp"
3. Click "Run workflow" 
4. Select the environment (production or staging)
5. Click "Run workflow"

### Manual Deployment

For manual deployment to a server:

1. Build the application:

```bash
npm run build
```

2. Create a deployment package:

```bash
tar -czf aetherion-deploy.tar.gz dist server-redirect.js package.json .env
```

3. Transfer the package to the server:

```bash
scp aetherion-deploy.tar.gz user@server:~/
```

4. SSH into the server and deploy:

```bash
ssh user@server

# Extract the package
mkdir -p ~/aetherion
tar -xzf aetherion-deploy.tar.gz -C ~/aetherion

# Install dependencies
cd ~/aetherion
npm install --production

# Start or restart the service
sudo systemctl restart aetherion.service
```

## Database Management

Aetherion Wallet uses PostgreSQL for data storage. The following scripts help manage the database:

### Database Backup

Create a backup of the database:

```bash
./db-backup.sh
```

This will create a timestamped backup file in the `./database_backups` directory.

### Database Restore

Restore the database from a backup:

```bash
./db-restore.sh ./database_backups/aetherion_20250401_120000.sql
```

### Database Migration

Safely apply schema changes:

```bash
./db-migrate.sh
```

This script:
1. Creates a backup before migration
2. Generates and applies the migration
3. Verifies database integrity after migration
4. Provides rollback instructions if needed

## Security Considerations

### Secret Management

Secure management of secrets is critical:

1. Store secrets in environment files (`.env.<environment>`)
2. Add sensitive files to `.gitignore`
3. Use GitHub Secrets for CI/CD variables
4. Rotate secrets regularly using `./rotate-secrets.sh <environment>`

### Branch Protection

Set up branch protection for your repository:

```bash
node .github/branch-protection-setup.js
```

This configures:
- Required approvals for pull requests
- Required status checks to pass
- Signed commit requirement
- Protection against force pushes

## Monitoring

### Deployment Verification

Verify that deployments are working correctly:

```bash
node verify-deployment.js
```

This checks:
- Application accessibility
- Health endpoint
- Expected content
- Security headers

### Notifications

Set up notifications for deployment events:

- **Slack**: Configure `SLACK_WEBHOOK_URL` in environment
- **Matrix**: Configure Matrix environment variables:
  - `MATRIX_SERVER_URL`
  - `MATRIX_ACCESS_TOKEN`
  - `MATRIX_USER_ID`
  - `MATRIX_DEPLOYMENT_ROOM_ID`

## Troubleshooting

For deployment issues, refer to the [Deployment Recovery Guide](DEPLOYMENT-RECOVERY-GUIDE.md).

Common issues include:

1. **Database Connection Errors**: Verify DATABASE_URL environment variable
2. **Missing Dependencies**: Ensure npm install completed successfully
3. **Port Conflicts**: Check if something is already using the designated port
4. **SSL Certificate Issues**: Verify certificates are properly configured in Nginx

For assistance, contact:
- Slack: #aetherion-deployments
- Matrix: #aetherion-deployments:aifreedomtrust.org