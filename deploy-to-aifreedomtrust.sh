#!/bin/bash
# Aetherion Deployment Script for atc.aifreedomtrust.com
# This script automates the deployment of the Aetherion wallet to atc.aifreedomtrust.com

# Color configuration for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    AETHERION WALLET DEPLOYMENT SCRIPT        ${NC}"
echo -e "${BLUE}    Target: atc.aifreedomtrust.com            ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# Load .env variables if they exist
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  source .env
fi

# Check for SSH credentials
SSH_USER=${DEPLOY_SSH_USER:-""}
SSH_HOST=${DEPLOY_SSH_HOST:-"atc.aifreedomtrust.com"}
SSH_PORT=${DEPLOY_SSH_PORT:-"22"}

if [ -z "$SSH_USER" ]; then
  echo "Enter your SSH username for ${SSH_HOST}:"
  read -r SSH_USER
fi

# Confirm deployment
echo "You are about to deploy Aetherion to ${SSH_HOST} as user ${SSH_USER}"
echo "Press Enter to continue or Ctrl+C to cancel..."
read -r

# Step 1: Build the application
echo -e "${BLUE}==== STEP 1: Building Aetherion Wallet Application ====${NC}"
npm run build

if [ ! -d "dist" ]; then
  echo -e "${RED}Build failed! The dist directory was not created.${NC}"
  exit 1
fi

echo -e "${GREEN}Application build completed successfully!${NC}"
echo

# Step 2: Create deployment package
echo -e "${BLUE}==== STEP 2: Creating Deployment Package ====${NC}"
DEPLOY_PACKAGE="aetherion-deploy.tar.gz"
tar -czf $DEPLOY_PACKAGE dist server-redirect.js package.json

if [ ! -f "$DEPLOY_PACKAGE" ]; then
  echo -e "${RED}Failed to create deployment package!${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment package created: $DEPLOY_PACKAGE${NC}"
echo

# Step 3: Upload to server
echo -e "${BLUE}==== STEP 3: Uploading to Server ====${NC}"
echo "Uploading package to ${SSH_HOST}..."
scp -P $SSH_PORT $DEPLOY_PACKAGE $SSH_USER@$SSH_HOST:~/

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to upload package to server!${NC}"
  exit 1
fi

echo -e "${GREEN}Package uploaded successfully!${NC}"
echo

# Step 4: Deploy on the server
echo -e "${BLUE}==== STEP 4: Deploying on Server ====${NC}"
echo "Connecting to server and deploying application..."

# Execute deployment commands on server
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "
  echo 'Starting deployment on server...'
  
  # Create app directory if it doesn't exist
  mkdir -p ~/aetherion
  
  # Extract deployment package
  echo 'Extracting deployment package...'
  tar -xzf ~/$DEPLOY_PACKAGE -C ~/aetherion
  
  # Install production dependencies
  echo 'Installing dependencies...'
  cd ~/aetherion && npm install --production
  
  # Set up service file
  echo 'Setting up systemd service file...'
  cat > ~/aetherion.service << 'EOF'
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

  # Move service file to systemd directory
  echo 'You may be asked for your sudo password to set up the service...'
  sudo mv ~/aetherion.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable aetherion
  sudo systemctl restart aetherion
  
  # Set up Nginx config
  echo 'Setting up Nginx configuration...'
  cat > ~/aetherion-nginx << 'EOF'
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

  # Move Nginx config to proper directory
  sudo mv ~/aetherion-nginx /etc/nginx/sites-available/aetherion
  sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/
  
  # Test and reload Nginx
  echo 'Testing Nginx configuration...'
  sudo nginx -t
  
  if [ \$? -eq 0 ]; then
    sudo systemctl restart nginx
    
    # Set up SSL with Let's Encrypt
    echo 'Setting up SSL with Let\"s Encrypt...'
    sudo certbot --nginx -d atc.aifreedomtrust.com
  else
    echo 'Nginx configuration test failed. Please check manually.'
  fi
  
  # Cleanup
  echo 'Cleaning up...'
  rm ~/$DEPLOY_PACKAGE
  
  echo 'Deployment completed!'
"

if [ $? -ne 0 ]; then
  echo -e "${RED}There were issues during the deployment. Please check the output above.${NC}"
  exit 1
fi

# Step 5: Cleanup and verification
echo -e "${BLUE}==== STEP 5: Cleanup and Verification ====${NC}"
echo "Removing local deployment package..."
rm $DEPLOY_PACKAGE

echo -e "${GREEN}Deployment process completed!${NC}"
echo
echo "Your Aetherion Wallet is now deployed at:"
echo "  - https://atc.aifreedomtrust.com/dapp (primary)"
echo "  - https://atc.aifreedomtrust.com/wallet (legacy)"
echo
echo "You can verify your deployment by visiting the URLs above."
echo "If you encounter any issues, you can check the logs on the server with:"
echo "  - Application logs: sudo journalctl -u aetherion"
echo "  - Nginx logs: sudo tail /var/log/nginx/error.log"

echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}          DEPLOYMENT COMPLETED               ${NC}"
echo -e "${BLUE}===============================================${NC}"