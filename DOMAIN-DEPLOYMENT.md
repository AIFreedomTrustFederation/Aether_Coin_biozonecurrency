# Aetherion Harmony - Domain Deployment Guide

This guide provides all the information needed to deploy the Aetherion Harmony project to your domain with CPanel hosting.

## 1. Domain & DNS Configuration

### Required DNS Records

| Record Type | Name/Host | Value/Target | TTL | Priority |
|-------------|-----------|--------------|-----|----------|
| A           | atc       | [YOUR_CPANEL_IP_ADDRESS] | 3600 | - |
| CNAME       | www.atc   | atc.aifreedomtrust.com | 3600 | - |
| MX          | atc       | mail.atc.aifreedomtrust.com | 3600 | 10 |
| TXT         | atc       | v=spf1 a mx include:_spf.yourhostingprovider.com ~all | 3600 | - |

You need to get the correct IP address from your CPanel hosting provider to replace [YOUR_CPANEL_IP_ADDRESS].

## 2. Hosting Requirements

- **CPanel Hosting**: Your hosting account should provide CPanel access
- **PHP Version**: 7.4 or higher
- **MySQL/MariaDB**: 5.7+ or 10.3+ respectively
- **SSL Certificate**: Let's Encrypt or another SSL provider
- **Storage**: At least 1GB of space for the application

## 3. Deployment Options

### Option A: Manual Deployment (Recommended for First-Time Setup)

1. Run the deployment script to create a deployment package:
   ```bash
   chmod +x deploy-harmony-to-cpanel.sh
   ./deploy-harmony-to-cpanel.sh
   ```

2. Upload the generated `harmony-cpanel-deploy.zip` to your CPanel hosting
3. Extract the files to the correct directory (usually `public_html/wallet`)
4. Follow the included installation guide

### Option B: GitHub Actions Automated Deployment

For automated deployments from GitHub, you need to:

1. Store your deployment credentials as GitHub Secrets:
   - `CPANEL_FTP_SERVER`: Your CPanel FTP hostname
   - `CPANEL_FTP_USERNAME`: Your CPanel FTP username
   - `CPANEL_FTP_PASSWORD`: Your CPanel FTP password
   - `CPANEL_DB_USER`: Your database username
   - `CPANEL_DB_PASS`: Your database password
   - `CPANEL_DB_NAME`: Your database name
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `SESSION_SECRET`: Another secure random string for sessions

2. Push to the `production` branch to trigger automatic deployment, or manually trigger the workflow from GitHub Actions.

## 4. Post-Deployment Steps

1. **Database Setup**: After files are deployed, navigate to `https://atc.aifreedomtrust.com/wallet/db_setup.php` to set up the database
2. **Delete Setup Script**: Immediately delete `db_setup.php` after successful setup
3. **Test Installation**: Verify all features are working correctly
4. **SSL Verification**: Ensure SSL is properly configured for secure HTTPS connections

## 5. Troubleshooting

### Common Issues:

- **Blank Page**: Check PHP error logs in CPanel
- **Database Connection Error**: Verify database credentials
- **404 Errors**: Ensure .htaccess is properly uploaded and Apache mod_rewrite is enabled
- **API Not Working**: Check permissions on PHP files in the server directory

### Accessing Error Logs:

1. Log in to CPanel
2. Navigate to "Error Log" 
3. Check for PHP errors related to the application

## 6. Security Recommendations

1. **File Permissions**:
   - Directories: 755
   - PHP files: 644
   - Configuration files (.env): 600

2. **Regular Updates**:
   - Keep PHP updated to the latest version
   - Regularly update the application

3. **Backups**:
   - Set up daily database backups
   - Create regular full-site backups

## 7. Support & Resources

- For technical assistance, contact support@aifreedomtrust.com
- Documentation: https://atc.aifreedomtrust.com/docs
- GitHub repository: https://github.com/aifreedomtrust/aetherion-wallet