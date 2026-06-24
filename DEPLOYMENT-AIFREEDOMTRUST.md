
# Aetherion Deployment Guide - aifreedomtrust.com

This guide provides detailed instructions for deploying the Aetherion application to atc.aifreedomtrust.com/dapp.
Quick guide for deploying Aetherion to atc.aifreedomtrust.com/dapp.

## Deployment Methods

## Deployment Options

There are two ways to deploy the application:

1. **GitHub Actions (Recommended)**: Automated deployment using GitHub workflows
2. **Manual Deployment**: Step-by-step manual deployment process

Choose the method that best suits your needs.

## Prerequisites

- Access to the GitHub repository
- SSH access to the server
- GitHub repository secrets properly configured

## GitHub Actions Deployment

## Quick Start

### Required GitHub Secrets

Ensure these secrets are configured in your GitHub repository:

- `DEPLOY_SSH_PRIVATE_KEY`: SSH private key for server access
- `DEPLOY_SSH_HOST`: Server hostname (e.g., atc.aifreedomtrust.com)
- `DEPLOY_SSH_USER`: SSH username for the server
- `DEPLOY_SSH_PORT`: SSH port (optional, defaults to 22)

### Running the Deployment

1. Go to the GitHub repository
2. Navigate to "Actions" tab
3. Select "Deploy Aetherion to Traditional Server" workflow
4. Click "Run workflow" and select the branch to deploy (usually main)
5. Monitor the workflow execution

The workflow will:

- Build the application
- Package the necessary files
- Deploy to the server
- Configure Nginx and SSL
- Start the application service

## Manual Deployment

If you need to deploy manually, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency.git
   cd Aether_Coin_biozonecurrency

```plaintext

2. Install dependencies and build:

   ```bash
   npm ci
   npm run build
```plaintext

3. Prepare the deployment package:

   ```bash
   cp server-redirect.js dist/
   echo "NODE_ENV=production" > dist/.env
   echo "PORT=3000" >> dist/.env
   tar -czf deploy-package.tar.gz dist package.json
```plaintext

4. Transfer to server:

   ```bash
   scp deploy-package.tar.gz user@atc.aifreedomtrust.com:~/

5. Configure repository secrets:
```plaintext

6. SSH into the server and deploy:

   ```bash
   ssh user@atc.aifreedomtrust.com

   # On the server
   mkdir -p ~/aetherion
   tar -xzf deploy-package.tar.gz -C ~/aetherion
   cd ~/aetherion
   npm install --production

   # Create systemd service
   sudo nano /etc/systemd/system/aetherion.service
   # Paste the service configuration (see below)

   # Enable and start the service
   sudo systemctl daemon-reload
   sudo systemctl enable aetherion
   sudo systemctl start aetherion

   # Configure Nginx
   sudo nano /etc/nginx/sites-available/aetherion
   # Paste the Nginx configuration (see below)

   sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

   # Set up SSL
   sudo certbot --nginx -d atc.aifreedomtrust.com -d www.atc.aifreedomtrust.com
   ```

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name atc.aifreedomtrust.com www.atc.aifreedomtrust.com;

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }

    # For Let's Encrypt
    location ~ /.well-known {
        root /var/www/html;
        allow all;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name atc.aifreedomtrust.com www.atc.aifreedomtrust.com;

    # SSL configuration (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/atc.aifreedomtrust.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atc.aifreedomtrust.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/atc.aifreedomtrust.com/chain.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Other security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Primary application path at /dapp
    location /dapp {
        proxy_pass http://localhost:3000/dapp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Secondary application path at /wallet (legacy support)
    location /wallet {
        proxy_pass http://localhost:3000/wallet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Redirect root to /dapp
    location = / {
        return 301 /dapp;
    }
}
```

## Troubleshooting

### Checking Application Status

```bash
sudo systemctl status aetherion
```

### Viewing Application Logs

```bash
sudo journalctl -u aetherion --no-pager -n 100
```

### Checking Nginx Configuration

```bash
sudo nginx -t
```

### Checking SSL Certificate Status

```bash
sudo certbot certificates
```

### Common Issues

1. **Application not starting**: Check the logs with `journalctl` and ensure all dependencies are installed.

2. **Nginx configuration errors**: Run `nginx -t` to validate the configuration.

3. **SSL certificate issues**: Ensure Certbot is installed and run `certbot certificates` to check status.

4. **Permission problems**: Make sure the application directory and files have the correct permissions.

## SSL Certificate Management

The deployment process automatically sets up SSL certificates using Let's Encrypt. These certificates:

- Are valid for 90 days
- Will auto-renew via a Certbot cron job
- Provide A+ rated SSL security

To manually renew certificates:

```bash
sudo certbot renew
```

To check certificate expiration:

```bash
sudo certbot certificates
```

## Security Considerations

The deployment includes:

- TLS 1.2 and 1.3 support (older protocols disabled)
- Strong cipher suites
- HTTP Strict Transport Security (HSTS)
- XSS protection headers
- Content-Type sniffing prevention
- Clickjacking protection

## Maintenance

### Updating the Application

To update the application, simply push changes to the GitHub repository and the GitHub Actions workflow will handle the deployment.

### Backing Up

The deployment process automatically creates backups before updating. You can find them in:

```plaintext
~/aetherion_backup_TIMESTAMP
```

### Rollback Procedure

If you need to rollback to a previous version:

1. SSH into the server
2. Stop the current service: `sudo systemctl stop aetherion`
3. Replace the current deployment with a backup:

   ```bash
   rm -rf ~/aetherion/*
   cp -r ~/aetherion_backup_TIMESTAMP/* ~/aetherion/
   ```

4. Restart the service: `sudo systemctl start aetherion`
