# AETHERION DEPLOYMENT TO ATC.AIFREEDOMTRUST.COM

This document provides simple instructions for deploying Aetherion to atc.aifreedomtrust.com.

## DEPLOYMENT STEPS

1. Build the application:
   npm run build

2. Create a deployment package:
   tar -czf deploy.tar.gz dist server-redirect.js package.json

3. Upload to server:
   scp deploy.tar.gz user@atc.aifreedomtrust.com:~/

4. SSH into the server:
   ssh user@atc.aifreedomtrust.com

5. Extract the files:
   mkdir -p ~/aetherion
   tar -xzf deploy.tar.gz -C ~/aetherion
   cd ~/aetherion

6. Install dependencies:
   npm install --production

7. Configure systemd service:
   - Create a file at /etc/systemd/system/aetherion.service with content:
     [Unit]
     Description=Aetherion UI Wallet
     After=network.target

     [Service]
     Type=simple
     User=YOUR_USERNAME
     WorkingDirectory=/home/YOUR_USERNAME/aetherion
     ExecStart=/usr/bin/node /home/YOUR_USERNAME/aetherion/server-redirect.js
     Restart=on-failure
     Environment=PORT=3000
     Environment=NODE_ENV=production

     [Install]
     WantedBy=multi-user.target

   - Enable and start the service:
     sudo systemctl daemon-reload
     sudo systemctl enable aetherion
     sudo systemctl start aetherion

8. Configure Nginx:
   - Create a file at /etc/nginx/sites-available/aetherion with content:
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

   - Link and enable the configuration:
     sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/
     sudo nginx -t
     sudo systemctl restart nginx

9. Setup SSL with Let's Encrypt:
   sudo certbot --nginx -d atc.aifreedomtrust.com

10. Test the deployment:
    - Primary URL: https://atc.aifreedomtrust.com/dapp
    - Legacy URL: https://atc.aifreedomtrust.com/wallet

## TROUBLESHOOTING

- If the service fails to start, check logs: journalctl -u aetherion
- For Nginx issues, check: /var/log/nginx/error.log
- For SSL issues, run: sudo certbot certificates