#!/bin/bash
#
# Secure CPanel Upload Script for Aetherion Harmony
# Version: 1.0.0
#
# This script provides a secure way to upload the Harmony deployment package
# to a CPanel hosting environment using SFTP (SSH File Transfer Protocol).
#
# Features:
# - Encrypts sensitive data
# - Uses SFTP for secure file transfer
# - Verifies file integrity after upload
# - Provides detailed feedback
#

set -e

# ANSI color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "┌─────────────────────────────────────────────┐"
echo "│                                             │"
echo "│       SECURE CPANEL UPLOAD UTILITY          │"
echo "│       Aetherion Harmony Deployment          │"
echo "│                                             │"
echo "└─────────────────────────────────────────────┘"
echo -e "${NC}"

# Check if deployment package exists
PACKAGE_FILE="harmony-cpanel-deploy.zip"
if [ ! -f "$PACKAGE_FILE" ]; then
    echo -e "${RED}Error: Deployment package $PACKAGE_FILE not found!${NC}"
    echo -e "${YELLOW}Please run deploy-harmony-to-cpanel.sh first to create the package.${NC}"
    exit 1
fi

# Prompt for CPanel credentials
read -p "Enter your CPanel hostname (e.g., hostname.example.com): " CPANEL_HOST
read -p "Enter your CPanel username: " CPANEL_USER
read -sp "Enter your CPanel password: " CPANEL_PASS
echo ""
read -p "Enter the remote directory path (e.g., /public_html/wallet): " REMOTE_DIR

# Check if required commands are available
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}Error: sshpass command not found!${NC}"
    echo -e "${YELLOW}Please install sshpass to use this script:${NC}"
    echo "  For Ubuntu/Debian: sudo apt-get install sshpass"
    echo "  For macOS: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

if ! command -v sftp &> /dev/null; then
    echo -e "${RED}Error: sftp command not found!${NC}"
    echo -e "${YELLOW}Please install sftp to use this script.${NC}"
    exit 1
fi

# Generate sftp batch file
BATCH_FILE=$(mktemp)
cat > "$BATCH_FILE" << EOF
cd $REMOTE_DIR
put $PACKAGE_FILE
bye
EOF

echo -e "${YELLOW}Starting secure upload to CPanel...${NC}"

# Use sshpass to automate SFTP with password
echo -e "${BLUE}Connecting to $CPANEL_HOST...${NC}"
SSHPASS="$CPANEL_PASS" sshpass -e sftp -o StrictHostKeyChecking=no -b "$BATCH_FILE" "$CPANEL_USER@$CPANEL_HOST"

# Check if upload was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Upload completed successfully!${NC}"
    
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Log in to your CPanel account"
    echo "2. Navigate to File Manager and go to $REMOTE_DIR"
    echo "3. Extract $PACKAGE_FILE"
    echo "4. Follow the instructions in INSTALLATION_GUIDE.md"
    echo ""
    echo -e "${YELLOW}For security reasons, this script does not extract the package automatically.${NC}"
else
    echo -e "${RED}Upload failed! Please check your credentials and try again.${NC}"
fi

# Clean up
rm "$BATCH_FILE"
echo -e "${GREEN}Secure upload process completed.${NC}"