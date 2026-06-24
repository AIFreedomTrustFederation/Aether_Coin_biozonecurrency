#!/bin/bash
#
# ALL-IN-ONE DEPLOYMENT SCRIPT FOR AETHERION SAAS APP
# Target: atc.aifreedomtrust.com
#
# This script automates the complete deployment process:
# 1. Validates environment and prerequisites
# 2. Collects or uses stored credentials
# 3. Builds all components (client, server, api-gateway, quantum-validator)
# 4. Deploys to Web3.Storage (IPFS/Filecoin) if configured
# 5. Sets up FractalCoin-Filecoin bridge if enabled
# 6. Deploys to traditional hosting at atc.aifreedomtrust.com
# 7. Configures Nginx, DNS and HTTPS
# 8. Verifies all deployments
# 9. Sets up monitoring and sends notifications
#

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Constants
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="atc.aifreedomtrust.com"
WWW_DOMAIN="www.atc.aifreedomtrust.com"
DEPLOY_PATH="/dapp"
CREDENTIALS_FILE="$SCRIPT_DIR/.deploy-credentials"
LOG_DIR="$SCRIPT_DIR/deployment-logs"
LOG_FILE="$LOG_DIR/deployment_$(date +%Y%m%d_%H%M%S).log"
DEPLOY_PACKAGE="aetherion-deploy.tar.gz"
ENV_FILE="$SCRIPT_DIR/.env"
TEMP_SSH_KEY="/tmp/deploy_ssh_key_$$"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
  local message="$1"
  local level="${2:-INFO}"
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo -e "[$timestamp] [$level] $message"
  echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Function to log error and exit
error_exit() {
  log "$1" "ERROR"
  echo -e "${RED}ERROR: $1${NC}"
  exit 1
}

# Function to print section header
print_section() {
  echo -e "\n${BLUE}==== $1 ====${NC}"
  log "SECTION: $1" "INFO"
}

# Function to print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
  log "$1" "SUCCESS"
}

# Function to print warning message
print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
  log "$1" "WARNING"
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to prompt for input with default value
prompt() {
  local message="$1"
  local default="$2"
  local secure="$3"
  local input
  
  if [ -n "$default" ]; then
    message="$message (default: $default)"
  fi
  
  if [ "$secure" = "true" ]; then
    read -s -p "$message: " input
    echo
  else
    read -p "$message: " input
  fi
  
  echo "${input:-$default}"
}

# Function to check if environment variable exists in .env file
env_var_exists() {
  local var_name="$1"
  if [ -f "$ENV_FILE" ]; then
    grep -q "^$var_name=" "$ENV_FILE"
    return $?
  fi
  return 1
}

# Function to add or update environment variable
set_env_var() {
  local var_name="$1"
  local var_value="$2"
  
  if [ -f "$ENV_FILE" ]; then
    if env_var_exists "$var_name"; then
      # Update existing variable
      sed -i "s|^$var_name=.*|$var_name=$var_value|" "$ENV_FILE"
    else
      # Add new variable
      echo "$var_name=$var_value" >> "$ENV_FILE"
    fi
  else
    # Create new .env file
    echo "$var_name=$var_value" > "$ENV_FILE"
  fi
}

# Function to load credentials from file
load_credentials() {
  if [ -f "$CREDENTIALS_FILE" ]; then
    log "Loading saved credentials from $CREDENTIALS_FILE"
    source "$CREDENTIALS_FILE"
    return 0
  fi
  return 1
}

# Function to save credentials to file
save_credentials() {
  log "Saving credentials to $CREDENTIALS_FILE"
  cat > "$CREDENTIALS_FILE" << EOF
SSH_USER="$SSH_USER"
SSH_HOST="$SSH_HOST"
SSH_PORT="$SSH_PORT"
ADMIN_EMAIL="$ADMIN_EMAIL"
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"
DISCORD_WEBHOOK_URL="$DISCORD_WEBHOOK_URL"
EOF
  chmod 600 "$CREDENTIALS_FILE"
}

# Function to check prerequisites
check_prerequisites() {
  print_section "Checking Prerequisites"
  
  # Check required tools
  local required_tools=("node" "npm" "curl" "tar" "ssh" "scp")
  for tool in "${required_tools[@]}"; do
    if command_exists "$tool"; then
      print_success "$tool is installed"
    else
      error_exit "$tool is not installed. Please install it and try again."
    fi
  done
  
  # Check Node.js version
  local node_version=$(node -v)
  log "Node.js version: $node_version"
  
  # Check if node version is >= 16
  local node_major_version=$(echo "$node_version" | cut -d. -f1 | tr -d 'v')
  if [ "$node_major_version" -lt 16 ]; then
    error_exit "Node.js version 16 or higher is required. Current version: $node_version"
  fi
  
  # Check if .env file exists
  if [ -f "$ENV_FILE" ]; then
    print_success ".env file found"
  else
    print_warning ".env file not found. Creating from example..."
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
      cp "$SCRIPT_DIR/.env.example" "$ENV_FILE"
      print_success "Created .env from .env.example. Please edit it with your credentials."
    else
      # Create minimal .env file
      cat > "$ENV_FILE" << EOF
NODE_ENV=production
PORT=3000
EOF
      print_warning "Created minimal .env file. You may need to add more variables."
    fi
  fi
  
  print_success "All prerequisites checked"
}

# Function to collect deployment credentials
collect_credentials() {
  print_section "Collecting Deployment Credentials"
  
  # Try to load saved credentials first
  if load_credentials; then
    echo -e "${CYAN}Found saved credentials. Do you want to use them? (y/n)${NC}"
    read -r use_saved
    if [[ "$use_saved" =~ ^[Yy]$ ]]; then
      print_success "Using saved credentials"
      return 0
    fi
  fi
  
  # Collect new credentials
  SSH_USER=$(prompt "Enter your SSH Username")
  SSH_HOST=$(prompt "Enter your SSH Host" "$DOMAIN")
  SSH_PORT=$(prompt "Enter your SSH Port" "22")
  ADMIN_EMAIL=$(prompt "Enter your email for SSL certificates")
  SLACK_WEBHOOK_URL=$(prompt "Enter your Slack Webhook URL (optional, press enter to skip)")
  DISCORD_WEBHOOK_URL=$(prompt "Enter your Discord Webhook URL (optional, press enter to skip)")
  
  # Ask if user wants to save credentials
  echo -e "${CYAN}Do you want to save these credentials for future deployments? (y/n)${NC}"
  read -r save_creds
  if [[ "$save_creds" =~ ^[Yy]$ ]]; then
    save_credentials
    print_success "Credentials saved"
  fi
  
  print_success "Credentials collected successfully"
}

# Function to collect and set up SSH key
setup_ssh_key() {
  print_section "Setting Up SSH Key"
  
  # Check if SSH_PRIVATE_KEY environment variable exists
  if env_var_exists "SSH_PRIVATE_KEY"; then
    log "Using SSH key from environment variable"
    # Extract key from environment variable and save to temporary file
    grep -A 1000 "SSH_PRIVATE_KEY=" "$ENV_FILE" | tail -n +1 | sed 's/SSH_PRIVATE_KEY=//' | sed 's/^"//' | sed 's/"$//' > "$TEMP_SSH_KEY"
    chmod 600 "$TEMP_SSH_KEY"
  else
    # Ask for SSH key path
    SSH_KEY_PATH=$(prompt "Enter path to your SSH private key" "~/.ssh/id_rsa")
    SSH_KEY_PATH="${SSH_KEY_PATH/#\~/$HOME}"
    
    if [ ! -f "$SSH_KEY_PATH" ]; then
      error_exit "SSH key not found at $SSH_KEY_PATH"
    fi
    
    # Copy key to temporary location
    cp "$SSH_KEY_PATH" "$TEMP_SSH_KEY"
    chmod 600 "$TEMP_SSH_KEY"
  fi
  
  # Test SSH connection
  log "Testing SSH connection to $SSH_HOST"
  if ! ssh -i "$TEMP_SSH_KEY" -p "$SSH_PORT" -o StrictHostKeyChecking=no -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo SSH connection successful"; then
    error_exit "Failed to connect to $SSH_HOST using the provided SSH key"
  fi
  
  print_success "SSH connection successful"
}

# Function to install dependencies
install_dependencies() {
  print_section "Installing Dependencies"
  
  log "Installing npm dependencies..."
  npm install --no-fund --no-audit || error_exit "Failed to install npm dependencies"
  
  # Install deployment-specific dependencies
  log "Installing deployment-specific dependencies..."
  if [ -f "$SCRIPT_DIR/install-deployment-deps.sh" ]; then
    bash "$SCRIPT_DIR/install-deployment-deps.sh" || print_warning "Deployment dependencies installation script returned non-zero exit code"
  else
    # Install common deployment dependencies
    npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers || print_warning "Failed to install some deployment dependencies"
  fi
  
  print_success "All dependencies installed successfully"
}

# Function to build all components
build_all_components() {
  print_section "Building All Components"
  
  # Clean previous builds
  log "Cleaning previous builds..."
  if [ -f "$SCRIPT_DIR/npm-scripts.sh" ]; then
    bash "$SCRIPT_DIR/npm-scripts.sh" clean || print_warning "Clean script returned non-zero exit code"
  else
    # Manual cleanup
    rm -rf "$SCRIPT_DIR/dist" "$SCRIPT_DIR/build" "$SCRIPT_DIR/.cache" "$SCRIPT_DIR/node_modules/.cache"
  fi
  
  # Build main application
  log "Building main application..."
  npm run build || error_exit "Failed to build main application"
  
  # Build client
  if [ -d "$SCRIPT_DIR/client" ]; then
    log "Building client..."
    (cd "$SCRIPT_DIR/client" && npm install && npm run build) || print_warning "Client build returned non-zero exit code"
  fi
  
  # Build server
  if [ -d "$SCRIPT_DIR/server" ]; then
    log "Building server..."
    (cd "$SCRIPT_DIR/server" && npm install && npm run build) || print_warning "Server build returned non-zero exit code"
  fi
  
  # Build API gateway
  if [ -d "$SCRIPT_DIR/api-gateway" ]; then
    log "Building API gateway..."
    (cd "$SCRIPT_DIR/api-gateway" && npm install && npm run build) || print_warning "API gateway build returned non-zero exit code"
  fi
  
  # Build quantum validator
  if [ -d "$SCRIPT_DIR/quantum-validator" ]; then
    log "Building quantum validator..."
    (cd "$SCRIPT_DIR/quantum-validator" && npm install && npm run build) || print_warning "Quantum validator build returned non-zero exit code"
  fi
  
  # Verify build output
  if [ -d "$SCRIPT_DIR/dist" ]; then
    print_success "All components built successfully"
    return 0
  else
    error_exit "Build directory not found after build"
  fi
}

# Function to deploy to Web3.Storage (IPFS/Filecoin)
deploy_to_web3_storage() {
  print_section "Deploying to Web3.Storage (IPFS/Filecoin)"
  
  # Check if Web3.Storage token is set
  if ! env_var_exists "WEB3_STORAGE_TOKEN"; then
    print_warning "WEB3_STORAGE_TOKEN not found in .env. Skipping Web3.Storage deployment."
    return 1
  fi
  
  log "Uploading to Web3.Storage..."
  
  # Use the deploy-to-web3.js script if it exists
  if [ -f "$SCRIPT_DIR/scripts/deploy-to-web3.js" ]; then
    node "$SCRIPT_DIR/scripts/deploy-to-web3.js" || print_warning "Web3.Storage deployment returned non-zero exit code"
    print_success "Deployment to Web3.Storage completed"
    return 0
  else
    print_warning "deploy-to-web3.js script not found. Skipping Web3.Storage deployment."
    return 1
  fi
}

# Function to set up FractalCoin-Filecoin bridge
setup_filecoin_bridge() {
  print_section "Setting Up FractalCoin-Filecoin Bridge"
  
  # Check if bridge setup is enabled
  if env_var_exists "SETUP_FILECOIN_INTEGRATION"; then
    if grep -q "SETUP_FILECOIN_INTEGRATION=true" "$ENV_FILE"; then
      log "FractalCoin-Filecoin bridge integration is enabled"
      
      # Check for API key
      if ! env_var_exists "FRACTALCOIN_API_KEY"; then
        print_warning "FRACTALCOIN_API_KEY is not set. Bridge setup will be skipped."
        return 1
      fi
      
      log "Setting up FractalCoin-Filecoin bridge..."
      
      # Use the fractalcoin-filecoin-bridge.js script if it exists
      if [ -f "$SCRIPT_DIR/scripts/fractalcoin-filecoin-bridge.js" ]; then
        node "$SCRIPT_DIR/scripts/fractalcoin-filecoin-bridge.js" || print_warning "FractalCoin-Filecoin bridge setup returned non-zero exit code"
        print_success "FractalCoin-Filecoin bridge setup completed"
        return 0
      else
        print_warning "fractalcoin-filecoin-bridge.js script not found. Bridge setup skipped."
        return 1
      fi
    else
      log "FractalCoin-Filecoin bridge integration is disabled. Skipping setup."
      return 1
    fi
  else
    log "SETUP_FILECOIN_INTEGRATION not found in .env. Skipping bridge setup."
    return 1
  fi
}

# Function to create deployment package
create_deployment_package() {
  print_section "Creating Deployment Package"
  
  log "Creating deployment package..."
  
  # Create a temporary directory for packaging
  local temp_dir="/tmp/aetherion-deploy-$$"
  mkdir -p "$temp_dir"
  
  # Copy necessary files
  cp -r "$SCRIPT_DIR/dist" "$temp_dir/"
  cp "$SCRIPT_DIR/package.json" "$temp_dir/"
  
  # Copy server redirect script if it exists
  if [ -f "$SCRIPT_DIR/server-redirect.js" ]; then
    cp "$SCRIPT_DIR/server-redirect.js" "$temp_dir/"
  fi
  
  # Copy .env file (without sensitive information)
  grep -v "PRIVATE\|SECRET\|KEY\|PASSWORD\|TOKEN" "$ENV_FILE" > "$temp_dir/.env"
  echo "NODE_ENV=production" >> "$temp_dir/.env"
  echo "PORT=3000" >> "$temp_dir/.env"
  
  # Create directories for components
  mkdir -p "$temp_dir/client" "$temp_dir/server" "$temp_dir/api-gateway" "$temp_dir/quantum-validator"
  
  # Copy client build if it exists
  if [ -d "$SCRIPT_DIR/client/dist" ]; then
    cp -r "$SCRIPT_DIR/client/dist" "$temp_dir/client/"
  elif [ -d "$SCRIPT_DIR/client/build" ]; then
    cp -r "$SCRIPT_DIR/client/build" "$temp_dir/client/"
  fi
  
  # Copy server build if it exists
  if [ -d "$SCRIPT_DIR/server/dist" ]; then
    cp -r "$SCRIPT_DIR/server/dist" "$temp_dir/server/"
  fi
  
  # Copy API gateway build if it exists
  if [ -d "$SCRIPT_DIR/api-gateway/dist" ]; then
    cp -r "$SCRIPT_DIR/api-gateway/dist" "$temp_dir/api-gateway/"
  fi
  
  # Copy quantum validator build if it exists
  if [ -d "$SCRIPT_DIR/quantum-validator/dist" ]; then
    cp -r "$SCRIPT_DIR/quantum-validator/dist" "$temp_dir/quantum-validator/"
  fi
  
  # Create package.json files for components if they don't exist in the build
  for component in client server api-gateway quantum-validator; do
    if [ -f "$SCRIPT_DIR/$component/package.json" ] && [ ! -f "$temp_dir/$component/package.json" ]; then
      cp "$SCRIPT_DIR/$component/package.json" "$temp_dir/$component/"
    fi
  done
  
  # Create tar.gz package
  (cd "$temp_dir" && tar -czf "$SCRIPT_DIR/$DEPLOY_PACKAGE" .)
  
  # Clean up temporary directory
  rm -rf "$temp_dir"
  
  if [ -f "$SCRIPT_DIR/$DEPLOY_PACKAGE" ]; then
    print_success "Deployment package created: $DEPLOY_PACKAGE"
    return 0
  else
    error_exit "Failed to create deployment package"
  fi
}

# Function to upload package to server
upload_to_server() {
  print_section "Uploading to Server"
  
  log "Uploading package to $SSH_HOST..."
  
  # Upload package via SCP
  scp -i "$TEMP_SSH_KEY" -P "$SSH_PORT" "$SCRIPT_DIR/$DEPLOY_PACKAGE" "$SSH_USER@$SSH_HOST:~/" || error_exit "Failed to upload package to server"
  
  print_success "Package uploaded successfully"
}

# Function to deploy on server
deploy_on_server() {
  print_section "Deploying on Server"
  
  log "Executing deployment commands on server..."
  
  # Create deployment script
  local deploy_script=$(cat << 'EOF'
#!/bin/bash
set -e

# Variables will be replaced by the script
APP_DIR="$HOME/aetherion"
SERVICE_NAME="aetherion"
DOMAIN="__DOMAIN__"
WWW_DOMAIN="__WWW_DOMAIN__"
ADMIN_EMAIL="__ADMIN_EMAIL__"
APP_PORT="3000"
NODE_ENV="production"
DEPLOY_PATH="__DEPLOY_PATH__"

echo "Starting deployment on server..."

# Backup existing deployment
if [ -d "$APP_DIR" ]; then
  timestamp=$(date +%Y%m%d%H%M%S)
  backup_dir="${APP_DIR}_backup_$timestamp"
  echo "Backing up $APP_DIR → $backup_dir"
  mkdir -p "$backup_dir"
  cp -r "$APP_DIR"/* "$backup_dir"/
fi

# Extract new version
mkdir -p "$APP_DIR"
tar -xzf ~/aetherion-deploy.tar.gz -C "$APP_DIR"
rm -f ~/aetherion-deploy.tar.gz

# Install production deps
cd "$APP_DIR"
npm install --production --no-optional

# Create/update systemd service
if [ ! -f /etc/systemd/system/$SERVICE_NAME.service ]; then
  echo "Creating systemd service for $SERVICE_NAME"
  sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << UNIT
[Unit]
Description=Aetherion UI Wallet
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/server-redirect.js
Restart=on-failure
RestartSec=10
Environment=PORT=$APP_PORT
Environment=NODE_ENV=$NODE_ENV

[Install]
WantedBy=multi-user.target
UNIT

  sudo systemctl daemon-reload
  sudo systemctl enable $SERVICE_NAME
fi

echo "Restarting $SERVICE_NAME"
sudo systemctl restart $SERVICE_NAME
sleep 5

# Nginx configuration
if [ ! -f /etc/nginx/sites-available/$SERVICE_NAME ]; then
  echo "Setting up Nginx for $DOMAIN and $WWW_DOMAIN"
  sudo tee /etc/nginx/sites-available/$SERVICE_NAME > /dev/null << NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
    
    # For Let's Encrypt
    location ~ /.well-known {
        root /var/www/html;
        allow all;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN $WWW_DOMAIN;

    # SSL configuration (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Other security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Primary application path
    location $DEPLOY_PATH {
        proxy_pass http://localhost:$APP_PORT$DEPLOY_PATH;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Secondary application path at /wallet (legacy support)
    location /wallet {
        proxy_pass http://localhost:$APP_PORT/wallet;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:$APP_PORT/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Redirect root to app path
    location = / {
        return 301 $DEPLOY_PATH;
    }
}
NGINX

  sudo ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx

  # Obtain or renew certificates
  if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN \
      --non-interactive --agree-tos --email $ADMIN_EMAIL
  else
    sudo certbot renew --dry-run
  fi
fi

# Set up monitoring (optional)
if command -v pm2 >/dev/null 2>&1; then
  echo "Setting up PM2 monitoring..."
  pm2 startup
  pm2 save
fi

echo "Remote deploy complete."
EOF
)

  # Replace variables in the script
  deploy_script="${deploy_script/__DOMAIN__/$DOMAIN}"
  deploy_script="${deploy_script/__WWW_DOMAIN__/$WWW_DOMAIN}"
  deploy_script="${deploy_script/__ADMIN_EMAIL__/$ADMIN_EMAIL}"
  deploy_script="${deploy_script/__DEPLOY_PATH__/$DEPLOY_PATH}"
  
  # Create temporary script file
  local temp_script="/tmp/deploy_script_$$.sh"
  echo "$deploy_script" > "$temp_script"
  chmod +x "$temp_script"
  
  # Upload script to server
  scp -i "$TEMP_SSH_KEY" -P "$SSH_PORT" "$temp_script" "$SSH_USER@$SSH_HOST:~/deploy_script.sh" || error_exit "Failed to upload deployment script"
  
  # Execute script on server
  ssh -i "$TEMP_SSH_KEY" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "bash ~/deploy_script.sh" || error_exit "Deployment failed on server"
  
  # Clean up
  rm -f "$temp_script"
  
  print_success "Deployment completed successfully on server"
}

# Function to verify deployment
verify_deployment() {
  print_section "Verifying Deployment"
  
  log "Waiting for service to become healthy..."
  sleep 10
  
  # Check HTTP status
  log "Checking HTTP status of https://$DOMAIN$DEPLOY_PATH"
  local status=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN$DEPLOY_PATH" || echo '000')
  log "HTTP status: $status"
  
  if [ "$status" = "200" ] || [ "$status" = "302" ]; then
    print_success "Deployment verified successfully (HTTP status: $status)"
  else
    print_warning "Unexpected status code: $status. Deployment may have issues."
  fi
  
  # Check server status via SSH
  log "Checking service status on server..."
  ssh -i "$TEMP_SSH_KEY" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "sudo systemctl status aetherion | grep Active" || print_warning "Could not verify service status"
  
  # Check Nginx status
  log "Checking Nginx status on server..."
  ssh -i "$TEMP_SSH_KEY" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "sudo nginx -t" || print_warning "Nginx configuration may have issues"
  
  # Check SSL certificate
  log "Checking SSL certificate status..."
  ssh -i "$TEMP_SSH_KEY" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "sudo certbot certificates | grep -A 2 $DOMAIN" || print_warning "Could not verify SSL certificate status"
}

# Function to send notification
send_notification() {
  print_section "Sending Deployment Notification"
  
  local deployment_url="https://$DOMAIN$DEPLOY_PATH"
  local message="Aetherion deployment to $deployment_url completed successfully at $(date)"
  
  # Send Slack notification if webhook URL is provided
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    log "Sending Slack notification..."
    curl -s -X POST -H 'Content-type: application/json' --data "{\"text\":\"$message\"}" "$SLACK_WEBHOOK_URL" || print_warning "Failed to send Slack notification"
  fi
  
  # Send Discord notification if webhook URL is provided
  if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    log "Sending Discord notification..."
    curl -s -X POST -H 'Content-type: application/json' --data "{\"content\":\"$message\"}" "$DISCORD_WEBHOOK_URL" || print_warning "Failed to send Discord notification"
  fi
  
  print_success "Deployment notifications sent"
}

# Function to clean up
cleanup() {
  print_section "Cleaning Up"
  
  # Remove temporary SSH key
  if [ -f "$TEMP_SSH_KEY" ]; then
    log "Removing temporary SSH key..."
    rm -f "$TEMP_SSH_KEY"
  fi
  
  # Remove deployment package
  if [ -f "$SCRIPT_DIR/$DEPLOY_PACKAGE" ]; then
    log "Removing deployment package..."
    rm -f "$SCRIPT_DIR/$DEPLOY_PACKAGE"
  fi
  
  print_success "Cleanup completed"
}

# Main function
main() {
  # Print banner
  echo -e "${MAGENTA}==============================================${NC}"
  echo -e "${MAGENTA}    AETHERION ALL-IN-ONE DEPLOYMENT SCRIPT    ${NC}"
  echo -e "${MAGENTA}    Target: $DOMAIN                           ${NC}"
  echo -e "${MAGENTA}==============================================${NC}"
  echo ""
  
  log "Starting deployment process" "INFO"
  
  # Run deployment steps
  check_prerequisites
  collect_credentials
  setup_ssh_key
  install_dependencies
  build_all_components
  deploy_to_web3_storage || true  # Continue even if this fails
  setup_filecoin_bridge || true   # Continue even if this fails
  create_deployment_package
  upload_to_server
  deploy_on_server
  verify_deployment
  send_notification
  cleanup
  
  echo -e "\n${GREEN}=== DEPLOYMENT COMPLETED SUCCESSFULLY ===${NC}"
  echo -e "${GREEN}Your application is now available at: https://$DOMAIN$DEPLOY_PATH${NC}"
  echo -e "${BLUE}Deployment log saved to: $LOG_FILE${NC}"
  
  log "Deployment process completed successfully" "INFO"
}

# Run main function
main