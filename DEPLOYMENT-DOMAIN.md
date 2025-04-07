# Deploying Aetherion to atc.aifreedomtrust.com

This document outlines the steps needed to deploy the Aetherion UI Wallet application to the domain atc.aifreedomtrust.com with both `/dapp` and `/wallet` access points.

## Deployment Prerequisites

- A server with SSH access
- Node.js 18+ installed on the server
- Nginx installed on the server
- Let's Encrypt certbot installed for SSL
- Sudo privileges on the server

## Deployment Steps

### 1. Build the Application

```bash
# From your development environment
npm run build
```

### 2. Package the Application

```bash
tar -czf deploy-package.tar.gz dist server-redirect.js package.json
```

### 3. Upload to Server

```bash
scp deploy-package.tar.gz user@atc.aifreedomtrust.com:~/
```

### 4. Server Setup

SSH into your server and perform the following operations:

```bash
ssh user@atc.aifreedomtrust.com

# Extract the package
mkdir -p ~/aetherion
tar -xzf deploy-package.tar.gz -C ~/aetherion
cd ~/aetherion

# Install production dependencies
npm install --production
```

### 5. Create Systemd Service

Create a systemd service file to ensure the application runs continuously and starts on boot:

```bash
sudo tee /etc/systemd/system/aetherion.service > /dev/null << 'EOF'
[Unit]
Description=Aetherion UI Wallet
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/your_username/aetherion
ExecStart=/usr/bin/node /home/your_username/aetherion/server-redirect.js
Restart=on-failure
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Activate the service
sudo systemctl daemon-reload
sudo systemctl enable aetherion
sudo systemctl start aetherion
```

### 6. Configure Nginx

Create an Nginx configuration file to proxy requests to the application:

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

# Enable the site
sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If the test passes, restart Nginx
sudo systemctl restart nginx
```

### 7. Configure SSL with Let's Encrypt

```bash
sudo certbot --nginx -d atc.aifreedomtrust.com --non-interactive --agree-tos
```

### 8. Test the Deployment

Visit the following URLs to confirm the application is working:
- https://atc.aifreedomtrust.com/dapp (primary)
- https://atc.aifreedomtrust.com/wallet (secondary)

## Updating the Deployment

To update the application, repeat steps 1-3, then run:

```bash
cd ~/aetherion
tar -xzf ../deploy-package.tar.gz
npm install --production
sudo systemctl restart aetherion
```

## Troubleshooting

### Service Not Starting

Check the service status:
```bash
sudo systemctl status aetherion
```

View the application logs:
```bash
journalctl -u aetherion
```

### Nginx Configuration Issues

Check Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

Verify certbot status:
```bash
sudo certbot certificates
```

Renew certificates if needed:
```bash
sudo certbot renew
```

## Environment Variables

Ensure the following environment variables are set in the server environment or in a `.env` file in the application directory:

- `NODE_ENV=production`
- `PORT=3000` (or your preferred port)
- Any database connection strings and API keys needed by the application

## Security Considerations

- Ensure the server has a firewall enabled, allowing only necessary ports (80, 443, SSH)
- Set up regular security updates for the server
- Configure rate limiting in Nginx for API endpoints
- Set up regular backups of any application data