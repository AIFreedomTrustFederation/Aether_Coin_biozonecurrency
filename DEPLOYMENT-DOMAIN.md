# Deploying Aetherion to atc.aifreedomtrust.com/wallet

This guide provides instructions for deploying the Aetherion UI Wallet application specifically to the domain `https://atc.aifreedomtrust.com/wallet`.

## Prerequisites

Before deploying, ensure you have:

1. A web server with:
   - Node.js 18.x or higher
   - npm 9.x or higher
   - Access to configure Nginx or Apache
   - SSL certificate (Let's Encrypt recommended)

## Deployment Process

1. Build the application locally:
   ```
   npm run build
   ```

2. Transfer the build files to your server using SCP or SFTP
   
3. Configure Nginx with the following settings:
   ```nginx
   server {
       listen 80;
       server_name atc.aifreedomtrust.com;

       location /wallet {
           proxy_pass http://localhost:3000/wallet;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Redirect root to /wallet
       location = / {
           return 301 /wallet;
       }
   }
   ```

4. Use Let's Encrypt to secure your domain with SSL:
   ```
   sudo certbot --nginx -d atc.aifreedomtrust.com
   ```

5. Start the application server:
   ```
   node server-redirect.js
   ```
   
6. Set up a systemd service to ensure the application stays running

## Important Notes

1. The `server-redirect.js` file has been modified to serve the application at the /wallet path
2. Make sure your DNS records point atc.aifreedomtrust.com to your server's IP address
3. Ensure no redirects are present in the client/index.html file
