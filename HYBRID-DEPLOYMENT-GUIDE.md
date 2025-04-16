# Aetherion Harmony Hybrid Deployment Guide

This guide provides comprehensive instructions for deploying the Aetherion Harmony platform using a hybrid approach: GitHub Pages for the frontend and CPanel for the backend API.

## Architecture Overview

The Aetherion Harmony platform is deployed using a hybrid architecture:

1. **Frontend (GitHub Pages)**
   - Static assets (HTML, CSS, JavaScript)
   - SPA (Single Page Application)
   - Deployed at: https://atc.aifreedomtrust.com

2. **Backend API (CPanel)**
   - PHP-based API endpoints
   - MySQL database
   - Deployed at: https://atc.aifreedomtrust.com/api

This hybrid approach leverages the strengths of both platforms:
- GitHub Pages provides free, fast CDN-based static hosting
- CPanel provides robust PHP/MySQL support for dynamic content

## Prerequisites

Before proceeding with deployment, ensure you have:

1. **GitHub Repository Access**
   - Push access to the repository
   - GitHub Actions enabled

2. **CPanel Access**
   - FTP/SFTP credentials
   - Database creation privileges
   - PHP 7.4+ support

3. **Domain Management Access**
   - Ability to configure DNS records for atc.aifreedomtrust.com

4. **Required Secrets**
   The following secrets must be configured in your GitHub repository:
   - `CPANEL_FTP_SERVER`
   - `CPANEL_FTP_USERNAME`
   - `CPANEL_FTP_PASSWORD`
   - `CPANEL_DB_USER`
   - `CPANEL_DB_PASS`
   - `CPANEL_DB_NAME`
   - `JWT_SECRET`
   - `SESSION_SECRET`

## Deployment Process

### 1. Frontend Deployment (GitHub Pages)

The frontend is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Manual Steps:**
1. Ensure the `CNAME` file exists in the root with content: `atc.aifreedomtrust.com`
2. Configure DNS for your domain with these A records pointing to GitHub Pages:
   ```
   A   atc.aifreedomtrust.com   185.199.108.153
   A   atc.aifreedomtrust.com   185.199.109.153
   A   atc.aifreedomtrust.com   185.199.110.153
   A   atc.aifreedomtrust.com   185.199.111.153
   ```
3. In your repository settings, enable GitHub Pages:
   - Go to Settings > Pages
   - Source: GitHub Actions

**Automated Steps (GitHub Actions):**
- The workflow in `.github/workflows/github-pages-deploy.yml` handles:
  - Building the application
  - Deploying to GitHub Pages
  - Configuring HTTPS

### 2. Backend API Deployment (CPanel)

The backend API is deployed to CPanel when changes are pushed to the `production` branch.

**Manual Steps:**
1. Create a MySQL database in CPanel
2. Add database credentials to GitHub Secrets
3. Create subdirectory `/api` in your public_html folder

**Automated Steps (GitHub Actions):**
- The workflow in `.github/workflows/deploy-harmony-to-cpanel.yml` handles:
  - Preparing API files
  - Configuring environment variables
  - Deploying to CPanel via FTP

### 3. Hybrid Deployment

For convenience, a combined workflow is available that deploys both frontend and backend:

1. Push to the `main` branch to deploy only to GitHub Pages
2. Push to the `production` branch to deploy to both GitHub Pages and CPanel
3. Manually trigger the workflow and select the environment

The workflow file is located at `.github/workflows/deploy-hybrid.yml`

## Deployment Scripts

Several scripts are provided to help with deployment:

1. **enable-github-pages.sh**
   - Configures your repository for GitHub Pages
   - Sets up necessary files and configuration
   - Usage: `./enable-github-pages.sh`

2. **deploy-to-aifreedomtrust.sh**
   - Creates a complete deployment package
   - For manual deployment to CPanel
   - Usage: `./deploy-to-aifreedomtrust.sh`

3. **test-api-deployment.sh**
   - Tests API endpoints after deployment
   - Verifies connectivity and basic functionality
   - Usage: `./test-api-deployment.sh`

## Post-Deployment Verification

After deployment, verify that everything is working correctly:

1. **Frontend Verification:**
   - Visit https://atc.aifreedomtrust.com
   - Ensure all pages load correctly
   - Check console for any errors

2. **Backend Verification:**
   - Run the test script: `./test-api-deployment.sh`
   - Visit https://atc.aifreedomtrust.com/api/health
   - Check for status "ok" in the response

3. **Database Verification:**
   - Log in to CPanel phpMyAdmin
   - Verify tables exist and are correctly structured

## Troubleshooting

### Common Issues and Solutions

1. **GitHub Pages 404 errors**
   - Check if GitHub Pages is enabled in repository settings
   - Verify DNS configuration is correct
   - Ensure CNAME file exists and contains the correct domain

2. **API Connection Issues**
   - Check CORS headers in .htaccess
   - Verify API endpoints are accessible
   - Check CPanel error logs

3. **Database Connection Failures**
   - Verify database credentials
   - Check database existence and permissions
   - Review PHP error logs in CPanel

4. **SSL Certificate Issues**
   - GitHub Pages provision can take up to 24 hours
   - Ensure force HTTPS is enabled in .htaccess

## Backup and Recovery

Regular backups are essential for production systems:

1. **Database Backups**
   - The automated backup script runs daily
   - Backups are stored in `/backups` folder
   - Retention period: 7 days

2. **Manual Backup Process**
   - Log in to CPanel
   - Use phpMyAdmin to export database
   - Use File Manager to download API files

3. **Recovery Process**
   - Import database backup via phpMyAdmin
   - Upload API files via File Manager
   - Redeploy frontend via GitHub Actions

## Security Considerations

The deployment follows security best practices:

1. **HTTPS Configuration**
   - All traffic is forced to HTTPS
   - Strong TLS configuration

2. **API Security**
   - JWT authentication for protected endpoints
   - Proper input validation and sanitization
   - Database prepared statements

3. **File Permissions**
   - Sensitive files blocked via .htaccess
   - PHP files outside web root when possible

4. **Database Security**
   - Database user with minimal privileges
   - Strong, unique password
   - Proper SQL injection protection

## Maintenance and Updates

For ongoing maintenance:

1. **Frontend Updates**
   - Push changes to the `main` branch
   - GitHub Actions will automatically deploy

2. **Backend Updates**
   - Push changes to the `production` branch
   - Or use manual deployment process

3. **Database Schema Updates**
   - Include update scripts in deployment
   - Document changes in migration files

## Contact and Support

For deployment assistance:
- Technical support: support@aifreedomtrust.com
- Emergency contact: operations@aifreedomtrust.com

## References

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [CPanel Documentation](https://docs.cpanel.net/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)