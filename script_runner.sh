#!/bin/bash

# This is a helper script that provides an easy to remember interface
# for running various development and maintenance tasks

COMMAND=$1
shift  # Remove the first argument

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
print_header() {
  echo -e "${BLUE}=======================================${NC}"
  echo -e "${BLUE}  Aetherion Wallet Project Assistant  ${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo ""
}

# Print help message
show_help() {
  print_header
  echo -e "Usage: ${YELLOW}./script_runner.sh${NC} ${GREEN}<command>${NC} [options]"
  echo ""
  echo -e "Available commands:"
  echo -e "  ${GREEN}run${NC}        - Start the development server"
  echo -e "  ${GREEN}build${NC}      - Build the project for production"
  echo -e "  ${GREEN}backup${NC}     - Create a backup of the current state"
  echo -e "  ${GREEN}db${NC}         - Database operations (push, studio, etc.)"
  echo -e "  ${GREEN}clean${NC}      - Clean up build artifacts"
  echo -e "  ${GREEN}reset${NC}      - Completely reset and reinitialize the project"
  echo -e "  ${GREEN}help${NC}       - Show this help message"
  echo ""
  echo -e "Examples:"
  echo -e "  ${YELLOW}./script_runner.sh run${NC}          - Start development server"
  echo -e "  ${YELLOW}./script_runner.sh db push${NC}      - Run database migrations"
  echo -e "  ${YELLOW}./script_runner.sh db studio${NC}    - Open Drizzle Studio"
  echo -e "  ${YELLOW}./script_runner.sh backup${NC}       - Create a project backup"
  echo -e "  ${YELLOW}./script_runner.sh reset${NC}        - Reset project to clean state"
  echo ""
}

# Handle different commands
case $COMMAND in
  "run")
    echo -e "${GREEN}Starting development server...${NC}"
    npm run dev
    ;;
  "build")
    echo -e "${GREEN}Building for production...${NC}"
    npm run build
    ;;
  "backup")
    echo -e "${GREEN}Creating backup...${NC}"
    ./backup.sh
    ;;
  "db")
    DB_COMMAND=$1
    shift
    
    case $DB_COMMAND in
      "push")
        echo -e "${GREEN}Running database migrations...${NC}"
        npm run db:push
        ;;
      "studio")
        echo -e "${GREEN}Opening Drizzle Studio...${NC}"
        npx drizzle-kit studio
        ;;
      *)
        echo -e "${RED}Unknown database command: $DB_COMMAND${NC}"
        echo -e "Available options are: push, studio"
        exit 1
        ;;
    esac
    ;;
  "clean")
    echo -e "${GREEN}Cleaning build artifacts...${NC}"
    ./npm-scripts.sh clean
    ;;
  "reset")
    echo -e "${YELLOW}Warning: This will reset the project to a clean state.${NC}"
    read -p "Are you sure you want to continue? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${GREEN}Resetting project...${NC}"
      ./reinit.sh "$@"
    else
      echo -e "${RED}Reset cancelled.${NC}"
    fi
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