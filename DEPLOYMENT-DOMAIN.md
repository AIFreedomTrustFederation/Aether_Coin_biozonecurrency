# Deploying Aetherion to atc.aifreedomtrust.com

This guide provides instructions for deploying the Aetherion UI Wallet application to the domain `atc.aifreedomtrust.com`.

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
   
6. Set up a systemd service to ensure the application stays running:
   ```
   [Unit]
   Description=Aetherion UI Wallet
   After=network.target

   [Service]
   Type=simple
   User=YOUR_USERNAME
   WorkingDirectory=/path/to/aetherion
   ExecStart=/usr/bin/node /path/to/aetherion/server-redirect.js
   Restart=on-failure
   Environment=PORT=3000
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

## Accessing the Application

The application can be accessed via two endpoints:
- Primary endpoint: `https://atc.aifreedomtrust.com/dapp` (recommended)
- Secondary endpoint: `https://atc.aifreedomtrust.com/wallet` (legacy support)

## Important Notes

1. The `server-redirect.js` file has been modified to serve the application at both the /dapp and /wallet paths
2. Make sure your DNS records point atc.aifreedomtrust.com to your server's IP address
3. Ensure no redirects are present in the client/index.html file
4. If you encounter redirection issues to external websites, clear your browser cache
5. The server is configured to redirect from the root path (/) to /dapp by default

## Automatic Deployment Setup

For easier deployment, you can use the provided script:

```
node deploy-to-domain.js
```

This script will:
1. Build the application
2. Generate the necessary Nginx configuration
3. Create a systemd service file
4. Provide detailed deployment instructions

The generated files will be placed in the `deployment-guides` directory.
