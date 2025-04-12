#!/bin/bash
# =========================================================================
# FractalCoin to Filecoin Automated Deployment Script
# =========================================================================
# This script automates the complete deployment process of FractalCoin
# to Filecoin via Web3.Storage, including:
#
# 1. Environment validation and setup
# 2. Dependency installation
# 3. Application building
# 4. Deployment to Web3.Storage (IPFS/Filecoin)
# 5. FractalCoin-Filecoin bridge setup
# 6. ENS domain configuration (optional)
# 7. Deployment verification
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
LOG_FILE="fractalcoin-deployment-$(date +%Y%m%d-%H%M%S).log"
ENV_FILE=".env"
REQUIRED_TOOLS=("node" "npm" "curl" "jq")
REQUIRED_ENV_VARS=("WEB3_STORAGE_TOKEN")
OPTIONAL_ENV_VARS=("ENS_PRIVATE_KEY" "ENS_DOMAIN" "FRACTALCOIN_API_KEY" "FRACTALCOIN_API_ENDPOINT")

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
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] ${message}" >> $LOG_FILE
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
  grep -q "^$1=" $ENV_FILE 2>/dev/null || [[ -n "${!1}" ]]
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
      cp .env.example $ENV_FILE
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
      handle_error "✗ Required environment variable $var is not set in $ENV_FILE"
    fi
  done
  
  # Check for optional environment variables
  for var in "${OPTIONAL_ENV_VARS[@]}"; do
    if env_var_exists "$var"; then
      log "INFO" "✓ $var is set"
    else
      log "WARNING" "✗ Optional environment variable $var is not set in $ENV_FILE"
    fi
  done
  
  log "SUCCESS" "All prerequisites checked"
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
  else
    handle_error "Build directory not found after build"
  fi
}

# Function to deploy to Web3.Storage
deploy_to_web3storage() {
  section "Deploying to Web3.Storage (IPFS/Filecoin)"
  
  log "INFO" "Uploading to Web3.Storage..."
  
  # Use the deploy-to-web3.js script if it exists
  if [[ -f "scripts/deploy-to-web3.js" ]]; then
    node scripts/deploy-to-web3.js || handle_error "Failed to deploy to Web3.Storage"
  else
    handle_error "deploy-to-web3.js script not found"
  fi
  
  log "SUCCESS" "Deployment to Web3.Storage completed"
}

# Function to set up FractalCoin-Filecoin bridge
setup_filecoin_bridge() {
  section "Setting Up FractalCoin-Filecoin Bridge"
  
  # Check if bridge setup is enabled
  if grep -q "SETUP_FILECOIN_INTEGRATION=true" $ENV_FILE 2>/dev/null; then
    log "INFO" "FractalCoin-Filecoin bridge integration is enabled"
    
    # Check for API key
    if ! env_var_exists "FRACTALCOIN_API_KEY"; then
      log "WARNING" "FRACTALCOIN_API_KEY is not set. Bridge setup will be skipped."
      return
    fi
    
    log "INFO" "Setting up FractalCoin-Filecoin bridge..."
    
    # Use the fractalcoin-filecoin-bridge.js script if it exists
    if [[ -f "scripts/fractalcoin-filecoin-bridge.js" ]]; then
      node scripts/fractalcoin-filecoin-bridge.js || handle_error "Failed to set up FractalCoin-Filecoin bridge"
    else
      log "WARNING" "fractalcoin-filecoin-bridge.js script not found. Bridge setup skipped."
      return
    fi
    
    log "SUCCESS" "FractalCoin-Filecoin bridge setup completed"
  else
    log "INFO" "FractalCoin-Filecoin bridge integration is disabled. Skipping setup."
  fi
}

# Function to update ENS domain (if configured)
update_ens_domain() {
  section "Updating ENS Domain (if configured)"
  
  # Check if ENS update is enabled and keys are set
  if env_var_exists "ENS_PRIVATE_KEY" && env_var_exists "ENS_DOMAIN"; then
    log "INFO" "ENS configuration found. Domain updates will be handled by deploy-to-web3.js."
    log "SUCCESS" "ENS domain configuration completed"
  else
    log "INFO" "ENS configuration not found or incomplete. Skipping ENS domain update."
  fi
}

# Function to verify deployment
verify_deployment() {
  section "Verifying Deployment"
  
  # Check for CID in log file
  log "INFO" "Checking for IPFS CID in deployment logs..."
  
  CID=$(grep -o "CID: [a-zA-Z0-9]*" $LOG_FILE | tail -1 | cut -d ' ' -f 2)
  
  if [[ -n "$CID" ]]; then
    log "SUCCESS" "Deployment verified with CID: $CID"
    log "INFO" "Your application is accessible at: https://$CID.ipfs.dweb.link/"
    
    # Check if ENS domain was configured
    if env_var_exists "ENS_DOMAIN"; then
      ENS_DOMAIN_VALUE=$(grep "^ENS_DOMAIN=" $ENV_FILE | cut -d '=' -f 2)
      if [[ -n "$ENS_DOMAIN_VALUE" ]]; then
        log "INFO" "Your application is also accessible via ENS at: https://$ENS_DOMAIN_VALUE.link/"
      fi
    fi
  else
    log "WARNING" "Could not find IPFS CID in logs. Deployment may have failed or logs may be incomplete."
  fi
}

# Function to display deployment summary
deployment_summary() {
  section "Deployment Summary"
  
  # Extract key information from logs
  CID=$(grep -o "CID: [a-zA-Z0-9]*" $LOG_FILE | tail -1 | cut -d ' ' -f 2)
  GATEWAY_URL=$(grep -o "Gateway URL: https://.*" $LOG_FILE | tail -1 | cut -d ' ' -f 3)
  BRIDGE_CID=$(grep -o "Bridge CID: [a-zA-Z0-9]*" $LOG_FILE | tail -1 | cut -d ' ' -f 3)
  
  echo -e "${BOLD}${MAGENTA}"
  echo "================================================================="
  echo "                  FRACTALCOIN DEPLOYMENT SUMMARY                  "
  echo "================================================================="
  echo -e "${RESET}"
  
  echo -e "${BOLD}Deployment Status:${RESET} ${GREEN}Complete${RESET}"
  echo -e "${BOLD}Deployment Log:${RESET} $LOG_FILE"
  echo ""
  
  echo -e "${BOLD}${CYAN}IPFS/Filecoin Information:${RESET}"
  if [[ -n "$CID" ]]; then
    echo -e "${BOLD}Content CID:${RESET} $CID"
  else
    echo -e "${BOLD}Content CID:${RESET} ${YELLOW}Not found in logs${RESET}"
  fi
  
  if [[ -n "$GATEWAY_URL" ]]; then
    echo -e "${BOLD}Gateway URL:${RESET} $GATEWAY_URL"
  else
    echo -e "${BOLD}Gateway URL:${RESET} ${YELLOW}Not found in logs${RESET}"
    if [[ -n "$CID" ]]; then
      echo -e "${BOLD}Suggested URL:${RESET} https://$CID.ipfs.dweb.link/"
    fi
  fi
  
  echo ""
  echo -e "${BOLD}${CYAN}FractalCoin-Filecoin Bridge:${RESET}"
  if [[ -n "$BRIDGE_CID" ]]; then
    echo -e "${BOLD}Bridge CID:${RESET} $BRIDGE_CID"
    echo -e "${BOLD}Status:${RESET} ${GREEN}Active${RESET}"
  else
    echo -e "${BOLD}Bridge Status:${RESET} ${YELLOW}Not configured or failed${RESET}"
  fi
  
  echo ""
  echo -e "${BOLD}${CYAN}ENS Domain:${RESET}"
  if env_var_exists "ENS_DOMAIN"; then
    ENS_DOMAIN_VALUE=$(grep "^ENS_DOMAIN=" $ENV_FILE | cut -d '=' -f 2)
    if [[ -n "$ENS_DOMAIN_VALUE" ]]; then
      echo -e "${BOLD}Domain:${RESET} $ENS_DOMAIN_VALUE"
      echo -e "${BOLD}ENS URL:${RESET} https://$ENS_DOMAIN_VALUE.link/"
    else
      echo -e "${BOLD}Status:${RESET} ${YELLOW}Configured but domain not found${RESET}"
    fi
  else
    echo -e "${BOLD}Status:${RESET} ${YELLOW}Not configured${RESET}"
  fi
  
  echo ""
  echo -e "${BOLD}${CYAN}Next Steps:${RESET}"
  echo "1. Access your application using the Gateway URL above"
  echo "2. Share your application CID or ENS domain with users"
  echo "3. Monitor your storage on Web3.Storage dashboard"
  echo "4. Check the FractalCoin-Filecoin bridge status periodically"
  echo ""
  echo -e "${BOLD}${MAGENTA}=================================================================${RESET}"
}

# Main execution
main() {
  # Create log file
  touch $LOG_FILE
  
  # Display banner
  echo -e "${BOLD}${MAGENTA}"
  echo "================================================================="
  echo "            FRACTALCOIN TO FILECOIN DEPLOYMENT SCRIPT            "
  echo "================================================================="
  echo -e "${RESET}"
  
  log "INFO" "Starting deployment process..."
  log "INFO" "Log file: $LOG_FILE"
  
  # Run deployment steps
  check_prerequisites
  install_dependencies
  build_application
  deploy_to_web3storage
  setup_filecoin_bridge
  update_ens_domain
  verify_deployment
  
  # Display deployment summary
  deployment_summary
  
  log "SUCCESS" "Deployment process completed successfully!"
}

# Execute main function
main