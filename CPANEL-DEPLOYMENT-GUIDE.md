# cPanel Deployment Guide for Aetherion Ecosystem

This guide provides detailed instructions for deploying the Aetherion Ecosystem to atc.aifreedomtrust.com using cPanel.

## Overview

The Aetherion Ecosystem consists of multiple components:
- Brand Showcase (accessible at /brands)
- Aetherion Wallet (accessible at /wallet)
- Third Application (accessible at /app3)

All of these components are served by a single Node.js server that routes requests appropriately.

## Prerequisites

1. cPanel access to aifreedomtrust.com
2. Node.js version 14 or later (provided by your hosting provider)
3. SSH access to the server (recommended but not required)
4. The deployment package for Aetherion Ecosystem

## Step 1: Create Subdomain in cPanel

1. Log in to your cPanel account
2. Navigate to the "Domains" or "Subdomains" section
3. Create a new subdomain:
   - Subdomain: `atc`
   - Domain: `aifreedomtrust.com`
   - Document Root: `/public_html/atc` (or your preferred path)
4. Click "Create"

## Step 2: Configure Node.js Environment

### Using SSH (Recommended)

If you have SSH access to your server:

```bash
# Connect to the server
ssh username@aifreedomtrust.com

# Navigate to your document root
cd ~/public_html/atc

# Create necessary directories
mkdir -p logs tmp

# Check Node.js version
node -v  # Should be v14.x or later

# Install pm2 for process management
npm install -g pm2
```

### Using cPanel File Manager

If you don't have SSH access:

1. Log in to cPanel
2. Open the File Manager
3. Navigate to `/public_html/atc`
4. Create folders named `logs` and `tmp`

## Step 3: Upload Deployment Package

### Using SCP (if you have SSH access)

```bash
# From your local machine
scp aetherion-ecosystem-deployment.tar.gz username@aifreedomtrust.com:~/public_html/atc/
```

### Using cPanel File Manager

1. Log in to cPanel
2. Open the File Manager
3. Navigate to `/public_html/atc`
4. Click "Upload" and select your deployment package
5. Once uploaded, extract the package:
   - Right-click on the file
   - Select "Extract"
   - Confirm the extraction

## Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

1. Navigate to `/public_html/atc`
2. Create a new file named `.env`
3. Add the following environment variables:

```
NODE_ENV=production
PORT=3000
PUBLIC_URL=https://atc.aifreedomtrust.com
```

If your application requires additional environment variables (e.g., API keys, database credentials), add them to this file.

## Step 5: Install Dependencies

### Using SSH

```bash
# Navigate to the application directory
cd ~/public_html/atc

# Install dependencies
npm install --production
```

### Using cPanel Terminal

If your cPanel has the Terminal feature:

1. Open the Terminal from cPanel
2. Navigate to your application directory: `cd ~/public_html/atc`
3. Run: `npm install --production`

## Step 6: Configure Application as a Service

### Using SSH with PM2

```bash
# Navigate to your application directory
cd ~/public_html/atc

# Start the application with PM2
pm2 start combined-server.js --name "aetherion-ecosystem"

# Set PM2 to start on server reboot
pm2 startup
# Follow the instructions provided by this command

# Save the PM2 process list
pm2 save
```

### Using cPanel Node.js App Setup (if available)

Some cPanel installations have a Node.js application setup:

1. In cPanel, find the "Node.js" or "Setup Node.js App" section
2. Create a new application:
   - Application name: aetherion-ecosystem
   - Application root: /public_html/atc
   - Application URL: https://atc.aifreedomtrust.com
   - Application startup file: combined-server.js
   - Node.js version: (select the latest available)
3. Click "Create"

## Step 7: Configure Nginx or Apache (if necessary)

If your hosting uses Nginx or Apache, create a configuration file that proxies requests to your Node.js application.

### For Nginx

Create a file named `nginx.conf` in your application directory:

```nginx
server {
    listen 80;
    server_name atc.aifreedomtrust.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name atc.aifreedomtrust.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### For Apache

Create a file named `.htaccess` in your application directory:

```apache
RewriteEngine On
RewriteRule ^$ http://localhost:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## Step 8: Test the Deployment

1. Visit https://atc.aifreedomtrust.com
2. Check each component:
   - Brand Showcase: https://atc.aifreedomtrust.com/brands
   - Aetherion Wallet: https://atc.aifreedomtrust.com/wallet
   - Third Application: https://atc.aifreedomtrust.com/app3
3. Verify that all functionality works as expected

## Step 9: Set Up Logs and Monitoring

### Using PM2

If you used PM2 to manage your application:

```bash
# Check logs
pm2 logs aetherion-ecosystem

# Monitor the application
pm2 monit
```

### Using Log Files

The application writes logs to the `logs` directory:

- `server.log`: Main server logs
- `error.log`: Error logs
- `access.log`: HTTP access logs

## Troubleshooting

### Application Won't Start

1. Check the Node.js version: `node -v`
2. Verify all dependencies are installed: `npm install --production`
3. Check for errors in the logs: `cat logs/error.log`
4. Ensure the port is not in use: `lsof -i :3000`

### 502 Bad Gateway or 504 Gateway Timeout

1. Make sure the Node.js application is running
2. Check if the proxy configuration is correct
3. Increase timeout values in the proxy configuration

### Permission Issues

```bash
# Fix permissions for your application files
chmod -R 755 ~/public_html/atc
chmod -R 644 ~/public_html/atc/*.js
chmod -R 644 ~/public_html/atc/*.json
chmod 755 ~/public_html/atc/node_modules/.bin/*
```

## Support and Maintenance

### Updating the Application

To update the application:

1. Stop the running instance: `pm2 stop aetherion-ecosystem`
2. Pull the latest code or upload a new deployment package
3. Install dependencies: `npm install --production`
4. Start the application: `pm2 start aetherion-ecosystem`

### Backing Up

Regularly back up your application:

```bash
# Create a backup archive
tar -czf ~/backups/aetherion-ecosystem-$(date +%Y%m%d).tar.gz ~/public_html/atc
```

### Monitoring

Set up regular monitoring to ensure the application remains healthy:

1. Use PM2 monitoring: `pm2 monit`
2. Configure PM2 to send email alerts on application crashes
3. Set up a separate uptime monitoring service to check the site regularly

## Contact

For assistance with deployment issues, please contact the AI Freedom Trust team.