# Aetherion Wallet Deployment Guide for aifreedomtrust.com

This comprehensive guide covers the deployment of Aetherion Wallet to the registered domain aifreedomtrust.com and its subdomains.

## Overview

The Aetherion Wallet application has been enhanced to support both custom HTTQS protocol access and regular web browser access through traditional HTTPS, specifically for the aifreedomtrust.com domain. This dual-access approach ensures maximum compatibility while maintaining quantum-resistant security features.

## Domain Setup

### Domain Structure
- **Main Domain**: aifreedomtrust.com
- **Subdomain**: atc.aifreedomtrust.com (ATC Portal)
- **Quantum DNS**: .trust TLD via FractalCoin DNS system

### DNS Configuration
1. Configure A records pointing to your server IP:
   ```
   aifreedomtrust.com → your-server-ip
   www.aifreedomtrust.com → your-server-ip
   atc.aifreedomtrust.com → your-server-ip
   ```

2. For subdomain wildcard support:
   ```
   *.aifreedomtrust.com → your-server-ip
   ```

## Deployment Options

### Option 1: Automated Deployment (Recommended)

1. Update server details in `deploy-to-production.sh`:
   ```bash
   SERVER_USER="your-server-username"
   SERVER_HOST="your-server-ip"
   ```

2. Run the deployment script:
   ```bash
   ./deploy-to-production.sh
   ```
   
3. Follow the on-screen instructions to complete the deployment.

### Option 2: Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Transfer files to your server:
   ```bash
   scp -r dist server shared client/public server.js package.json your-username@your-server-ip:/var/www/aetherion/
   ```

3. Set up the server environment:
   ```bash
   # On your server
   cd /var/www/aetherion
   cp .env.production.example .env.production
   # Edit .env.production with your values
   npm install --production
   ```

4. Install and configure Nginx:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   sudo cp nginx.conf.example /etc/nginx/sites-available/aifreedomtrust.com
   sudo ln -s /etc/nginx/sites-available/aifreedomtrust.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. Set up SSL:
   ```bash
   sudo certbot --nginx -d aifreedomtrust.com -d www.aifreedomtrust.com -d atc.aifreedomtrust.com
   ```

6. Configure systemd service:
   ```bash
   sudo cp aetherion.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable aetherion.service
   sudo systemctl start aetherion.service
   ```

## Accessing the Application

After deployment, your application will be accessible at:

- **Main Application**: https://aifreedomtrust.com
- **ATC Portal**:
  - Direct access: https://aifreedomtrust.com/atc-aifreedomtrust
  - Subdomain access: https://atc.aifreedomtrust.com (redirects to the direct access URL)

## Special Features

### ATC Portal

The ATC Portal can be accessed through two methods:

1. **Regular HTTPS Browser Access**:
   - Through the navigation menu in the main application
   - Directly via https://aifreedomtrust.com/atc-aifreedomtrust
   - Via subdomain at https://atc.aifreedomtrust.com

2. **Quantum-Secure HTTQS Access**:
   - Through the AetherCore Browser within the application
   - Using the protocol: httqs://www.atc.aifreedomtrust.com

### Quantum Security Features

The deployment includes several quantum security features:

1. **HTTQS Protocol Support**: Custom protocol for quantum-resistant connections
2. **Dual-layer Security**: Traditional TLS 1.3 combined with post-quantum cryptography
3. **Certificate Verification**: Enhanced verification process in the AetherCore Browser
4. **Visual Security Indicators**: Clear indication of connection security status

## Maintenance and Updates

### Log Files

Important logs are stored in:
- Application logs: `/var/log/aetherion/app.log`
- Nginx access logs: `/var/log/nginx/aifreedomtrust.com-access.log`
- Nginx error logs: `/var/log/nginx/aifreedomtrust.com-error.log`

### Updating the Application

1. Build the new version locally
2. Run the deployment script with the new version
3. Or manually update files and restart the service:
   ```bash
   sudo systemctl restart aetherion.service
   ```

### SSL Certificate Renewal

SSL certificates from Let's Encrypt are valid for 90 days and will auto-renew via the certbot cron job. To manually renew:

```bash
sudo certbot renew
```

## Troubleshooting

### Application Not Starting

Check the service status and logs:
```bash
sudo systemctl status aetherion.service
sudo journalctl -u aetherion.service
```

### Nginx Configuration Issues

Validate the Nginx configuration:
```bash
sudo nginx -t
```

### Database Connection Problems

Verify the database connection details in the .env file and check that PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

### SSL Certificate Issues

Check certificate status:
```bash
sudo certbot certificates
```

## Security Recommendations

1. Enable a firewall (UFW) with only necessary ports open (80, 443, SSH)
2. Install and configure fail2ban to prevent brute force attacks
3. Keep the system and all packages updated
4. Set up automated database backups
5. Implement server monitoring and alerting