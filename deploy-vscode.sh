#!/bin/bash
# VS Code Automated Deployment Script for Aetherion Wallet
# Deploys the application to atc.aifreedomtrust.com

# Color configuration for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_step() {
  echo -e "${BLUE}==== STEP $1: $2 ====${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "$1"
}

# Main script
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    AETHERION WALLET DEPLOYMENT SCRIPT         ${NC}"
echo -e "${BLUE}    Target: atc.aifreedomtrust.com/dapp        ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# Load .env variables if they exist
if [ -f .env ]; then
  print_info "Loading environment variables from .env file..."
  source .env
else
  print_warning "No .env file found. Deployment may require manual SSH input."
fi

# Check for SSH credentials
SSH_USER=${DEPLOY_SSH_USER:-""}
SSH_HOST=${DEPLOY_SSH_HOST:-"atc.aifreedomtrust.com"}
SSH_PORT=${DEPLOY_SSH_PORT:-"22"}

if [ -z "$SSH_USER" ]; then
  print_info "Enter your SSH username for ${SSH_HOST}:"
  read -r SSH_USER
fi

# Confirm deployment
print_info "You are about to deploy Aetherion to ${SSH_HOST} as user ${SSH_USER}"
print_info "Press Enter to continue or Ctrl+C to cancel..."
read -r

# Step 1: Build the application
print_step "1" "Building Aetherion Wallet Application"

npm run build

if [ ! -d "dist" ]; then
  print_error "Build failed! The dist directory was not created."
  exit 1
fi

print_success "Application build completed successfully!"
echo

# Step 2: Create deployment package
print_step "2" "Creating Deployment Package"

DEPLOY_PACKAGE="aetherion-deploy-$(date +%Y%m%d%H%M%S).tar.gz"
tar -czf $DEPLOY_PACKAGE dist server-redirect.js package.json .env.example

if [ ! -f "$DEPLOY_PACKAGE" ]; then
  print_error "Failed to create deployment package!"
  exit 1
fi

print_success "Deployment package created: $DEPLOY_PACKAGE"
echo

# Step 3: Upload to server
print_step "3" "Uploading to Server"

print_info "Uploading package to ${SSH_HOST}..."
scp -P $SSH_PORT $DEPLOY_PACKAGE $SSH_USER@$SSH_HOST:~/

if [ $? -ne 0 ]; then
  print_error "Failed to upload package to server!"
  exit 1
fi

print_success "Package uploaded successfully!"
echo

# Step 4: Deploy on the server
print_step "4" "Deploying on Server"

print_info "Connecting to server and deploying application..."

# These commands will be executed on the remote server
SSH_COMMANDS=$(cat <<EOF
echo "Starting deployment on server..."

# Create app directory if it doesn't exist
mkdir -p ~/aetherion

# Extract deployment package
echo "Extracting deployment package..."
tar -xzf ~/$DEPLOY_PACKAGE -C ~/aetherion

# Install production dependencies
echo "Installing dependencies..."
cd ~/aetherion && npm install --production

# Create systemd service file
echo "Setting up systemd service..."
cat > ~/aetherion.service << 'SYSTEMD'
[Unit]
Description=Aetherion UI Wallet
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/aetherion
ExecStart=/usr/bin/node /home/$USER/aetherion/server-redirect.js
Restart=on-failure
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SYSTEMD

# Ask user to use sudo to move and enable the service
echo "You'll now be asked for sudo password to set up the system service"
sudo mv ~/aetherion.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable aetherion
sudo systemctl restart aetherion

# Create Nginx config
echo "Setting up Nginx configuration..."
cat > ~/aetherion-nginx << 'NGINX'
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
NGINX

# Ask user to use sudo to move and enable Nginx config
echo "You'll now be asked for sudo password to set up Nginx"
sudo mv ~/aetherion-nginx /etc/nginx/sites-available/aetherion
sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/
sudo nginx -t

if [ \$? -eq 0 ]; then
  sudo systemctl restart nginx
  echo "Setting up SSL with Let's Encrypt..."
  sudo certbot --nginx -d atc.aifreedomtrust.com
else
  echo "Nginx configuration test failed! Please check the configuration manually."
fi

# Cleanup
echo "Cleaning up..."
rm ~/$DEPLOY_PACKAGE

echo "Deployment completed!"
EOF
)

# Execute deployment commands on server
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "$SSH_COMMANDS"

if [ $? -ne 0 ]; then
  print_error "There were issues during the deployment. Please check the output above."
  exit 1
fi

# Step 5: Cleanup and verification
print_step "5" "Cleanup and Verification"

print_info "Removing local deployment package..."
rm $DEPLOY_PACKAGE

print_success "Deployment process completed!"
echo

print_info "Your Aetherion Wallet is now deployed at:"
print_info "  - https://atc.aifreedomtrust.com/dapp (primary)"
print_info "  - https://atc.aifreedomtrust.com/wallet (legacy)"
echo

print_info "You can verify your deployment by visiting the URLs above."
print_info "If you encounter any issues, you can check the logs on the server with:"
print_info "  - Application logs: sudo journalctl -u aetherion"
print_info "  - Nginx logs: sudo tail /var/log/nginx/error.log"

echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}          DEPLOYMENT COMPLETED                 ${NC}"
echo -e "${BLUE}===============================================${NC}"