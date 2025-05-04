#!/bin/bash
# GitHub Pages DNS Configuration Script for AI Freedom Trust
# This script helps set up DNS records in cPanel for GitHub Pages integration

# Text formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

# Banner
echo -e "${BLUE}${BOLD}"
echo "====================================================="
echo "    GitHub Pages DNS Configuration Tool"
echo "    for AI Freedom Trust Federation"
echo "====================================================="
echo -e "${RESET}"

# Prompt for cPanel credentials if not provided
if [ -z "$CPANEL_USERNAME" ] || [ -z "$CPANEL_PASSWORD" ] || [ -z "$CPANEL_DOMAIN" ]; then
    echo -e "${YELLOW}cPanel credentials not found in environment variables.${RESET}"
    read -p "Enter cPanel username: " CPANEL_USERNAME
    read -s -p "Enter cPanel password: " CPANEL_PASSWORD
    echo
    read -p "Enter cPanel domain (e.g., aifreedomtrust.com): " CPANEL_DOMAIN
fi

# cPanel API URL
CPANEL_API_URL="https://${CPANEL_DOMAIN}:2083/execute/DNS/mass_edit_zone"

# Function to add GitHub Pages DNS records
add_github_pages_records() {
    local subdomain=$1
    local github_org=$2
    local github_repo=$3
    
    echo -e "${BLUE}Configuring DNS for ${BOLD}${subdomain}.${CPANEL_DOMAIN}${RESET}${BLUE} pointing to GitHub Pages...${RESET}"
    
    # If subdomain is @ (root domain), don't add subdomain prefix
    local zone_record="${subdomain}"
    if [ "$subdomain" == "@" ]; then
        zone_record=""
    else
        zone_record="${subdomain}"
    fi

    # Prepare cPanel API call data
    local json_data=$(cat <<EOF
{
    "domain": "${CPANEL_DOMAIN}",
    "records": [
        {
            "name": "${zone_record}",
            "type": "CNAME",
            "cname": "${github_org}.github.io.",
            "ttl": 14400
        }
    ]
}
EOF
)

    # Call cPanel API
    echo "Sending DNS configuration to cPanel..."
    
    # If curl is available, use it to send the API request
    if command -v curl &> /dev/null; then
        response=$(curl -s -k -u "${CPANEL_USERNAME}:${CPANEL_PASSWORD}" "${CPANEL_API_URL}" \
            -H "Content-Type: application/json" \
            -d "${json_data}")
        
        # Check for success in the response
        if [[ "$response" == *"\"status\":1"* ]]; then
            echo -e "${GREEN}✓ DNS records for ${subdomain}.${CPANEL_DOMAIN} successfully configured!${RESET}"
            echo -e "It will now point to ${github_org}.github.io"
            
            # Instruction for adding CNAME file to GitHub repository
            echo -e "${YELLOW}IMPORTANT: Add a file named 'CNAME' to your '${github_repo}' repository with this content:${RESET}"
            echo -e "${BOLD}${subdomain}.${CPANEL_DOMAIN}${RESET}"
        else
            echo -e "${RED}× Failed to configure DNS records. API response:${RESET}"
            echo "$response"
        fi
    else
        echo -e "${RED}× Error: curl is not installed. Cannot send API request.${RESET}"
        echo -e "${YELLOW}Please install curl or manually configure these DNS records:${RESET}"
        echo -e "Name: ${zone_record}"
        echo -e "Type: CNAME"
        echo -e "Content: ${github_org}.github.io."
        echo -e "TTL: 14400"
    fi
    
    echo
}

# Function to verify DNS configuration with dig
verify_dns_configuration() {
    local subdomain=$1
    local full_domain
    
    if [ "$subdomain" == "@" ]; then
        full_domain="${CPANEL_DOMAIN}"
    else
        full_domain="${subdomain}.${CPANEL_DOMAIN}"
    fi
    
    echo -e "${BLUE}Verifying DNS configuration for ${BOLD}${full_domain}${RESET}${BLUE}...${RESET}"
    
    # Check if dig is available
    if command -v dig &> /dev/null; then
        # Look up the CNAME record
        dig_result=$(dig CNAME "${full_domain}" +short)
        
        if [ -n "$dig_result" ]; then
            echo -e "${GREEN}✓ DNS verification successful!${RESET}"
            echo -e "CNAME record for ${full_domain}: ${dig_result}"
        else
            echo -e "${YELLOW}⚠ DNS verification inconclusive.${RESET}"
            echo -e "No CNAME record found for ${full_domain}."
            echo -e "This could be because the DNS changes haven't propagated yet (can take up to 24-48 hours)."
        fi
    else
        echo -e "${YELLOW}⚠ Cannot verify DNS - 'dig' utility not available.${RESET}"
        echo -e "Please manually verify your DNS configuration after 24-48 hours."
    fi
    
    echo
}

# Interactive menu for common GitHub Pages configurations
configure_common_setup() {
    echo -e "${BLUE}${BOLD}Select a common configuration to set up:${RESET}"
    echo "1) Organization site (aifreedomtrust.com -> AIFreedomTrustFederation.github.io)"
    echo "2) ATC subdomain (atc.aifreedomtrust.com -> AIFreedomTrustFederation.github.io)"
    echo "3) Fractal Coin subdomain (fractalcoin.aifreedomtrust.com -> AIFreedomTrustFederation.github.io)"
    echo "4) Aether Coin subdomain (aethercoin.aifreedomtrust.com -> AIFreedomTrustFederation.github.io)"
    echo "5) Custom configuration"
    echo -e "q) Quit"
    echo
    
    read -p "Enter your choice (1-5, or q): " choice
    
    case $choice in
        1)
            add_github_pages_records "@" "AIFreedomTrustFederation" "AIFreedomTrustFederation.github.io"
            verify_dns_configuration "@"
            ;;
        2)
            add_github_pages_records "atc" "AIFreedomTrustFederation" "AIFreedomTrustFederation.github.io"
            verify_dns_configuration "atc"
            ;;
        3)
            add_github_pages_records "fractalcoin" "AIFreedomTrustFederation" "AIFreedomTrustFederation.github.io"
            verify_dns_configuration "fractalcoin"
            ;;
        4)
            add_github_pages_records "aethercoin" "AIFreedomTrustFederation" "AIFreedomTrustFederation.github.io"
            verify_dns_configuration "aethercoin"
            ;;
        5)
            custom_configuration
            ;;
        q|Q)
            echo -e "${BLUE}Exiting. Have a great day!${RESET}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${RESET}"
            configure_common_setup
            ;;
    esac
}

# Function for custom configuration
custom_configuration() {
    echo -e "${BLUE}${BOLD}Custom Configuration${RESET}"
    read -p "Enter subdomain (use @ for root domain): " subdomain
    read -p "Enter GitHub organization name: " github_org
    read -p "Enter GitHub repository name: " github_repo
    
    add_github_pages_records "$subdomain" "$github_org" "$github_repo"
    verify_dns_configuration "$subdomain"
}

# Main execution
configure_common_setup

# Ask if user wants to configure another subdomain
while true; do
    echo -e "${BLUE}${BOLD}Would you like to configure another subdomain?${RESET} (y/n): "
    read continue_choice
    
    case $continue_choice in
        y|Y)
            configure_common_setup
            ;;
        n|N)
            echo -e "${GREEN}DNS configuration complete!${RESET}"
            echo -e "${YELLOW}Remember to add CNAME files to your GitHub repositories.${RESET}"
            echo -e "${BLUE}Have a great day!${RESET}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please enter 'y' or 'n'.${RESET}"
            ;;
    esac
done