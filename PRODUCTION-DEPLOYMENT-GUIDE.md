# Aetherion Production Deployment Guide for aifreedomtrust.com

This guide provides instructions for deploying the Aetherion Wallet application to your registered domain (aifreedomtrust.com).

## Prerequisites

- Access to a Linux server (Ubuntu/Debian recommended)
- SSH access to the server
- Domain name (aifreedomtrust.com) already registered
- DNS A records configured to point to your server's IP address
- Node.js (v18+) and npm installed on the server
- PostgreSQL database installed and configured

## Deployment Steps

### 1. Prepare the Server

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y nginx certbot python3-certbot-nginx

# Create application directory
mkdir -p /var/www/aetherion
```

### 2. Clone and Configure the Application

```bash
# Clone the repository (or upload your files)
cd /var/www/aetherion
git clone https://github.com/yourusername/aetherion-wallet .

# Install dependencies
npm install --production

# Create production environment file
cp .env.example .env.production
```

Edit the `.env.production` file to set production-specific values:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/aetherion
JWT_SECRET=your-strong-secret-here
VITE_API_URL=https://aifreedomtrust.com/api
GITHUB_TOKEN=your-github-token
```

### 3. Build the Application

```bash
# Build the frontend
npm run build
```

### 4. Configure Nginx

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/aifreedomtrust.com
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name aifreedomtrust.com www.aifreedomtrust.com atc.aifreedomtrust.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Special handling for atc.aifreedomtrust.com subdomain
    location /atc-aifreedomtrust {
        proxy_pass http://localhost:5000/atc-aifreedomtrust;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/aifreedomtrust.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Set Up SSL Certificates

```bash
sudo certbot --nginx -d aifreedomtrust.com -d www.aifreedomtrust.com -d atc.aifreedomtrust.com
```

### 6. Create a Systemd Service

Create a service file:

```bash
sudo nano /etc/systemd/system/aetherion.service
```

Add the following:

```ini
[Unit]
Description=Aetherion Wallet Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/aetherion
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production PORT=5000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable aetherion
sudo systemctl start aetherion
```

### 7. Configure DNS for Subdomains

Ensure the following DNS records are configured in your domain registrar:

- A record: `aifreedomtrust.com` → Your server IP
- A record: `www.aifreedomtrust.com` → Your server IP
- A record: `atc.aifreedomtrust.com` → Your server IP

### 8. Set Up Database

```bash
# Create database and user
sudo -u postgres psql
postgres=# CREATE DATABASE aetherion;
postgres=# CREATE USER aetherionuser WITH ENCRYPTED PASSWORD 'your-password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE aetherion TO aetherionuser;
postgres=# \q

# Run database migrations
cd /var/www/aetherion
npm run db:push
```

### 9. Verify Deployment

Test that your application is accessible at:
- https://aifreedomtrust.com
- https://www.aifreedomtrust.com
- https://atc.aifreedomtrust.com

### 10. Domain-specific Implementation Notes

The application has been specifically configured to handle the atc.aifreedomtrust.com domain through multiple methods:

1. **Direct Browser Access**:
   - The `/atc-aifreedomtrust` route serves a standalone HTML page for the ATC portal
   - Can be accessed directly in any browser through the navigation menu

2. **Secure DNS Integration**:
   - The application can also handle HTTQS protocol requests through the custom AetherCore Browser
   - Provides quantum-resistant security for sensitive operations

3. **Production Configuration**:
   - Server.js has been updated to properly handle domain routing in production
   - Nginx configuration ensures proper proxy pass for all routes

## Troubleshooting

- **Application Not Starting**: Check the logs with `sudo journalctl -u aetherion.service`
- **Database Connection Issues**: Verify credentials in `.env.production` and database user permissions
- **SSL Certificate Problems**: Run `sudo certbot certificates` to check certificate status and `sudo certbot renew` to attempt renewal

## Security Recommendations

1. Set up a firewall (UFW)
2. Configure fail2ban to prevent brute force attacks
3. Regularly update packages and dependencies
4. Set up automated backups for your database
5. Monitor server logs for suspicious activity

## Regular Maintenance

1. Renew SSL certificates (automatically handled by certbot, but verify)
2. Monitor server resource usage
3. Regularly backup the database
4. Update application dependencies
5. Check for security advisories related to used packages