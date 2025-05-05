#!/bin/bash
# =============================================================================
# Aetherion Ecosystem Deployment Script for atc.aifreedomtrust.com
# =============================================================================
# This script automates the deployment of the Aetherion Ecosystem to 
# atc.aifreedomtrust.com via cPanel terminal
# 
# Usage: ./deploy-to-cpanel.sh [--github | --package]
#   --github: Deploy from GitHub repository
#   --package: Deploy from local package (default)
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

# Configuration variables - MODIFY THESE
DEPLOY_PATH="$HOME/public_html/atc"
DOMAIN="atc.aifreedomtrust.com"
GITHUB_REPO="https://github.com/yourusername/aetherion-ecosystem.git"
GITHUB_BRANCH="main"
PACKAGE_NAME="aetherion-ecosystem-deployment.tar.gz"
NODE_VERSION="18"  # Node.js version to use
APPLICATION_PORT="3000"  # Port the application will run on

# API Keys - Replace with your actual keys or leave empty
OPENAI_API_KEY=""
STRIPE_SECRET_KEY=""

# Print banner
print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "┌─────────────────────────────────────────────────┐"
  echo "│         Aetherion Ecosystem Deployment          │"
  echo "│                                                 │"
  echo "│            Target: $DOMAIN            │"
  echo "└─────────────────────────────────────────────────┘"
  echo -e "${RESET}"
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

# Check requirements
check_requirements() {
  print_section "Checking requirements"
  
  # Check if we're in a cPanel environment
  if [ ! -d "/usr/local/cpanel" ] && [ ! -f "$HOME/.cpanel/contactinfo" ]; then
    print_warning "This doesn't appear to be a cPanel environment. Some features may not work as expected."
  else
    print_success "cPanel environment detected"
  fi
  
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
  
  # Check if git is installed (required for GitHub deployment)
  if [ "$DEPLOY_FROM" == "github" ]; then
    if command_exists git; then
      GIT_VERSION=$(git --version | cut -d ' ' -f 3)
      print_success "git is installed (version $GIT_VERSION)"
    else
      print_error "git is not installed and is required for GitHub deployment."
      exit 1
    fi
  fi
  
  # Check if pm2 is installed
  if command_exists pm2; then
    PM2_VERSION=$(pm2 -v)
    print_success "PM2 is installed (version $PM2_VERSION)"
  else
    print_warning "PM2 is not installed. It will be installed globally during deployment."
  fi
}

# Create directories
create_directories() {
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
backup_existing() {
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

# Deploy from GitHub
deploy_from_github() {
  print_section "Deploying from GitHub"
  
  # Navigate to deployment directory
  cd "$DEPLOY_PATH"
  
  # Check if git repository exists
  if [ -d ".git" ]; then
    print_info "Git repository already exists. Pulling latest changes..."
    
    # Reset any local changes
    git reset --hard HEAD
    
    # Pull latest changes
    if git pull origin "$GITHUB_BRANCH"; then
      print_success "Pulled latest changes from $GITHUB_BRANCH branch"
    else
      print_error "Failed to pull latest changes. Check repository and credentials."
      exit 1
    fi
  else
    print_info "Cloning repository..."
    
    # Clone repository
    if git clone --branch "$GITHUB_BRANCH" "$GITHUB_REPO" .; then
      print_success "Cloned repository: $GITHUB_REPO ($GITHUB_BRANCH branch)"
    else
      print_error "Failed to clone repository. Check repository URL and credentials."
      exit 1
    fi
  fi
}

# Deploy from package
deploy_from_package() {
  print_section "Deploying from package"
  
  # Check if package exists in current directory or home directory
  PACKAGE_PATH=""
  if [ -f "./$PACKAGE_NAME" ]; then
    PACKAGE_PATH="./$PACKAGE_NAME"
  elif [ -f "$HOME/$PACKAGE_NAME" ]; then
    PACKAGE_PATH="$HOME/$PACKAGE_NAME"
  else
    print_error "Package not found: $PACKAGE_NAME"
    print_info "Please upload the package to your home directory or current directory."
    exit 1
  fi
  
  print_info "Found package: $PACKAGE_PATH"
  
  # Extract package to deployment directory
  print_info "Extracting package to $DEPLOY_PATH..."
  
  if [[ "$PACKAGE_NAME" == *.tar.gz ]] || [[ "$PACKAGE_NAME" == *.tgz ]]; then
    tar -xzf "$PACKAGE_PATH" -C "$DEPLOY_PATH"
  elif [[ "$PACKAGE_NAME" == *.zip ]]; then
    unzip -q "$PACKAGE_PATH" -d "$DEPLOY_PATH"
  else
    print_error "Unsupported package format. Only .tar.gz, .tgz, and .zip are supported."
    exit 1
  fi
  
  print_success "Extracted package to $DEPLOY_PATH"
}

# Configure environment
configure_environment() {
  print_section "Configuring environment"
  
  # Navigate to deployment directory
  cd "$DEPLOY_PATH"
  
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

# Install dependencies
install_dependencies() {
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

# Start application
start_application() {
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

# Verify deployment
verify_deployment() {
  print_section "Verifying deployment"
  
  # Check if the application is running
  if pm2 list | grep -q "aetherion-ecosystem" | grep -q "online"; then
    print_success "Application is running in PM2"
  else
    print_error "Application is not running or has an error"
    exit 1
  fi
  
  # Check if the application is responding
  print_info "Checking application health endpoint..."
  
  if curl -s "http://localhost:$APPLICATION_PORT/api/health" | grep -q "ok"; then
    print_success "Application is responding to health check"
  else
    print_warning "Application is not responding to health check. Check logs for errors."
  fi
  
  # Display PM2 logs
  print_info "Recent application logs:"
  pm2 logs aetherion-ecosystem --lines 10
}

# Display completion message
display_completion() {
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
  
  echo -e "\n${MAGENTA}Thank you for using the Aetherion Ecosystem Deployment Script!${RESET}"
}

# Main function
main() {
  # Parse command-line arguments
  DEPLOY_FROM="package"  # Default to package deployment
  
  while [[ "$#" -gt 0 ]]; do
    case $1 in
      --github) DEPLOY_FROM="github" ;;
      --package) DEPLOY_FROM="package" ;;
      *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
  done
  
  # Print banner
  print_banner
  
  # Ask for API keys if not provided
  if [ -z "$OPENAI_API_KEY" ]; then
    read -p "Enter your OpenAI API key (leave blank if not using OpenAI): " OPENAI_API_KEY
  fi
  
  if [ -z "$STRIPE_SECRET_KEY" ]; then
    read -p "Enter your Stripe Secret key (leave blank if not using Stripe): " STRIPE_SECRET_KEY
  fi
  
  # Confirm deployment
  if ! confirm "Deploy Aetherion Ecosystem to $DOMAIN?"; then
    print_info "Deployment canceled."
    exit 0
  fi
  
  # Run deployment steps
  check_requirements
  create_directories
  backup_existing
  
  if [ "$DEPLOY_FROM" == "github" ]; then
    deploy_from_github
  else
    deploy_from_package
  fi
  
  configure_environment
  install_dependencies
  start_application
  verify_deployment
  display_completion
}

# Run main function
main "$@"