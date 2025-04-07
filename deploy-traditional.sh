#!/bin/bash
# Traditional deployment script for Aetherion
# Deploys the application to be served at https://atc.aifreedomtrust.com/wallet

# Load environment variables
source .env

# Set variables
DOMAIN="atc.aifreedomtrust.com"
DEPLOY_PATH="/wallet"
OUTPUT_DIR="dist"
DEPLOY_SCRIPT="server-redirect.js"

# Check if required environment variables exist
if [ -z "$DEPLOY_SSH_HOST" ] || [ -z "$DEPLOY_SSH_USER" ]; then
  echo "Error: DEPLOY_SSH_HOST and DEPLOY_SSH_USER environment variables are required for deployment"
  echo "Please add them to your .env file"
  exit 1
fi

# Build the application
echo "Building application..."
npm run build

if [ ! -d "$OUTPUT_DIR" ]; then
  echo "Error: Build directory '$OUTPUT_DIR' not found. Build failed."
  exit 1
fi

echo "Build completed successfully!"

# Package the application for deployment
echo "Packaging application for deployment..."
DEPLOY_PACKAGE="aetherion-deploy.tar.gz"
tar -czf $DEPLOY_PACKAGE $OUTPUT_DIR $DEPLOY_SCRIPT package.json

echo "Deploying to $DEPLOY_SSH_USER@$DEPLOY_SSH_HOST..."

# Upload the package to the server
scp $DEPLOY_PACKAGE $DEPLOY_SSH_USER@$DEPLOY_SSH_HOST:~/

# SSH into the server and deploy
ssh $DEPLOY_SSH_USER@$DEPLOY_SSH_HOST << EOF
  # Extract the package
  mkdir -p ~/aetherion
  tar -xzf $DEPLOY_PACKAGE -C ~/aetherion
  cd ~/aetherion
  
  # Install dependencies (only production ones)
  npm install --production
  
  # Setup systemd service if needed
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
ExecStart=/usr/bin/node $HOME/aetherion/$DEPLOY_SCRIPT
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
  
  # Set up nginx if it doesn't exist
  if [ ! -f /etc/nginx/sites-available/aetherion ]; then
    echo "Setting up Nginx configuration..."
    sudo tee /etc/nginx/sites-available/aetherion > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name $DOMAIN;

    location /wallet {
        proxy_pass http://localhost:3000/wallet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Redirect root to /wallet
    location = / {
        return 301 /wallet;
    }

    # For certbot
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
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos
  else
    # Just restart Nginx
    sudo systemctl restart nginx
  fi
EOF

# Clean up
rm $DEPLOY_PACKAGE

echo "Deployment complete!"
echo "Your application should now be accessible at https://$DOMAIN$DEPLOY_PATH"
echo "If you encounter any issues, check the server logs with 'journalctl -u aetherion'"