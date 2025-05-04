#!/bin/bash
# DNS cleaning script for GitHub Pages configuration
# This script automates the process of setting up DNS for GitHub Pages

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== GitHub Pages DNS Setup Automation ===${NC}"
echo "This script will configure your DNS for GitHub Pages."

# Define variables - modify these as needed
DOMAIN="aifreedomtrust.com"
SUBDOMAIN="atc.coin"
GITHUB_USER="aifreedomtrustfederation"
GITHUB_PAGES_DOMAIN="${GITHUB_USER}.github.io"

FULL_SUBDOMAIN="${SUBDOMAIN}.${DOMAIN}"
ZONE_FILE="/var/named/${DOMAIN}.db"

echo -e "${BLUE}Checking if we have access to the DNS Zone...${NC}"

# Check if we have access to the zone file directly
if [ -f "$ZONE_FILE" ]; then
    echo -e "${GREEN}Zone file found at $ZONE_FILE${NC}"
    USE_ZONE_FILE=true
else
    echo -e "${RED}Zone file not directly accessible. Will use cPanel API instead.${NC}"
    USE_ZONE_FILE=false
fi

# Function to make API calls to cPanel if we can't edit zone directly
update_with_cpanel_api() {
    echo -e "${BLUE}Using cPanel API to update DNS records...${NC}"
    
    # 1. Remove existing records for the subdomain
    echo "Removing existing records for $FULL_SUBDOMAIN..."
    
    # Create a temporary file to store records to be deleted
    TEMP_FILE=$(mktemp)
    
    # Get current zone records
    /usr/local/cpanel/bin/whmapi1 dumpzone domain=$DOMAIN | grep -A 10 "$SUBDOMAIN" > $TEMP_FILE
    
    # Parse records to delete
    while read -r line; do
        if [[ $line == *"name:"* && $line == *"$SUBDOMAIN"* ]]; then
            RECORD_LINE=$line
            RECORD_NAME=$(echo $RECORD_LINE | awk '{print $2}')
            
            # Get the record type from the next line
            read -r TYPE_LINE
            RECORD_TYPE=$(echo $TYPE_LINE | awk '{print $2}')
            
            if [[ $RECORD_TYPE == "A" || $RECORD_TYPE == "CNAME" || $RECORD_TYPE == "TXT" ]]; then
                echo "Deleting $RECORD_TYPE record for $RECORD_NAME..."
                /usr/local/cpanel/bin/whmapi1 removezonerecord zone=$DOMAIN name=$RECORD_NAME type=$RECORD_TYPE
            fi
        fi
    done < $TEMP_FILE
    
    rm $TEMP_FILE
    
    # 2. Add new CNAME record for GitHub Pages
    echo "Adding CNAME record for $FULL_SUBDOMAIN pointing to $GITHUB_PAGES_DOMAIN..."
    /usr/local/cpanel/bin/whmapi1 addzonerecord domain=$DOMAIN name=$SUBDOMAIN type=CNAME cname=$GITHUB_PAGES_DOMAIN ttl=300
    
    echo -e "${GREEN}DNS records have been updated via cPanel API.${NC}"
}

# Function to modify zone file directly if we have access
update_zone_file_directly() {
    echo -e "${BLUE}Modifying zone file directly...${NC}"
    
    # Create a backup of the zone file
    cp $ZONE_FILE "${ZONE_FILE}.bak"
    
    # Remove existing records for the subdomain
    sed -i "/^${SUBDOMAIN}\./d" $ZONE_FILE
    
    # Add the new CNAME record
    echo "${SUBDOMAIN}.${DOMAIN}.  300  IN  CNAME  ${GITHUB_PAGES_DOMAIN}." >> $ZONE_FILE
    
    # Increment the serial number in the SOA record
    SERIAL=$(grep -E "^[[:space:]]+[0-9]+" $ZONE_FILE | awk '{print $1}')
    NEW_SERIAL=$(date +%Y%m%d%H)
    sed -i "s/$SERIAL/$NEW_SERIAL/" $ZONE_FILE
    
    # Reload named/bind
    service named reload
    
    echo -e "${GREEN}Zone file has been updated directly.${NC}"
}

# Update DNS records based on the access method
if [ "$USE_ZONE_FILE" = true ]; then
    update_zone_file_directly
else
    update_with_cpanel_api
fi

echo -e "${BLUE}=== GitHub Pages Setup Instructions ===${NC}"
echo "1. In your GitHub repository, make sure your CNAME file contains:"
echo "   $FULL_SUBDOMAIN"
echo ""
echo "2. In repository settings, set the custom domain to:"
echo "   $FULL_SUBDOMAIN"
echo ""
echo "3. Wait for DNS propagation (typically 15 minutes to a few hours)"
echo ""
echo -e "${GREEN}DNS configuration complete!${NC}"
echo "You can check DNS propagation with: dig $FULL_SUBDOMAIN"