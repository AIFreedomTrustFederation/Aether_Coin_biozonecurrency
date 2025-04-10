#!/bin/bash
# setup-github-sync.sh - Script to configure GitHub synchronization for Aetherion Wallet
#
# This script automates the process of:
# 1. Configuring Git credentials
# 2. Setting up GitHub remote
# 3. Adding GitHub token for authentication
#
# Usage: ./setup-github-sync.sh [--token TOKEN] [--repo REPO]

set -e

# ANSI color codes
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RED="\033[31m"

# Banner
echo -e "${BLUE}${BOLD}"
echo "================================================================"
echo "  Aetherion Wallet - GitHub Sync Setup"
echo "================================================================"
echo -e "${RESET}"

# Check for git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed${RESET}"
    echo "Please install Git before running this script."
    exit 1
fi

# Parse arguments
GITHUB_TOKEN=""
GITHUB_REPOSITORY=""

for arg in "$@"; do
    case $arg in
        --token=*)
            GITHUB_TOKEN="${arg#*=}"
            shift
            ;;
        --token)
            if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
                GITHUB_TOKEN="$2"
                shift 2
            else
                echo -e "${RED}Error: --token requires a value${RESET}"
                exit 1
            fi
            ;;
        --repo=*)
            GITHUB_REPOSITORY="${arg#*=}"
            shift
            ;;
        --repo)
            if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
                GITHUB_REPOSITORY="$2"
                shift 2
            else
                echo -e "${RED}Error: --repo requires a value${RESET}"
                exit 1
            fi
            ;;
        *)
            # Unknown option
            echo -e "${YELLOW}Warning: Unknown option $arg${RESET}"
            shift
            ;;
    esac
done

# Check if repository is already set up with a GitHub remote
if git remote get-url origin 2>/dev/null | grep -q "github.com"; then
    echo -e "${GREEN}GitHub remote already configured:${RESET}"
    git remote get-url origin
    ALREADY_CONFIGURED=1
else
    ALREADY_CONFIGURED=0
fi

# Prompt for GitHub repository if not provided
if [ -z "$GITHUB_REPOSITORY" ] && [ $ALREADY_CONFIGURED -eq 0 ]; then
    echo -e "${BLUE}Please enter your GitHub repository in format 'owner/repo':${RESET}"
    read GITHUB_REPOSITORY
    
    if [ -z "$GITHUB_REPOSITORY" ]; then
        echo -e "${RED}No repository specified, exiting.${RESET}"
        exit 1
    fi
fi

# Prompt for GitHub token if not provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${BLUE}Please enter your GitHub personal access token:${RESET}"
    read -s GITHUB_TOKEN
    echo
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${YELLOW}No token provided. Authentication may fail.${RESET}"
        USE_TOKEN=0
    else
        USE_TOKEN=1
    fi
else
    USE_TOKEN=1
fi

# Set up Git identity if not already configured
if [ -z "$(git config --global user.name)" ] || [ -z "$(git config --global user.email)" ]; then
    echo -e "${BLUE}Setting up Git identity...${RESET}"
    
    if [ -z "$(git config --global user.name)" ]; then
        echo -e "${BLUE}Please enter your name for Git commits:${RESET}"
        read GIT_NAME
        git config --global user.name "$GIT_NAME"
    fi
    
    if [ -z "$(git config --global user.email)" ]; then
        echo -e "${BLUE}Please enter your email for Git commits:${RESET}"
        read GIT_EMAIL
        git config --global user.email "$GIT_EMAIL"
    fi
    
    echo -e "${GREEN}Git identity configured.${RESET}"
fi

# Set up GitHub remote if not already configured
if [ $ALREADY_CONFIGURED -eq 0 ] && [ -n "$GITHUB_REPOSITORY" ]; then
    echo -e "${BLUE}Setting up GitHub remote...${RESET}"
    
    # Add remote with token if provided
    if [ $USE_TOKEN -eq 1 ]; then
        REMOTE_URL="https://$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git"
    else
        REMOTE_URL="https://github.com/$GITHUB_REPOSITORY.git"
    fi
    
    # Check if origin exists
    if git remote get-url origin &> /dev/null; then
        git remote set-url origin "$REMOTE_URL"
    else
        git remote add origin "$REMOTE_URL"
    fi
    
    echo -e "${GREEN}GitHub remote configured.${RESET}"
fi

# Store GitHub token in .env file
if [ $USE_TOKEN -eq 1 ]; then
    echo -e "${BLUE}Storing GitHub token in .env file...${RESET}"
    
    if [ -f .env ]; then
        # Check if GITHUB_TOKEN already exists in .env
        if grep -q "GITHUB_TOKEN=" .env; then
            # Update existing token
            sed -i "s/GITHUB_TOKEN=.*/GITHUB_TOKEN=$GITHUB_TOKEN/" .env
        else
            # Add token
            echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> .env
        fi
    else
        # Create new .env file
        echo "GITHUB_TOKEN=$GITHUB_TOKEN" > .env
    fi
    
    echo -e "${GREEN}GitHub token stored in .env file.${RESET}"
    
    # Create a git-credentials file (backup method)
    if [ -n "$GITHUB_REPOSITORY" ]; then
        echo -e "${BLUE}Setting up Git credentials store...${RESET}"
        
        # Extract owner and repo
        REPO_OWNER=$(echo $GITHUB_REPOSITORY | cut -d '/' -f 1)
        
        # Configure credential store
        git config --global credential.helper store
        
        # Store credentials
        echo "https://$GITHUB_TOKEN:x-oauth-basic@github.com" > ~/.git-credentials
        
        echo -e "${GREEN}Git credentials configured.${RESET}"
    fi
fi

echo -e "${GREEN}${BOLD}GitHub synchronization setup completed!${RESET}"
echo
echo -e "${BLUE}Next steps:${RESET}"
echo -e "1. Run ${YELLOW}./sync-to-github.sh${RESET} to push changes to GitHub"
echo -e "2. For automatic releases, install GitHub CLI (gh): https://cli.github.com/"
echo