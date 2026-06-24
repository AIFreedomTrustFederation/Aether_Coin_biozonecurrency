#!/bin/bash
# install-sync-deploy-service.sh
#
# This script installs the frontend repository synchronization and cPanel deployment service
# on the server.
#
# Usage: sudo ./install-sync-deploy-service.sh

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo"
  exit 1
fi

# Configuration
SOURCE_REPO="/path/to/Aether_Coin_biozonecurrency"
TARGET_REPO="/path/to/biozone-harmony-boost"
SERVICE_USER="your_username"
SERVICE_GROUP="your_group"
SLACK_WEBHOOK_URL="your_slack_webhook_url" # Optional
CPANEL_USERNAME="your_cpanel_username"
CPANEL_PASSWORD="your_cpanel_password"
CPANEL_HOST="your_cpanel_host"
CPANEL_DOMAIN="your_cpanel_domain"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to prompt for configuration
configure() {
  echo -e "${YELLOW}Frontend Repository Synchronization and cPanel Deployment Service Installation${NC}"
  echo "Please provide the following configuration:"
  
  read -p "Source repository path [${SOURCE_REPO}]: " input_source
  SOURCE_REPO=${input_source:-$SOURCE_REPO}
  
  read -p "Target repository path [${TARGET_REPO}]: " input_target
  TARGET_REPO=${input_target:-$TARGET_REPO}
  
  read -p "Service user [${SERVICE_USER}]: " input_user
  SERVICE_USER=${input_user:-$SERVICE_USER}
  
  read -p "Service group [${SERVICE_GROUP}]: " input_group
  SERVICE_GROUP=${input_group:-$SERVICE_GROUP}
  
  read -p "Slack webhook URL (optional) [${SLACK_WEBHOOK_URL}]: " input_webhook
  SLACK_WEBHOOK_URL=${input_webhook:-$SLACK_WEBHOOK_URL}
  
  read -p "cPanel username [${CPANEL_USERNAME}]: " input_cpanel_user
  CPANEL_USERNAME=${input_cpanel_user:-$CPANEL_USERNAME}
  
  read -p "cPanel password: " CPANEL_PASSWORD
  
  read -p "cPanel host [${CPANEL_HOST}]: " input_cpanel_host
  CPANEL_HOST=${input_cpanel_host:-$CPANEL_HOST}
  
  read -p "cPanel domain [${CPANEL_DOMAIN}]: " input_cpanel_domain
  CPANEL_DOMAIN=${input_cpanel_domain:-$CPANEL_DOMAIN}
  
  echo -e "${GREEN}Configuration complete!${NC}"
}

# Function to install the service
install_service() {
  echo -e "${YELLOW}Installing synchronization and deployment service...${NC}"
  
  # Create log directory
  mkdir -p /var/log/frontend-sync
  chown ${SERVICE_USER}:${SERVICE_GROUP} /var/log/frontend-sync
  
  # Update paths in the sync script
  sed -i "s|SOURCE_REPO=\"/path/to/Aether_Coin_biozonecurrency\"|SOURCE_REPO=\"${SOURCE_REPO}\"|" "${SOURCE_REPO}/scripts/sync-and-deploy.sh"
  sed -i "s|TARGET_REPO=\"/path/to/biozone-harmony-boost\"|TARGET_REPO=\"${TARGET_REPO}\"|" "${SOURCE_REPO}/scripts/sync-and-deploy.sh"
  
  # Make script executable
  chmod +x "${SOURCE_REPO}/scripts/sync-and-deploy.sh"
  
  # Update service file
  sed -i "s|ExecStart=/bin/bash /path/to/Aether_Coin_biozonecurrency/scripts/sync-and-deploy.sh|ExecStart=/bin/bash ${SOURCE_REPO}/scripts/sync-and-deploy.sh|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  sed -i "s|User=your_username|User=${SERVICE_USER}|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  sed -i "s|Group=your_group|Group=${SERVICE_GROUP}|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    sed -i "s|Environment=\"SLACK_WEBHOOK=your_slack_webhook_url\"|Environment=\"SLACK_WEBHOOK=${SLACK_WEBHOOK_URL}\"|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  fi
  
  # Update cPanel credentials
  sed -i "s|Environment=\"CPANEL_USERNAME=your_cpanel_username\"|Environment=\"CPANEL_USERNAME=${CPANEL_USERNAME}\"|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  sed -i "s|Environment=\"CPANEL_PASSWORD=your_cpanel_password\"|Environment=\"CPANEL_PASSWORD=${CPANEL_PASSWORD}\"|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  sed -i "s|Environment=\"CPANEL_HOST=your_cpanel_host\"|Environment=\"CPANEL_HOST=${CPANEL_HOST}\"|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  sed -i "s|Environment=\"CPANEL_DOMAIN=your_cpanel_domain\"|Environment=\"CPANEL_DOMAIN=${CPANEL_DOMAIN}\"|" "${SOURCE_REPO}/scripts/frontend-sync-deploy.service"
  
  # Copy service and timer files to systemd directory
  cp "${SOURCE_REPO}/scripts/frontend-sync-deploy.service" /etc/systemd/system/
  cp "${SOURCE_REPO}/scripts/frontend-sync-deploy.timer" /etc/systemd/system/
  
  # Reload systemd
  systemctl daemon-reload
  
  # Enable and start the timer
  systemctl enable frontend-sync-deploy.timer
  systemctl start frontend-sync-deploy.timer
  
  echo -e "${GREEN}Service installed successfully!${NC}"
  echo "Service status: $(systemctl is-active frontend-sync-deploy.service)"
  echo "Timer status: $(systemctl is-active frontend-sync-deploy.timer)"
  echo "Timer enabled: $(systemctl is-enabled frontend-sync-deploy.timer)"
  
  # Run the sync script immediately
  echo -e "${YELLOW}Running initial synchronization and deployment...${NC}"
  sudo -u ${SERVICE_USER} bash "${SOURCE_REPO}/scripts/sync-and-deploy.sh" --deploy
  
  echo -e "${GREEN}Installation complete!${NC}"
  echo "The synchronization and deployment service will run daily at midnight."
  echo "You can manually trigger synchronization and deployment with:"
  echo "  sudo systemctl start frontend-sync-deploy.service"
  echo "View logs with:"
  echo "  journalctl -u frontend-sync-deploy.service"
  echo "  cat /var/log/frontend-sync.log"
}

# Main execution
configure
install_service