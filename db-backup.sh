#!/bin/bash
# db-backup.sh
# Database backup script for Aetherion Wallet

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables if .env exists
if [ -f .env ]; then
  source .env
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-aetherion}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-./database_backups}

# Verify database password is available
if [ -z "$DB_PASSWORD" ]; then
  echo -e "${YELLOW}Warning: DB_PASSWORD environment variable is not set.${NC}"
  echo -e "${YELLOW}You may need to enter password manually.${NC}"
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo -e "${BLUE}Creating database backup: $BACKUP_FILE${NC}"

# Create backup using pg_dump
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -b -v -f "$BACKUP_FILE" "$DB_NAME"

BACKUP_RESULT=$?
if [ $BACKUP_RESULT -eq 0 ]; then
  echo -e "${GREEN}Backup completed successfully${NC}"
  
  # Clean up old backups (keep last 10)
  echo "Cleaning up old backups, keeping the 10 most recent..."
  cd "$BACKUP_DIR" || exit
  ls -t | grep "${DB_NAME}_" | tail -n +11 | xargs -r rm
  echo -e "${GREEN}Cleaned up old backups${NC}"
  
  # Verify backup file
  echo "Verifying backup file integrity..."
  pg_restore -l "$BACKUP_FILE" > /dev/null 2>&1
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup verification successful${NC}"
    echo -e "${GREEN}Backup file: $BACKUP_FILE${NC}"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${BLUE}Backup size: $BACKUP_SIZE${NC}"
    
    # Count tables in backup
    TABLE_COUNT=$(pg_restore -l "$BACKUP_FILE" | grep -c "TABLE DATA")
    echo -e "${BLUE}Tables backed up: $TABLE_COUNT${NC}"
    
    # Output backup file path for use in other scripts
    echo "$BACKUP_FILE"
    exit 0
  else
    echo -e "${RED}Backup verification failed!${NC}"
    echo -e "${RED}The backup file may be corrupted.${NC}"
    exit 2
  fi
else
  echo -e "${RED}Backup failed with error code $BACKUP_RESULT${NC}"
  echo -e "${RED}Check your database connection parameters and try again.${NC}"
  exit 1
fi