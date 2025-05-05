#!/bin/bash
# =============================================================================
# Aetherion Ecosystem All-in-One Deployment Script
# =============================================================================
# This script automates both package creation and deployment to cPanel
# It can be run in both Replit and cPanel environments
# =============================================================================

# Text formatting
BOLD="\e[1m"
RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
BLUE="\e[34m"
MAGENTA="\e[35m"
CYAN="\e[36m"
RESET="\e[0m"

# Configuration - MODIFY THESE
DEPLOY_PATH="$HOME/public_html/atc"
DOMAIN="atc.aifreedomtrust.com"
GITHUB_REPO="https://github.com/yourusername/aetherion-ecosystem.git"
GITHUB_BRANCH="main"
NODE_VERSION="18"
APPLICATION_PORT="3000"

# API Keys - Replace with your actual keys or leave empty to be prompted
OPENAI_API_KEY=""
STRIPE_SECRET_KEY=""

# Detect environment (Replit or cPanel)
if [ -d "/home/runner" ] || [ -f "/.replit" ]; then
  ENVIRONMENT="replit"
elif [ -d "/usr/local/cpanel" ] || [ -f "$HOME/.cpanel/contactinfo" ]; then
  ENVIRONMENT="cpanel"
else
  ENVIRONMENT="unknown"
fi

# Print banner
print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "┌─────────────────────────────────────────────────┐"
  echo "│     Aetherion Ecosystem All-in-One Deployment   │"
  echo "│                                                 │"
  echo "│            Target: $DOMAIN            │"
  echo "└─────────────────────────────────────────────────┘"
  echo -e "${RESET}"
  
  if [ "$ENVIRONMENT" == "replit" ]; then
    echo -e "${YELLOW}Running in Replit environment${RESET}"
  elif [ "$ENVIRONMENT" == "cpanel" ]; then
    echo -e "${YELLOW}Running in cPanel environment${RESET}"
  else
    echo -e "${YELLOW}Running in unknown environment${RESET}"
  fi
}

# Print section header
print_section() {
  echo -e "\n${BLUE}${BOLD}▶ $1${RESET}\n"
}

# Print success message
print_success() {
  echo -e "${GREEN}✓ $1${RESET}"
}

# Print error message
print_error() {
  echo -e "${RED}✗ $1${RESET}"
}

# Print warning message
print_warning() {
  echo -e "${YELLOW}! $1${RESET}"
}

# Print info message
print_info() {
  echo -e "${CYAN}ℹ $1${RESET}"
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Ask for confirmation
confirm() {
  read -p "$1 (y/n) " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

# Create package in Replit environment
create_package_replit() {
  print_section "Creating deployment package in Replit"
  
  # Create the output directory
  PACKAGE_DIR="deployment-package"
  mkdir -p "$PACKAGE_DIR"
  print_success "Created output directory: $PACKAGE_DIR"
  
  # Generate timestamp for package name
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  PACKAGE_NAME="aetherion-ecosystem-$TIMESTAMP.tar.gz"
  PACKAGE_PATH="$PACKAGE_DIR/$PACKAGE_NAME"
  
  # Files to include in the package
  INCLUDE_FILES=(
    "combined-server.js"
    "config.js"
    "api-modules.js"
    "error-handler.js"
    "package.json"
    "package-lock.json"
    ".env.example"
    "deploy-to-cpanel.sh"
    "DEPLOYMENT-GUIDE.md"
    "README.md"
    "client"
    "public"
    "server"
    "shared"
  )
  
  # Create exclude options for tar
  EXCLUDE_OPTS="--exclude='node_modules' --exclude='.git' --exclude='deployment-package'"
  
  # Create include list for tar
  INCLUDE_LIST=""
  for item in "${INCLUDE_FILES[@]}"; do
    if [ -e "$item" ]; then
      INCLUDE_LIST="$INCLUDE_LIST $item"
    else
      print_warning "File or directory not found: $item (will be skipped)"
    fi
  done
  
  # Create example .env file if it doesn't exist
  if [ ! -f ".env.example" ]; then
    cat > .env.example << EOL
# Aetherion Ecosystem Environment Variables
# Copy this file to .env and adjust values as needed

# Server configuration
NODE_ENV=production
PORT=$APPLICATION_PORT
PUBLIC_URL=https://$DOMAIN

# API Keys (add your actual keys in production)
# OPENAI_API_KEY=sk_...
# STRIPE_SECRET_KEY=sk_...

# Database configuration (if using a database)
# DATABASE_URL=postgres://username:password@hostname:port/database
EOL
    print_success "Created example .env file"
  fi
  
  # Make sure deploy script is executable
  chmod +x deploy-to-cpanel.sh
  print_success "Made deployment script executable"
  
  # Create the package
  print_info "Creating package (this may take a moment)..."
  tar -czf "$PACKAGE_PATH" $EXCLUDE_OPTS $INCLUDE_LIST
  
  if [ -f "$PACKAGE_PATH" ]; then
    print_success "Created package: $PACKAGE_PATH"
    print_info "Package size: $(du -h "$PACKAGE_PATH" | cut -f1)"
    
    echo -e "\n${GREEN}${BOLD}Package created successfully!${RESET}"
    echo -e "${YELLOW}To complete deployment:${RESET}"
    echo -e "1. Download the package from Replit: $PACKAGE_PATH"
    echo -e "2. Upload it to your cPanel server"
    echo -e "3. Extract it on cPanel: tar -xzf $PACKAGE_NAME"
    echo -e "4. Run the deployment script: ./deploy-to-cpanel.sh"
  else
    print_error "Failed to create package"
    exit 1
  fi
}

# Check requirements in cPanel environment
check_requirements_cpanel() {
  print_section "Checking requirements"
  
  # Check if Node.js is installed
  if command_exists node; then
    NODE_CURRENT_VERSION=$(node -v | cut -d 'v' -f 2)
    print_success "Node.js is installed (version $NODE_CURRENT_VERSION)"
    
    # Check if Node.js version matches desired version
    if [[ "$NODE_CURRENT_VERSION" != $NODE_VERSION* ]]; then
      print_warning "Node.js version $NODE_CURRENT_VERSION detected, but version $NODE_VERSION is recommended."
      
      if command_exists nvm; then
        if confirm "Do you want to switch to Node.js version $NODE_VERSION using NVM?"; then
          nvm install $NODE_VERSION
          nvm use $NODE_VERSION
          print_success "Switched to Node.js version $NODE_VERSION"
        fi
      else
        print_warning "NVM not found. Please ask your hosting provider to install Node.js version $NODE_VERSION."
      fi
    fi
  else
    print_error "Node.js is not installed. Please install Node.js version $NODE_VERSION or ask your hosting provider to install it."
    exit 1
  fi
  
  # Check if npm is installed
  if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed (version $NPM_VERSION)"
  else
    print_error "npm is not installed. It should come with Node.js."
    exit 1
  fi
  
  # Check if pm2 is installed
  if command_exists pm2; then
    PM2_VERSION=$(pm2 -v)
    print_success "PM2 is installed (version $PM2_VERSION)"
  else
    print_warning "PM2 is not installed. It will be installed globally during deployment."
  fi
}

# Create directories in cPanel environment
create_directories_cpanel() {
  print_section "Creating directories"
  
  # Create deployment directory if it doesn't exist
  if [ ! -d "$DEPLOY_PATH" ]; then
    mkdir -p "$DEPLOY_PATH"
    print_success "Created deployment directory: $DEPLOY_PATH"
  else
    print_info "Deployment directory already exists: $DEPLOY_PATH"
  fi
  
  # Create logs and tmp directories
  mkdir -p "$DEPLOY_PATH/logs" "$DEPLOY_PATH/tmp"
  print_success "Created logs and tmp directories"
}

# Backup existing deployment
backup_existing_cpanel() {
  print_section "Backing up existing deployment"
  
  if [ -f "$DEPLOY_PATH/package.json" ]; then
    BACKUP_DIR="$HOME/backups"
    BACKUP_FILE="$BACKUP_DIR/aetherion-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Create backups directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create backup archive
    tar -czf "$BACKUP_FILE" -C "$DEPLOY_PATH" .
    
    print_success "Created backup: $BACKUP_FILE"
  else
    print_info "No existing deployment found to backup."
  fi
}

# Find and extract package
find_and_extract_package() {
  print_section "Finding and extracting package"
  
  # Look for aetherion-ecosystem-*.tar.gz in the current directory and home directory
  PACKAGE_PATH=""
  
  # Check current directory first
  CURRENT_PACKAGE=$(ls ./aetherion-ecosystem-*.tar.gz 2>/dev/null | head -1)
  if [ -n "$CURRENT_PACKAGE" ]; then
    PACKAGE_PATH="$CURRENT_PACKAGE"
  else
    # Check home directory
    HOME_PACKAGE=$(ls $HOME/aetherion-ecosystem-*.tar.gz 2>/dev/null | head -1)
    if [ -n "$HOME_PACKAGE" ]; then
      PACKAGE_PATH="$HOME_PACKAGE"
    fi
  fi
  
  if [ -n "$PACKAGE_PATH" ]; then
    print_success "Found package: $PACKAGE_PATH"
    
    # Extract to temporary directory
    TMP_DIR="$HOME/tmp_extract"
    mkdir -p "$TMP_DIR"
    
    print_info "Extracting package..."
    tar -xzf "$PACKAGE_PATH" -C "$TMP_DIR"
    
    # Copy files to deployment directory
    print_info "Copying files to deployment directory..."
    cp -r "$TMP_DIR"/* "$DEPLOY_PATH"
    
    # Cleanup
    rm -rf "$TMP_DIR"
    
    print_success "Extracted package to $DEPLOY_PATH"
    return 0
  else
    print_error "No package found. Please upload aetherion-ecosystem-*.tar.gz to your home directory."
    return 1
  fi
}

# Configure environment in cPanel
configure_environment_cpanel() {
  print_section "Configuring environment"
  
  # Navigate to deployment directory
  cd "$DEPLOY_PATH"
  
  # Prompt for API keys if not provided
  if [ -z "$OPENAI_API_KEY" ]; then
    read -p "Enter your OpenAI API key (leave blank if not using OpenAI): " OPENAI_API_KEY
  fi
  
  if [ -z "$STRIPE_SECRET_KEY" ]; then
    read -p "Enter your Stripe Secret key (leave blank if not using Stripe): " STRIPE_SECRET_KEY
  fi
  
  # Create .env file
  cat > .env << EOL
NODE_ENV=production
PORT=$APPLICATION_PORT
PUBLIC_URL=https://$DOMAIN
EOL

  # Add API keys if provided
  if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
  fi
  
  if [ ! -z "$STRIPE_SECRET_KEY" ]; then
    echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> .env
  fi
  
  print_success "Created .env file"
  
  # Create .htaccess file for Apache
  cat > .htaccess << EOL
# Aetherion Ecosystem .htaccess
# Proxy requests to Node.js application

RewriteEngine On
RewriteRule ^$ http://localhost:$APPLICATION_PORT/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:$APPLICATION_PORT/$1 [P,L]
EOL

  print_success "Created .htaccess file"
}

# Install dependencies in cPanel
install_dependencies_cpanel() {
  print_section "Installing dependencies"
  
  # Navigate to deployment directory
  cd "$DEPLOY_PATH"
  
  # Install PM2 globally if not already installed
  if ! command_exists pm2; then
    print_info "Installing PM2 globally..."
    npm install -g pm2
    print_success "Installed PM2 globally"
  fi
  
  # Install application dependencies
  print_info "Installing application dependencies (this may take a while)..."
  npm install --production
  
  print_success "Installed application dependencies"
}

# Start application in cPanel
start_application_cpanel() {
  print_section "Starting application"
  
  # Navigate to deployment directory
  cd "$DEPLOY_PATH"
  
  # Check if application is already running in PM2
  if pm2 list | grep -q "aetherion-ecosystem"; then
    print_info "Application is already running in PM2. Restarting..."
    pm2 restart aetherion-ecosystem
  else
    print_info "Starting application with PM2..."
    pm2 start combined-server.js --name "aetherion-ecosystem"
  fi
  
  print_success "Application is running with PM2"
  
  # Configure PM2 to start on server reboot
  print_info "Configuring PM2 to start on server reboot..."
  pm2 startup
  pm2 save
  
  print_success "PM2 configured to start on server reboot"
}

# Verify deployment in cPanel
verify_deployment_cpanel() {
  print_section "Verifying deployment"
  
  # Navigate to deployment directory
  cd "$DEPLOY_PATH"
  
  # Check if the application is running
  if pm2 list | grep -q "aetherion-ecosystem"; then
    print_success "Application is running in PM2"
  else
    print_error "Application is not running or has an error"
    exit 1
  fi
  
  # Check if the application is responding
  print_info "Checking application health endpoint..."
  
  HEALTH_CHECK=$(curl -s "http://localhost:$APPLICATION_PORT/api/health" 2>/dev/null)
  if [[ "$HEALTH_CHECK" == *"ok"* ]] || [[ "$HEALTH_CHECK" == *"UP"* ]]; then
    print_success "Application is responding to health check"
  else
    print_warning "Application is not responding to health check. Check logs for errors."
    print_info "Recent application logs:"
    pm2 logs aetherion-ecosystem --lines 10
  fi
}

# Display completion message in cPanel
display_completion_cpanel() {
  print_section "Deployment completed"
  
  echo -e "${GREEN}${BOLD}"
  echo "┌─────────────────────────────────────────────────┐"
  echo "│         Aetherion Ecosystem Deployed!           │"
  echo "│                                                 │"
  echo "│  Your application is now available at:          │"
  echo "│  https://$DOMAIN                      │"
  echo "└─────────────────────────────────────────────────┘"
  echo -e "${RESET}"
  
  echo -e "${CYAN}Additional URLs:${RESET}"
  echo "- Brand Showcase: https://$DOMAIN/brands"
  echo "- Aetherion Wallet: https://$DOMAIN/wallet"
  echo "- Third Application: https://$DOMAIN/app3"
  echo "- Status Page: https://$DOMAIN/status"
  echo "- API Health: https://$DOMAIN/api/health"
  
  echo -e "\n${CYAN}Useful commands:${RESET}"
  echo "- View logs: ${YELLOW}pm2 logs aetherion-ecosystem${RESET}"
  echo "- Restart app: ${YELLOW}pm2 restart aetherion-ecosystem${RESET}"
  echo "- Monitor app: ${YELLOW}pm2 monit${RESET}"
  
  echo -e "\n${MAGENTA}Thank you for using Aetherion Ecosystem All-in-One Deployment!${RESET}"
}

# Run deployment in Replit environment
run_replit_deployment() {
  print_banner
  
  if confirm "Create deployment package for cPanel?"; then
    create_package_replit
  else
    print_info "Package creation canceled."
    exit 0
  fi
}

# Run deployment in cPanel environment
run_cpanel_deployment() {
  print_banner
  
  if ! confirm "Deploy Aetherion Ecosystem to $DOMAIN?"; then
    print_info "Deployment canceled."
    exit 0
  fi
  
  # Run deployment steps
  check_requirements_cpanel
  create_directories_cpanel
  backup_existing_cpanel
  
  # Extract package
  if ! find_and_extract_package; then
    print_error "Package extraction failed. Aborting deployment."
    exit 1
  fi
  
  configure_environment_cpanel
  install_dependencies_cpanel
  start_application_cpanel
  verify_deployment_cpanel
  display_completion_cpanel
}

# Main function
main() {
  if [ "$ENVIRONMENT" == "replit" ]; then
    run_replit_deployment
  elif [ "$ENVIRONMENT" == "cpanel" ]; then
    run_cpanel_deployment
  else
    print_banner
    print_warning "Unknown environment detected."
    
    echo "Please select environment:"
    echo "1) Replit (Create package)"
    echo "2) cPanel (Deploy package)"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" == "1" ]; then
      ENVIRONMENT="replit"
      run_replit_deployment
    elif [ "$choice" == "2" ]; then
      ENVIRONMENT="cpanel"
      run_cpanel_deployment
    else
      print_error "Invalid choice."
      exit 1
    fi
  fi
}

# Run main function
main