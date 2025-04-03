#!/bin/bash

# Helper script for managing environment variables

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMMAND=$1
shift

# Print header
print_header() {
  echo -e "${BLUE}=======================================${NC}"
  echo -e "${BLUE}       Environment Manager Tool        ${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo ""
}

show_help() {
  print_header
  echo -e "Usage: ${YELLOW}./env-manager.sh${NC} ${GREEN}<command>${NC}"
  echo ""
  echo -e "Available commands:"
  echo -e "  ${GREEN}init${NC}    - Create a new .env file from .env.example"
  echo -e "  ${GREEN}check${NC}   - Check for missing environment variables"
  echo -e "  ${GREEN}backup${NC}  - Create a backup of the current .env file"
  echo -e "  ${GREEN}restore${NC} - Restore the latest .env backup"
  echo -e "  ${GREEN}help${NC}    - Show this help message"
  echo ""
}

# Create a new .env file from .env.example
init_env() {
  if [ -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file already exists.${NC}"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}Operation cancelled.${NC}"
      return
    fi
    # Backup existing .env before overwriting
    backup_env
  fi
  
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${GREEN}Created new .env file from .env.example.${NC}"
    echo -e "${YELLOW}Remember to update the values in .env with your actual credentials.${NC}"
  else
    echo -e "${RED}Error: .env.example file not found.${NC}"
    exit 1
  fi
}

# Check for missing required environment variables
check_env() {
  if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found. Run './env-manager.sh init' to create one.${NC}"
    exit 1
  fi

  if [ ! -f ".env.example" ]; then
    echo -e "${RED}Error: .env.example file not found.${NC}"
    exit 1
  fi
  
  # Extract variable names from .env.example, excluding comments
  example_vars=$(grep -v '^#' .env.example | cut -d '=' -f1)
  
  # Check if each variable exists in .env
  missing_vars=()
  
  for var in $example_vars; do
    if ! grep -q "^${var}=" .env; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}All required environment variables are defined.${NC}"
  else
    echo -e "${RED}Missing environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
      echo -e "  - ${YELLOW}${var}${NC}"
    done
    echo -e "${YELLOW}Please add these variables to your .env file.${NC}"
  fi
}

# Create a backup of the current .env file
backup_env() {
  if [ ! -f ".env" ]; then
    echo -e "${RED}Error: No .env file found to backup.${NC}"
    exit 1
  fi
  
  mkdir -p .backup/env
  timestamp=$(date +"%Y%m%d_%H%M%S")
  cp .env ".backup/env/.env.backup_${timestamp}"
  echo -e "${GREEN}Backed up .env to .backup/env/.env.backup_${timestamp}${NC}"
}

# Restore the latest .env backup
restore_env() {
  if [ ! -d ".backup/env" ]; then
    echo -e "${RED}Error: No backup directory found.${NC}"
    exit 1
  fi
  
  latest_backup=$(ls -t .backup/env/.env.backup_* 2>/dev/null | head -1)
  
  if [ -z "$latest_backup" ]; then
    echo -e "${RED}Error: No backup files found.${NC}"
    exit 1
  fi
  
  if [ -f ".env" ]; then
    timestamp=$(date +"%Y%m%d_%H%M%S")
    cp .env ".env.before_restore_${timestamp}"
    echo -e "${YELLOW}Current .env saved as .env.before_restore_${timestamp}${NC}"
  fi
  
  cp "$latest_backup" .env
  echo -e "${GREEN}Restored .env from ${latest_backup}${NC}"
}

# Main command handler
case $COMMAND in
  "init")
    init_env
    ;;
  "check")
    check_env
    ;;
  "backup")
    backup_env
    ;;
  "restore")
    restore_env
    ;;
  "help"|"")
    show_help
    ;;
  *)
    echo -e "${RED}Unknown command: $COMMAND${NC}"
    show_help
    exit 1
    ;;
esac