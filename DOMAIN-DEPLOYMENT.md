# Aetherion Deployment to atc.aifreedomtrust.com

This document provides detailed instructions for deploying the Aetherion UI Wallet application to the domain atc.aifreedomtrust.com with both `/dapp` (primary) and `/wallet` (legacy) endpoints.

## Prerequisites

- Server with SSH access and the following installed:
  - Node.js 18+ and npm
  - Nginx
  - Let's Encrypt (certbot)
  - sudo privileges

## Environment Setup

Create or update your `.env` file to include the necessary deployment variables:

```
# Deployment Variables
DEPLOY_SSH_HOST=atc.aifreedomtrust.com
DEPLOY_SSH_USER=your_username
```

## Deployment Process

### 1. Build the Application

Build the application for production:

```bash
npm run build
```

### 2. Package Files for Deployment

Create a tarball containing the necessary files:

```bash
tar -czf aetherion-deploy.tar.gz dist server-redirect.js package.json
```

### 3. Upload to Server

Upload the deployment package to your server:

```bash
scp aetherion-deploy.tar.gz ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}:~/
```

### 4. Server Configuration

SSH into your server and perform the following configuration steps:

```bash
ssh ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}
```

#### Extract and Install

```bash
# Extract files
mkdir -p ~/aetherion
tar -xzf aetherion-deploy.tar.gz -C ~/aetherion
cd ~/aetherion

# Install production dependencies
npm install --production
```

#### Create Systemd Service

Create a systemd service to run the application in the background:

```bash
sudo tee /etc/systemd/system/aetherion.service > /dev/null << 'EOF'
[Unit]
Description=Aetherion UI Wallet
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/aetherion
ExecStart=/usr/bin/node $HOME/aetherion/server-redirect.js
Restart=on-failure
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable aetherion
sudo systemctl start aetherion
```

#### Configure Nginx

Create an Nginx configuration file for the application:

```bash
sudo tee /etc/nginx/sites-available/aetherion > /dev/null << 'EOF'
server {
    listen 80;
    server_name atc.aifreedomtrust.com;

    # Primary application path at /dapp
    location /dapp {
        proxy_pass http://localhost:3000/dapp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Secondary application path at /wallet (legacy support)
    location /wallet {
        proxy_pass http://localhost:3000/wallet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Redirect root to /dapp
    location = / {
        return 301 /dapp;
    }

    # For Let's Encrypt
    location ~ /.well-known {
        allow all;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Set Up SSL Certificate

```bash
sudo certbot --nginx -d atc.aifreedomtrust.com --non-interactive --agree-tos
```

## Verifying Deployment

After deployment, verify the application is running correctly:

1. Check the systemd service status:
   ```bash
   sudo systemctl status aetherion
   ```

2. Check application logs:
   ```bash
   journalctl -u aetherion
   ```

3. Visit the application in a browser:
   - Primary URL: https://atc.aifreedomtrust.com/dapp
   - Legacy URL: https://atc.aifreedomtrust.com/wallet

## Updating the Application

To update the deployed application:

1. Build the new version
2. Create a new deployment package
3. Upload and extract on the server
4. Restart the systemd service:
   ```bash
   sudo systemctl restart aetherion
   ```

## Troubleshooting

### Application Not Starting

Check the application logs for errors:
```bash
journalctl -u aetherion -n 100
```

### Nginx Configuration Issues

Check Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

Verify the SSL certificate:
```bash
sudo certbot certificates
```

Renew if needed:
```bash
sudo certbot renew
```

## Environment Variables

Ensure all necessary environment variables are set for the production environment by updating the systemd service file if needed.

## Security Considerations

- Keep the server updated with security patches
- Configure a firewall to restrict access to necessary ports
- Set up rate limiting for API endpoints
- Implement regular backups of application data
- Monitor server logs for unusual activity