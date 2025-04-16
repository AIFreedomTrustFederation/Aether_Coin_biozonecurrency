# Aetherion Wallet - CPanel Deployment Guide

This comprehensive guide explains how to deploy and configure the Aetherion Wallet application on a CPanel hosting environment.

## Overview

CPanel is one of the most common web hosting control panels and provides all the necessary features to host the Aetherion Wallet application, including:

1. Web server (Apache) management
2. Database (MySQL/MariaDB) hosting
3. PHP support for server-side functionality
4. SSL certificate management
5. Subdomain and domain configuration

## Prerequisites

- A CPanel hosting account with:
  - PHP 7.4 or higher
  - MySQL 5.7 or higher / MariaDB 10.3 or higher
  - Node.js support (for build process)
  - SSH access (recommended but optional)

## Step 1: Prepare Your Local Environment

1. Ensure your application is ready for production deployment
2. Update environment variables for production in `.env.production`
3. Make sure all features are working correctly in local development

## Step 2: Build the Application

### Option A: Build Locally

1. Run the deployment script to build and package the application:

```bash
chmod +x deploy-to-cpanel.sh
./deploy-to-cpanel.sh
```

2. This will create a file named `aetherion-cpanel-deploy.zip` containing all necessary files

### Option B: Build on CPanel Server (if Node.js is supported)

1. Upload your source code to a temporary directory on the server
2. Use SSH to connect to your server and run:

```bash
cd /path/to/source
npm install
npm run build
```

## Step 3: Database Setup

1. Log in to your CPanel dashboard
2. Navigate to **MySQL Database Wizard**
3. Create a new database (example: `aetherion_db`)
4. Create a new user with a strong password
5. Assign all privileges for the user to the database
6. Note down the following information:
   - Database name
   - Database username
   - Database password
   - Database host (usually `localhost`)

## Step 4: Upload Application Files

### Option A: Using CPanel File Manager

1. Log in to CPanel
2. Navigate to **File Manager**
3. Go to your document root (usually `public_html`)
4. Create a subdirectory for your application (e.g., `wallet` or leave empty for root domain)
5. Upload the `aetherion-cpanel-deploy.zip` file
6. Extract the zip file
7. Delete the zip file after extraction

### Option B: Using FTP

1. Use an FTP client (like FileZilla) to connect to your server
2. Navigate to your document root (usually `public_html`)
3. Create a subdirectory for your application (e.g., `wallet`)
4. Upload all files from your production build

## Step 5: Configure the Database Connection

1. Locate the `.env.production.template` file on the server
2. Rename it to `.env.production`
3. Edit the file with your database credentials:

```
DB_HOST=localhost
DB_USER=your_cpanel_db_username
DB_PASS=your_db_password
DB_NAME=your_cpanel_db_name
```

## Step 6: Initialize the Database

1. Access the database setup script at `https://your-domain.com/wallet/db_setup.php`
2. Follow the on-screen instructions to create the necessary tables
3. After successful setup, **delete the `db_setup.php` file immediately**

## Step 7: Configure SSL (if not already set up)

1. In CPanel, navigate to **SSL/TLS**
2. Use **Let's Encrypt** or another SSL provider to generate a certificate
3. Install the certificate for your domain
4. Enable **Force HTTPS Redirect** if available

## Step 8: Set Up Cron Jobs (if needed)

1. In CPanel, navigate to **Cron Jobs**
2. Set up any required periodic tasks, such as:
   - Database backups
   - Node status monitoring
   - Reward calculations

Example cron job to run daily at 2 AM:
```
0 2 * * * php /home/username/public_html/wallet/cron/daily-tasks.php
```

## Step 9: Test the Deployment

1. Access your application at `https://your-domain.com/wallet/`
2. Test all major functionality:
   - User authentication
   - Wallet operations
   - Node management
   - API connections

## Step 10: Regular Maintenance

1. **Backups**: Set up regular database backups using CPanel's backup tools
2. **Updates**: Establish a procedure for deploying application updates
3. **Monitoring**: Set up monitoring for server and application health

## Troubleshooting Common Issues

### 404 Errors on Refresh/Direct URL Access

Ensure your `.htaccess` file is properly configured for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Database Connection Issues

Verify your database credentials and that the database user has appropriate permissions:

1. Test connection using phpMyAdmin (available in CPanel)
2. Check the error logs in CPanel (under **Logs** section)

### Performance Optimization

1. **Enable caching**: Configure browser caching through `.htaccess`
2. **Image optimization**: Compress images before deployment
3. **CDN integration**: Consider using a CDN for static assets

## Security Best Practices

1. **Keep software updated**: Regularly update all components
2. **Restrict directory access**: Use `.htaccess` to protect sensitive directories
3. **Security headers**: Implement HTTP security headers
4. **Database hardening**: Use prepared statements for all database operations
5. **Regular audits**: Perform security audits of your code and infrastructure

## Additional Resources

- [CPanel Documentation](https://docs.cpanel.net/)
- [PHP Security Best Practices](https://phptherightway.com/#security)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

For support, contact the Aetherion team at support@aifreedomtrust.com