# VS Code Deployment Guide for Aetherion

This guide will help you set up automated deployment of Aetherion to atc.aifreedomtrust.com using VS Code.

## Setup Instructions

### 1. Create Deployment Script

Create a file named `deploy-vscode.sh` with the following content:

```bash
#!/bin/bash
# VS Code Automated Deployment Script for Aetherion Wallet

echo "=== AETHERION WALLET DEPLOYMENT SCRIPT ==="
echo "Target: atc.aifreedomtrust.com/dapp"
echo "========================================"
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
echo "==== STEP 1: Building Aetherion Wallet Application ===="
npm run build

if [ ! -d "dist" ]; then
  echo "Build failed! The dist directory was not created."
  exit 1
fi

echo "Application build completed successfully!"
echo

# Step 2: Create deployment package
echo "==== STEP 2: Creating Deployment Package ===="
DEPLOY_PACKAGE="aetherion-deploy.tar.gz"
tar -czf $DEPLOY_PACKAGE dist server-redirect.js package.json

echo "Deployment package created: $DEPLOY_PACKAGE"
echo

# Step 3: Upload to server
echo "==== STEP 3: Uploading to Server ===="
echo "Uploading package to ${SSH_HOST}..."
scp -P $SSH_PORT $DEPLOY_PACKAGE $SSH_USER@$SSH_HOST:~/

if [ $? -ne 0 ]; then
  echo "Failed to upload package to server!"
  exit 1
fi

echo "Package uploaded successfully!"
echo

# Step 4: Deploy on the server
echo "==== STEP 4: Deploying on Server ===="
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
  echo 'Setting up service file (may require sudo password)...'
  sudo bash -c 'cat > /etc/systemd/system/aetherion.service << EOF
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
EOF'
  
  # Start service
  sudo systemctl daemon-reload
  sudo systemctl enable aetherion
  sudo systemctl restart aetherion
  
  # Set up Nginx
  echo 'Setting up Nginx configuration...'
  sudo bash -c 'cat > /etc/nginx/sites-available/aetherion << EOF
server {
    listen 80;
    server_name atc.aifreedomtrust.com;

    # Primary application path at /dapp
    location /dapp {
        proxy_pass http://localhost:3000/dapp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }

    # Secondary application path at /wallet
    location /wallet {
        proxy_pass http://localhost:3000/wallet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
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
EOF'
  
  # Enable Nginx config
  sudo ln -sf /etc/nginx/sites-available/aetherion /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl restart nginx
  
  # Set up SSL
  echo 'Setting up SSL with Let\\'s Encrypt...'
  sudo certbot --nginx -d atc.aifreedomtrust.com
  
  # Cleanup
  rm ~/$DEPLOY_PACKAGE
  
  echo 'Deployment completed!'
"

if [ $? -ne 0 ]; then
  echo "There were issues during the deployment. Please check the output above."
  exit 1
fi

# Step 5: Cleanup and verification
echo "==== STEP 5: Cleanup and Verification ===="
rm $DEPLOY_PACKAGE

echo "Deployment process completed!"
echo
echo "Your Aetherion Wallet is now deployed at:"
echo "  - https://atc.aifreedomtrust.com/dapp (primary)"
echo "  - https://atc.aifreedomtrust.com/wallet (legacy)"
echo
echo "You can verify your deployment by visiting the URLs above."
echo "If you encounter any issues, you can check the logs on the server:"
echo "  - Application logs: sudo journalctl -u aetherion"
echo "  - Nginx logs: sudo tail /var/log/nginx/error.log"
echo
echo "=============== DEPLOYMENT COMPLETED ==============="
```

Make sure to make the script executable:

```bash
chmod +x deploy-vscode.sh
```

### 2. Create VS Code Task Configuration

Create a folder named `.vscode` in the root of your project (if it doesn't exist already):

```bash
mkdir -p .vscode
```

Create a file named `.vscode/tasks.json` with the following content:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Deploy Aetherion to atc.aifreedomtrust.com",
      "type": "shell",
      "command": "${workspaceFolder}/deploy-vscode.sh",
      "presentation": {
        "reveal": "always",
        "panel": "new",
        "focus": true
      },
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

### 3. Configure Environment Variables (Optional)

For a smoother deployment experience, create/edit your `.env` file to include:

```
DEPLOY_SSH_USER=your_username
DEPLOY_SSH_HOST=atc.aifreedomtrust.com
DEPLOY_SSH_PORT=22
```

Replace `your_username` with your actual SSH username.

## Running the Deployment

1. Open the VS Code command palette (Press `Ctrl+Shift+P` or `⌘+Shift+P` on Mac)
2. Type "Tasks: Run Task" and select it
3. Choose "Deploy Aetherion to atc.aifreedomtrust.com"

The deployment will start in a new terminal window and guide you through the process.

## What This Deployment Does

1. Builds the Aetherion application
2. Creates a deployment package with necessary files
3. Uploads the package to your server
4. Extracts the files and installs dependencies
5. Sets up a systemd service for the application
6. Configures Nginx with both /dapp and /wallet paths
7. Sets up HTTPS with Let's Encrypt
8. Performs cleanup and verifies deployment

## Troubleshooting

If the deployment fails, check:

1. SSH connectivity to your server
2. SSH user permissions (needs sudo access for systemd and Nginx setup)
3. Node.js installation on the server
4. Nginx installation and configuration
5. Let's Encrypt (certbot) installation

Server logs can be viewed with:
- Application logs: `sudo journalctl -u aetherion`
- Nginx logs: `sudo tail /var/log/nginx/error.log`