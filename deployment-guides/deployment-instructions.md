
# Aetherion Deployment to atc.aifreedomtrust.com/wallet

## Files to Deploy
1. Copy the entire 'dist' directory to your server
2. Copy 'server-redirect.js' to your server
3. Copy 'package.json' to your server

## Server Setup
1. Install Node.js (v18.x or higher) and npm on your server
2. Run 'npm install --production' in the directory with package.json
3. Configure Nginx using the provided nginx-config.conf
4. Set up the systemd service using the provided aetherion.service
5. Obtain SSL certificate using Let's Encrypt:
   certbot --nginx -d atc.aifreedomtrust.com

## Starting the Application
1. Replace placeholders in the systemd service file
2. Run: sudo systemctl enable aetherion
3. Run: sudo systemctl start aetherion

## Verifying Deployment
1. Check server status: sudo systemctl status aetherion
2. Check application logs: journalctl -u aetherion
3. Visit https://atc.aifreedomtrust.com/wallet in your browser

## Troubleshooting
- If Nginx shows 502 errors, ensure the Node.js server is running
- If files aren't loading, check permissions on the dist directory
- For SSL issues, verify Let's Encrypt certificates are properly installed
