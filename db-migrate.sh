#!/bin/bash

# Database migration script for safely applying schema changes

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}       Database Migration Tool         ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Parse arguments
FORCE=false
BACKUP=true
DRY_RUN=false

# Parse command line options
for i in "$@"; do
  case $i in
    --force|-f)
      FORCE=true
      shift
      ;;
    --no-backup|-n)
      BACKUP=false
      shift
      ;;
    --dry-run|-d)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      echo -e "Usage: ${GREEN}./db-migrate.sh${NC} [options]"
      echo ""
      echo -e "Options:"
      echo -e "  ${GREEN}--force, -f${NC}       Force migration without confirmation"
      echo -e "  ${GREEN}--no-backup, -n${NC}   Skip database backup before migration"
      echo -e "  ${GREEN}--dry-run, -d${NC}     Show migration SQL without executing it"
      echo -e "  ${GREEN}--help, -h${NC}        Show this help message"
      echo ""
      exit 0
      ;;
    *)
      # Unknown option
      echo -e "${RED}Unknown option: $i${NC}"
      echo -e "Use ${GREEN}--help${NC} to see available options."
      exit 1
      ;;
  esac
done

# Check if drizzle-kit is available
if ! command -v npx &> /dev/null; then
  echo -e "${RED}Error: npx command not found. Make sure Node.js is installed.${NC}"
  exit 1
fi

# Backup the database before migration
if [ "$BACKUP" = true ]; then
  echo -e "${GREEN}Creating database backup before migration...${NC}"
  
  # Create backup directory if it doesn't exist
  mkdir -p .backup/db
  
  # Generate backup filename with timestamp
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_FILE=".backup/db/backup_${TIMESTAMP}.sql"
  
  # Export database schema and data
  if [ -n "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Using DATABASE_URL environment variable to connect to the database.${NC}"
    pg_dump "$DATABASE_URL" -f "$BACKUP_FILE" 2>/dev/null
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Database backup failed. Please check your database connection.${NC}"
      
      if [ "$FORCE" != true ]; then
        echo -e "${YELLOW}Do you want to continue without a backup? (y/n)${NC}"
        read -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
          echo -e "${RED}Migration cancelled.${NC}"
          exit 1
        fi
      else
        echo -e "${YELLOW}Continuing without backup due to force flag.${NC}"
      fi
    else
      echo -e "${GREEN}Database backup created at: ${BACKUP_FILE}${NC}"
    fi
  else
    echo -e "${RED}No DATABASE_URL found. Skipping backup.${NC}"
    
    if [ "$FORCE" != true ]; then
      echo -e "${YELLOW}Do you want to continue without a backup? (y/n)${NC}"
      read -n 1 -r
      echo ""
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Migration cancelled.${NC}"
        exit 1
      fi
    else
      echo -e "${YELLOW}Continuing without backup due to force flag.${NC}"
    fi
  fi
fi

# Warning and confirmation
if [ "$FORCE" != true ]; then
  echo -e "${RED}WARNING: This will apply all pending database migrations.${NC}"
  echo -e "${RED}This operation may be irreversible and could potentially cause data loss.${NC}"
  echo ""
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Running in dry-run mode. No changes will be applied.${NC}"
  else
    echo -e "${YELLOW}Do you want to continue with the migration? (y/n)${NC}"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}Migration cancelled.${NC}"
      exit 1
    fi
  fi
fi

# Run database migration
echo -e "${GREEN}Running database migration...${NC}"

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry run mode: Generating SQL without executing${NC}"
  npx drizzle-kit generate:pg
else
  # Push schema changes to database
  npx drizzle-kit push:pg
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Migration failed! Please check the errors above.${NC}"
    echo -e "${YELLOW}You may need to restore your database from the backup.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Migration completed successfully!${NC}"
exit 0