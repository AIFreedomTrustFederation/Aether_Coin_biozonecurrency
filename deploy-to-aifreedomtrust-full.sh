#!/bin/bash
# =========================================================================
# Aetherion Comprehensive Deployment Script (Bash Version)
# =========================================================================
# This script automates the complete deployment process of Aetherion Wallet
# to both IPFS/Filecoin and traditional hosting at www.atc.aifreedomtrust.com
#
# Author: AI Assistant
# =========================================================================

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
CYAN="\033[36m"
RESET="\033[0m"

# Configuration
DOMAIN="www.atc.aifreedomtrust.com"
DEPLOY_PATH="/"
DEPLOY_PACKAGE="aetherion-deploy.tar.gz"
LOG_DIR="deployment-logs"
LOG_FILE="${LOG_DIR}/aetherion-deployment-$(date +%Y%m%d-%H%M%S).log"
ENV_FILE=".env"
REQUIRED_TOOLS=("node" "npm" "curl" "tar")
REQUIRED_ENV_VARS=("WEB3_STORAGE_TOKEN")
OPTIONAL_ENV_VARS=("FRACTALCOIN_API_KEY" "FRACTALCOIN_API_ENDPOINT" "SETUP_FILECOIN_INTEGRATION" "ENS_PRIVATE_KEY" "ENS_DOMAIN")

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
  local level=$1
  local message=$2
  local color=$RESET
  
  case $level in
    "INFO") color=$BLUE ;;
    "SUCCESS") color=$GREEN ;;
    "WARNING") color=$YELLOW ;;
    "ERROR") color=$RED ;;
    "STEP") color=$CYAN ;;
  esac
  
  # Log to console with color
  echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] ${message}${RESET}"
  
  # Log to file without color codes
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] ${message}" >> "$LOG_FILE"
}

# Function to display section headers
section() {
  local title=$1
  log "STEP" "================================================================="
  log "STEP" "  ${title}"
  log "STEP" "================================================================="
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if environment variable exists
env_var_exists() {
  grep -q "^$1=" "$ENV_FILE" 2>/dev/null
}

# Function to handle errors
handle_error() {
  local message=$1
  local exit_code=${2:-1}
  
  log "ERROR" "$message"
  log "ERROR" "Deployment failed. Check $LOG_FILE for details."
  exit $exit_code
}

# Function to check prerequisites
check_prerequisites() {
  section "Checking Prerequisites"
  
  # Check for required tools
  for tool in "${REQUIRED_TOOLS[@]}"; do
    if command_exists "$tool"; then
      log "INFO" "✓ $tool is installed"
    else
      handle_error "✗ $tool is not installed. Please install it and try again."
    fi
  done
  
  # Check Node.js version
  NODE_VERSION=$(node -v | cut -d 'v' -f 2)
  log "INFO" "Node.js version: $NODE_VERSION"
  
  # Check if .env file exists
  if [[ -f "$ENV_FILE" ]]; then
    log "INFO" "✓ $ENV_FILE file found"
  else
    log "WARNING" "✗ $ENV_FILE file not found. Creating from example..."
    if [[ -f ".env.example" ]]; then
      cp .env.example "$ENV_FILE"
      log "INFO" "Created $ENV_FILE from .env.example. Please edit it with your credentials."
    else
      handle_error "No .env.example file found. Please create a $ENV_FILE file manually."
    fi
  fi
  
  # Check for required environment variables
  for var in "${REQUIRED_ENV_VARS[@]}"; do
    if env_var_exists "$var"; then
      log "INFO" "✓ $var is set"
    else
      log "WARNING" "✗ Required environment variable $var is not set in $ENV_FILE"
      read -p "Enter your $var: " value
      if [[ -z "$value" ]]; then
        handle_error "$var is required. Exiting."
      fi
      
      # Append to .env file
      echo "$var=$value" >> "$ENV_FILE"
      log "INFO" "✓ Added $var to $ENV_FILE file"
    fi
  done
  
  # Check for optional environment variables
  for var in "${OPTIONAL_ENV_VARS[@]}"; do
    if env_var_exists "$var"; then
      log "INFO" "✓ $var is set"
    else
      log "WARNING" "✗ Optional environment variable $var is not set in $ENV_FILE"
      
      if [[ "$var" == "SETUP_FILECOIN_INTEGRATION" ]]; then
        read -p "Do you want to set up Filecoin integration? (y/n): " setup_filecoin
        if [[ "$setup_filecoin" == "y" || "$setup_filecoin" == "Y" ]]; then
          echo "SETUP_FILECOIN_INTEGRATION=true" >> "$ENV_FILE"
          
          # If setting up Filecoin, we need the API key
          if ! env_var_exists "FRACTALCOIN_API_KEY"; then
            read -p "Enter your FRACTALCOIN_API_KEY: " api_key
            if [[ -n "$api_key" ]]; then
              echo "FRACTALCOIN_API_KEY=$api_key" >> "$ENV_FILE"
            fi
          fi
          
          # And the API endpoint if not set
          if ! env_var_exists "FRACTALCOIN_API_ENDPOINT"; then
            echo "FRACTALCOIN_API_ENDPOINT=https://api.fractalcoin.network/v1" >> "$ENV_FILE"
          fi
          
          # Set allocation size
          echo "FRACTALCOIN_FILECOIN_ALLOCATION=20" >> "$ENV_FILE"
        else
          echo "SETUP_FILECOIN_INTEGRATION=false" >> "$ENV_FILE"
        fi
      fi
    fi
  done
  
  log "SUCCESS" "All prerequisites checked"
}

# Function to collect deployment credentials
collect_credentials() {
  section "Collecting Deployment Credentials"
  
  read -p "Enter your SSH Username: " SSH_USER
  read -p "Enter your SSH Host (default: $DOMAIN): " SSH_HOST
  SSH_HOST=${SSH_HOST:-$DOMAIN}
  read -p "Enter your SSH Port (default: 22): " SSH_PORT
  SSH_PORT=${SSH_PORT:-22}
  read -p "Enter your Slack Webhook URL (optional, press enter to skip): " SLACK_WEBHOOK_URL
  
  log "SUCCESS" "Credentials collected successfully!"
}

# Function to install dependencies
install_dependencies() {
  section "Installing Dependencies"
  
  log "INFO" "Installing npm dependencies..."
  npm install --no-fund --no-audit || handle_error "Failed to install npm dependencies"
  
  log "INFO" "Installing deployment-specific dependencies..."
  if [[ -f "install-deployment-deps.sh" ]]; then
    bash install-deployment-deps.sh || handle_error "Failed to install deployment dependencies"
  else
    # Install common deployment dependencies if script doesn't exist
    npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers || handle_error "Failed to install deployment dependencies"
  fi
  
  log "SUCCESS" "All dependencies installed successfully"
}

# Function to build the application
build_application() {
  section "Building Application"
  
  # Clean previous builds
  log "INFO" "Cleaning previous builds..."
  if [[ -f "npm-scripts.sh" ]]; then
    bash npm-scripts.sh clean || log "WARNING" "Clean script failed, continuing anyway"
  else
    rm -rf dist/ build/ .cache/ node_modules/.cache/ 2>/dev/null
  fi
  
  # Run TypeScript check
  log "INFO" "Running TypeScript check..."
  npm run check || log "WARNING" "TypeScript check failed, continuing anyway"
  
  # Build the application
  log "INFO" "Building application..."
  npm run build || handle_error "Failed to build application"
  
  # Verify build output
  if [[ -d "dist" ]]; then
    log "SUCCESS" "Application built successfully"
    return 0
  else
    handle_error "Build directory not found after build"
    return 1
  fi
}

# Function to deploy to Web3.Storage
deploy_to_web3storage() {
  section "Deploying to Web3.Storage (IPFS/Filecoin)"
  
  log "INFO" "Uploading to Web3.Storage..."
  
  # Use the deploy-to-web3.js script if it exists
  if [[ -f "scripts/deploy-to-web3.js" ]]; then
    node scripts/deploy-to-web3.js || handle_error "Failed to deploy to Web3.Storage"
    
    log "SUCCESS" "Deployment to Web3.Storage completed"
    return 0
  else
    log "ERROR" "deploy-to-web3.js script not found"
    return 1
  fi
}

# Function to set up FractalCoin-Filecoin bridge
setup_filecoin_bridge() {
  section "Setting Up FractalCoin-Filecoin Bridge"
  
  # Check if bridge setup is enabled
  if grep -q "SETUP_FILECOIN_INTEGRATION=true" "$ENV_FILE" 2>/dev/null; then
    log "INFO" "FractalCoin-Filecoin bridge integration is enabled"
    
    # Check for API key
    if ! env_var_exists "FRACTALCOIN_API_KEY"; then
      log "WARNING" "FRACTALCOIN_API_KEY is not set. Bridge setup will be skipped."
      return 1
    fi
    
    log "INFO" "Setting up FractalCoin-Filecoin bridge..."
    
    # Use the fractalcoin-filecoin-bridge.js script if it exists
    if [[ -f "scripts/fractalcoin-filecoin-bridge.js" ]]; then
      node scripts/fractalcoin-filecoin-bridge.js || handle_error "Failed to set up FractalCoin-Filecoin bridge"
      
      log "SUCCESS" "FractalCoin-Filecoin bridge setup completed"
      return 0
    else
      log "WARNING" "fractalcoin-filecoin-bridge.js script not found. Bridge setup skipped."
      return 1
    fi
  else
    log "INFO" "FractalCoin-Filecoin bridge integration is disabled. Skipping setup."
    return 1
  fi
}

# Function to create deployment package
create_deployment_package() {
  section "Creating Deployment Package"
  
  log "INFO" "Creating deployment package..."
  
  # Create tar.gz package
  tar -czf "$DEPLOY_PACKAGE" dist server-redirect.js package.json || {
    log "ERROR" "Failed to create deployment package"
    return 1
  }
  
  if [[ -f "$DEPLOY_PACKAGE" ]]; then
    log "SUCCESS" "Deployment package created: $DEPLOY_PACKAGE"
    return 0
  else
    log "ERROR" "Failed to create deployment package"
    return 1
  fi
}

# Function to upload package to server
upload_to_server() {
  section "Uploading to Server"
  
  log "INFO" "Uploading package to $SSH_HOST..."
  
  # Upload package via SCP
  scp -P "$SSH_PORT" "$DEPLOY_PACKAGE" "$SSH_USER@$SSH_HOST:~/" || {
    log "ERROR" "Failed to upload package to server"
    return 1
  }
  
  log "SUCCESS" "Package uploaded successfully!"
  return 0
}

# Function to deploy on the server
deploy_on_server() {
  section "Deploying on Server"
  
  log "INFO" "Deploying on server..."
  
  # Create SSH command for deployment
  ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
    echo 'Starting deployment on server...'

    # Extract deployment package
    mkdir -p ~/aetherion
    tar -xzf ~/$DEPLOY_PACKAGE -C ~/aetherion

    # Install dependencies
    cd ~/aetherion && npm install --production

    # Setup systemd service if it doesn't exist
    if [ ! -f /etc/systemd/system/aetherion.service ]; then
      echo 'Creating systemd service...'
      echo '[Unit]
Description=Aetherion Wallet Server
After=network.target

[Service]
Type=simple
User=$SSH_USER
WorkingDirectory=/home/$SSH_USER/aetherion
ExecStart=/usr/bin/node /home/$SSH_USER/aetherion/server-redirect.js
Restart=on-failure
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target' | sudo tee /etc/systemd/system/aetherion.service

      sudo systemctl daemon-reload
      sudo systemctl enable aetherion.service
    fi

    # Restart the service
    sudo systemctl restart aetherion.service

    # Check service status
    echo 'Service status:'
    sudo systemctl status aetherion.service --no-pager

    # Cleanup
    rm ~/$DEPLOY_PACKAGE
    echo 'Deployment completed!'
  " || {
    log "ERROR" "Failed to deploy on server"
    return 1
  }
  
  log "SUCCESS" "Deployment on server completed successfully!"
  return 0
}

# Function to configure Nginx on the server
configure_nginx() {
  section "Configuring Nginx"
  
  # Create Nginx config
  cat > nginx-config.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Primary application path at root
    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # For Let's Encrypt
    location ~ /.well-known {
        allow all;
    }
}
EOF
  
  # Upload the config file
  scp -P "$SSH_PORT" nginx-config.conf "$SSH_USER@$SSH_HOST:~/" || {
    log "ERROR" "Failed to upload Nginx config"
    return 1
  }
  
  # Apply the config
  ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
    sudo mv ~/nginx-config.conf /etc/nginx/sites-available/$DOMAIN
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo 'Nginx configuration applied'
  " || {
    log "ERROR" "Failed to configure Nginx"
    return 1
  }
  
  # Clean up local temp file
  rm -f nginx-config.conf
  
  log "SUCCESS" "Nginx configured successfully!"
  return 0
}

# Function to set up HTTPS with Let's Encrypt
setup_https() {
  section "Setting Up HTTPS with Let's Encrypt"
  
  ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
      echo 'Installing Certbot...'
      sudo apt-get update
      sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtain and install certificate
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSH_USER@$SSH_HOST
    
    echo 'HTTPS setup completed'
  " || {
    log "ERROR" "Failed to set up HTTPS"
    return 1
  }
  
  log "SUCCESS" "HTTPS set up successfully!"
  return 0
}

# Function to verify deployment
verify_deployment() {
  section "Verifying Deployment"
  
  log "INFO" "Checking if application is responding..."
  
  # Wait for the app to start up
  log "INFO" "Waiting 5 seconds for application to start..."
  sleep 5
  
  # Check if the webapp is responding
  curl -s --head --request GET "http://$SSH_HOST:3000" || {
    log "WARNING" "Could not verify application is running. Please check manually."
    return 1
  }
  
  log "SUCCESS" "Verification successful! Application is running properly."
  return 0
}

# Function to extract CID from logs
extract_cid_from_logs() {
  local cid=$(grep -o "CID: [a-zA-Z0-9]*" "$LOG_FILE" | tail -1 | cut -d ' ' -f 2)
  echo "$cid"
}

# Function to display deployment summary
display_deployment_summary() {
  section "Deployment Summary"
  
  # Extract CID from logs
  local cid=$(extract_cid_from_logs)
  
  echo -e "${BOLD}${MAGENTA}"
  echo "================================================================="
  echo "                  AETHERION DEPLOYMENT SUMMARY                   "
  echo "================================================================="
  echo -e "${RESET}"
  
  echo -e "${BOLD}${CYAN}Traditional Web Hosting:${RESET}"
  echo -e "Domain: $DOMAIN"
  if [ "$TRADITIONAL_DEPLOYMENT_SUCCESS" = true ]; then
    echo -e "URL: https://$DOMAIN"
    echo -e "Status: ${GREEN}Active${RESET}"
  else
    echo -e "Status: ${YELLOW}Not deployed or failed${RESET}"
  fi
  echo ""
  
  echo -e "${BOLD}${CYAN}IPFS/Filecoin Deployment:${RESET}"
  if [ "$WEB3_STORAGE_SUCCESS" = true ] && [ -n "$cid" ]; then
    echo -e "Content CID: $cid"
    echo -e "Gateway URL: https://$cid.ipfs.dweb.link/"
    echo -e "Status: ${GREEN}Active${RESET}"
  else
    echo -e "Status: ${YELLOW}Not deployed or failed${RESET}"
  fi
  echo ""
  
  echo -e "${BOLD}${CYAN}FractalCoin-Filecoin Bridge:${RESET}"
  if [ "$BRIDGE_SETUP_SUCCESS" = true ]; then
    echo -e "Status: ${GREEN}Active${RESET}"
  else
    echo -e "Status: ${YELLOW}Not configured or skipped${RESET}"
  fi
  echo ""
  
  echo -e "${BOLD}${CYAN}Next Steps:${RESET}"
  echo "1. Access your application at:"
  if [ "$TRADITIONAL_DEPLOYMENT_SUCCESS" = true ]; then
    echo "   - Traditional hosting: https://$DOMAIN"
  fi
  if [ "$WEB3_STORAGE_SUCCESS" = true ] && [ -n "$cid" ]; then
    echo "   - IPFS/Filecoin: https://$cid.ipfs.dweb.link/"
  fi
  echo "2. Monitor your application performance"
  echo "3. Set up monitoring and alerts"
  echo ""
  
  echo -e "${BOLD}${MAGENTA}=================================================================${RESET}"
}

# Function to send Slack notification
send_slack_notification() {
  local webhook_url=$1
  local message=$2
  
  if [ -z "$webhook_url" ]; then
    return
  fi
  
  log "INFO" "Sending notification to Slack..."
  
  curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$message\"}" "$webhook_url" || {
    log "ERROR" "Failed to send Slack notification"
    return 1
  }
  
  log "SUCCESS" "Notification sent successfully!"
  return 0
}

# Function to clean up after deployment
cleanup() {
  section "Cleaning Up"
  
  # Remove local package
  if [ -f "$DEPLOY_PACKAGE" ]; then
    rm -f "$DEPLOY_PACKAGE"
  fi
  
  log "SUCCESS" "Cleanup completed"
}

# Main execution
main() {
  # Create log file
  touch "$LOG_FILE"
  
  # Display banner
  echo -e "${BOLD}${MAGENTA}"
  echo "================================================================="
  echo "            AETHERION COMPREHENSIVE DEPLOYMENT SCRIPT            "
  echo "================================================================="
  echo -e "${RESET}"
  
  log "INFO" "Starting deployment process..."
  log "INFO" "Log file: $LOG_FILE"
  
  # Initialize success flags
  WEB3_STORAGE_SUCCESS=false
  BRIDGE_SETUP_SUCCESS=false
  TRADITIONAL_DEPLOYMENT_SUCCESS=false
  
  # Run deployment steps
  check_prerequisites
  collect_credentials
  install_dependencies
  
  # Build the application
  if build_application; then
    # Deploy to Web3.Storage
    if deploy_to_web3storage; then
      WEB3_STORAGE_SUCCESS=true
    fi
    
    # Set up FractalCoin-Filecoin bridge
    if setup_filecoin_bridge; then
      BRIDGE_SETUP_SUCCESS=true
    fi
    
    # Deploy to traditional hosting
    if [ -n "$SSH_USER" ] && [ -n "$SSH_HOST" ]; then
      if create_deployment_package && upload_to_server && deploy_on_server; then
        TRADITIONAL_DEPLOYMENT_SUCCESS=true
        
        # Configure Nginx and HTTPS
        configure_nginx
        setup_https
        
        # Verify deployment
        verify_deployment
      fi
    else
      log "WARNING" "SSH credentials not provided. Skipping traditional deployment."
    fi
  else
    log "ERROR" "Build failed. Aborting deployment."
    exit 1
  fi
  
  # Display deployment summary
  display_deployment_summary
  
  # Send notification
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    send_slack_notification "$SLACK_WEBHOOK_URL" "✅ Aetherion Wallet deployment to $DOMAIN completed successfully!"
  fi
  
  # Cleanup
  cleanup
  
  log "SUCCESS" "Deployment process completed successfully!"
}

# Execute main function
main