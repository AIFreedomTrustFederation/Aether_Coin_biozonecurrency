#!/bin/bash
# Simplified GitHub Pages DNS setup script for cPanel
# This version uses the uapi command which is available to regular cPanel users

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== GitHub Pages DNS Setup - Simplified ===${NC}"

# Define variables - modify these as needed
DOMAIN="aifreedomtrust.com"
SUBDOMAIN="atc"
GITHUB_USER="aifreedomtrustfederation"
GITHUB_PAGES_DOMAIN="${GITHUB_USER}.github.io"
TTL=300

FULL_SUBDOMAIN="${SUBDOMAIN}.${DOMAIN}"

echo -e "${BLUE}Setting up $FULL_SUBDOMAIN for GitHub Pages...${NC}"

# Step 1: Remove existing A records for the subdomain
echo "Removing existing A records for $SUBDOMAIN..."
existing_records=$(uapi DomainDNS list_records domain=$DOMAIN | grep -B 3 -A 3 "$SUBDOMAIN")

# Extract record IDs
record_ids=$(echo "$existing_records" | grep -E "id:" | awk '{print $2}')

# Delete each record
for id in $record_ids; do
  echo "Deleting record ID: $id"
  uapi DomainDNS remove_record domain=$DOMAIN id=$id
done

# Step 2: Add CNAME record for GitHub Pages
echo "Adding CNAME record for $SUBDOMAIN pointing to $GITHUB_PAGES_DOMAIN..."
uapi DomainDNS add_record domain=$DOMAIN name=$SUBDOMAIN type=CNAME cname=$GITHUB_PAGES_DOMAIN ttl=$TTL

echo -e "${GREEN}DNS setup completed!${NC}"
echo ""
echo -e "${BLUE}=== Next Steps ===${NC}"
echo "1. Make sure your CNAME file in your GitHub repository contains:"
echo "   $FULL_SUBDOMAIN"
echo ""
echo "2. In your GitHub repository settings, set the custom domain to:"
echo "   $FULL_SUBDOMAIN"
echo ""
echo "3. Wait for DNS propagation (15 minutes to a few hours)"
echo ""
echo "You can check DNS propagation with: dig $FULL_SUBDOMAIN"