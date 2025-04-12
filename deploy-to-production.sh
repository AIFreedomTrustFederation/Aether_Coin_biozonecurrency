#!/bin/bash
# Production deployment script for Aetherion Wallet to aifreedomtrust.com
# This script automates the deployment process to a production server

# Configuration variables
SERVER_USER="your-server-username"
SERVER_HOST="your-server-ip"
DEPLOY_PATH="/var/www/aetherion"
GITHUB_REPO="https://github.com/yourusername/aetherion-wallet.git"

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Aetherion Wallet Production Deployment    ${NC}"
echo -e "${BLUE}  Target: aifreedomtrust.com                ${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}No SSH key found. Creating one...${NC}"
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo -e "${GREEN}SSH key created.${NC}"
    echo -e "${YELLOW}Please add this public key to your server:${NC}"
    cat ~/.ssh/id_rsa.pub
    echo -e "${YELLOW}Then run the following command on your server:${NC}"
    echo "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
    exit 1
fi

# Build the application locally
echo -e "${BLUE}Building application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Aborting deployment.${NC}"
    exit 1
fi
echo -e "${GREEN}Build successful.${NC}"

# Create a deployment package
echo -e "${BLUE}Creating deployment package...${NC}"
mkdir -p deploy
cp -r dist deploy/
cp -r server deploy/
cp -r client/public deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp server.js deploy/
cp nginx.conf.example deploy/
cp aetherion.service deploy/
cp .env.production deploy/
cp PRODUCTION-DEPLOYMENT-GUIDE.md deploy/

# Additional files for domain handling
cp -r shared deploy/
tar -czf aetherion-deploy.tar.gz deploy/
rm -rf deploy/
echo -e "${GREEN}Deployment package created: aetherion-deploy.tar.gz${NC}"

# Upload to server
echo -e "${BLUE}Uploading to server...${NC}"
scp aetherion-deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:~/
if [ $? -ne 0 ]; then
    echo -e "${RED}Upload failed. Aborting deployment.${NC}"
    exit 1
fi
echo -e "${GREEN}Upload successful.${NC}"

# Execute deployment on server
echo -e "${BLUE}Executing deployment on server...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    echo "Creating deployment directory structure..."
    mkdir -p /var/www/aetherion
    
    echo "Extracting deployment package..."
    tar -xzf ~/aetherion-deploy.tar.gz -C /tmp
    
    echo "Stopping existing service if running..."
    sudo systemctl stop aetherion.service || true
    
    echo "Copying files to destination..."
    sudo cp -r /tmp/deploy/* ${DEPLOY_PATH}/
    
    echo "Setting up environment..."
    cd ${DEPLOY_PATH}
    mv .env.production .env
    
    echo "Installing dependencies..."
    npm install --production
    
    echo "Setting up Nginx configuration..."
    sudo cp nginx.conf.example /etc/nginx/sites-available/aifreedomtrust.com
    sudo ln -sf /etc/nginx/sites-available/aifreedomtrust.com /etc/nginx/sites-enabled/
    sudo nginx -t
    if [ $? -ne 0 ]; then
        echo "Nginx configuration error. Please check manually."
    else
        sudo systemctl reload nginx
    fi
    
    echo "Setting up systemd service..."
    sudo cp aetherion.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable aetherion.service
    sudo systemctl start aetherion.service
    
    echo "Cleaning up..."
    rm -rf /tmp/deploy
    rm ~/aetherion-deploy.tar.gz
    
    echo "Checking service status..."
    sudo systemctl status aetherion.service
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed on server. Please check manually.${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment completed successfully.${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Aetherion Wallet is now deployed to:      ${NC}"
echo -e "${BLUE}  - https://aifreedomtrust.com              ${NC}"
echo -e "${BLUE}  - https://atc.aifreedomtrust.com          ${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}NOTE: Make sure to set up SSL certificates using:${NC}"
echo -e "sudo certbot --nginx -d aifreedomtrust.com -d www.aifreedomtrust.com -d atc.aifreedomtrust.com"
echo -e "${YELLOW}And check your database configuration in the .env file.${NC}"