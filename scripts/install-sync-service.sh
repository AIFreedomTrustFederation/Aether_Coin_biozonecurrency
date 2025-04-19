#!/bin/bash
# install-sync-service.sh
#
# This script installs the frontend repository synchronization service
# on the server.
#
# Usage: sudo ./install-sync-service.sh

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

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to prompt for configuration
configure() {
  echo -e "${YELLOW}Frontend Repository Synchronization Service Installation${NC}"
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
  
  echo -e "${GREEN}Configuration complete!${NC}"
}

# Function to install the service
install_service() {
  echo -e "${YELLOW}Installing synchronization service...${NC}"
  
  # Create log directory
  mkdir -p /var/log/frontend-sync
  chown ${SERVICE_USER}:${SERVICE_GROUP} /var/log/frontend-sync
  
  # Update paths in the sync script
  sed -i "s|SOURCE_REPO=\"/path/to/Aether_Coin_biozonecurrency\"|SOURCE_REPO=\"${SOURCE_REPO}\"|" "${SOURCE_REPO}/scripts/sync-frontend-repos.sh"
  sed -i "s|TARGET_REPO=\"/path/to/biozone-harmony-boost\"|TARGET_REPO=\"${TARGET_REPO}\"|" "${SOURCE_REPO}/scripts/sync-frontend-repos.sh"
  
  # Make script executable
  chmod +x "${SOURCE_REPO}/scripts/sync-frontend-repos.sh"
  
  # Update service file
  sed -i "s|ExecStart=/bin/bash /path/to/Aether_Coin_biozonecurrency/scripts/sync-frontend-repos.sh|ExecStart=/bin/bash ${SOURCE_REPO}/scripts/sync-frontend-repos.sh|" "${SOURCE_REPO}/scripts/frontend-sync.service"
  sed -i "s|User=your_username|User=${SERVICE_USER}|" "${SOURCE_REPO}/scripts/frontend-sync.service"
  sed -i "s|Group=your_group|Group=${SERVICE_GROUP}|" "${SOURCE_REPO}/scripts/frontend-sync.service"
  
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    sed -i "s|Environment=\"SLACK_WEBHOOK=your_slack_webhook_url\"|Environment=\"SLACK_WEBHOOK=${SLACK_WEBHOOK_URL}\"|" "${SOURCE_REPO}/scripts/frontend-sync.service"
  fi
  
  # Copy service and timer files to systemd directory
  cp "${SOURCE_REPO}/scripts/frontend-sync.service" /etc/systemd/system/
  cp "${SOURCE_REPO}/scripts/frontend-sync.timer" /etc/systemd/system/
  
  # Reload systemd
  systemctl daemon-reload
  
  # Enable and start the timer
  systemctl enable frontend-sync.timer
  systemctl start frontend-sync.timer
  
  echo -e "${GREEN}Service installed successfully!${NC}"
  echo "Service status: $(systemctl is-active frontend-sync.service)"
  echo "Timer status: $(systemctl is-active frontend-sync.timer)"
  echo "Timer enabled: $(systemctl is-enabled frontend-sync.timer)"
  
  # Run the sync script immediately
  echo -e "${YELLOW}Running initial synchronization...${NC}"
  sudo -u ${SERVICE_USER} bash "${SOURCE_REPO}/scripts/sync-frontend-repos.sh" --force
  
  echo -e "${GREEN}Installation complete!${NC}"
  echo "The synchronization service will run every hour."
  echo "You can manually trigger synchronization with:"
  echo "  sudo systemctl start frontend-sync.service"
  echo "View logs with:"
  echo "  journalctl -u frontend-sync.service"
  echo "  cat /var/log/frontend-sync.log"
}

# Main execution
configure
install_service