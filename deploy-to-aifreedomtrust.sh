#!/bin/bash
# Deployment script for Aetherion to atc.aifreedomtrust.com/dapp
# This script builds and deploys the application to the specified server

# Load environment variables if present
if [ -f .env ]; then
  source .env
fi

# Ensure SSH credentials are set
if [ -z "$DEPLOY_SSH_HOST" ] || [ -z "$DEPLOY_SSH_USER" ]; then
  echo "Error: DEPLOY_SSH_HOST and DEPLOY_SSH_USER environment variables are required"
  echo "Please set them in your .env file or as environment variables"
  exit 1
fi

# Build the application
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Error: Build failed"
  exit 1
fi

# Package the application
echo "Packaging application..."
tar -czf deploy-package.tar.gz dist server-redirect.js package.json

# Deploy via SSH
echo "Deploying to ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}..."
scp deploy-package.tar.gz ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}:~/

ssh ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST} << 'EOF'
  mkdir -p ~/aetherion
  tar -xzf deploy-package.tar.gz -C ~/aetherion
  cd ~/aetherion
  
  # Install dependencies
  npm install --production
  
  # Create systemd service file if it doesn't exist
  if [ ! -f /etc/systemd/system/aetherion.service ]; then
    echo "Setting up systemd service..."
    sudo tee /etc/systemd/system/aetherion.service > /dev/null << 'SERVICEEOF'
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
SERVICEEOF

    sudo systemctl daemon-reload
    sudo systemctl enable aetherion
  fi
  
  # Restart the service
  sudo systemctl restart aetherion
  
  # Set up nginx config if it doesn't exist
  if [ ! -f /etc/nginx/sites-available/aetherion ]; then
    echo "Setting up Nginx configuration..."
    sudo tee /etc/nginx/sites-available/aetherion > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name atc.aifreedomtrust.com;

    # Primary application path at /dapp
    location /dapp {
        proxy_pass http://localhost:3000/dapp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Secondary application path at /wallet (legacy support)
    location /wallet {
        proxy_pass http://localhost:3000/wallet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
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
NGINXEOF

    sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/
    
    # Check Nginx config
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    
    # Setup SSL with Let's Encrypt
    sudo certbot --nginx -d atc.aifreedomtrust.com --non-interactive --agree-tos
  else
    # Just restart Nginx if the config already exists
    sudo systemctl restart nginx
  fi
EOF

# Clean up
rm deploy-package.tar.gz

echo "Deployment completed successfully!"
echo "Your application should now be accessible at:"
echo "  - https://atc.aifreedomtrust.com/dapp (primary)"
echo "  - https://atc.aifreedomtrust.com/wallet (secondary)"
# Deployment script for Aetherion to atc.aifreedomtrust.com/dapp
# This script builds and deploys the application to the specified server

# Load environment variables if present
if [ -f .env ]; then
  source .env
fi

# Ensure SSH credentials are set
if [ -z "$DEPLOY_SSH_HOST" ] || [ -z "$DEPLOY_SSH_USER" ]; then
  echo "Error: DEPLOY_SSH_HOST and DEPLOY_SSH_USER environment variables are required"
  echo "Please set them in your .env file or as environment variables"
  exit 1
fi

# Build the application
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Error: Build failed"
  exit 1
fi
