#!/bin/bash
# db-restore.sh
# Database restoration script for Aetherion Wallet

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

# Check if backup file provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: No backup file specified${NC}"
  echo "Usage: $0 <backup-file>"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file does not exist: $BACKUP_FILE${NC}"
  exit 1
fi

echo -e "${BLUE}Preparing to restore database from backup: $BACKUP_FILE${NC}"
echo -e "${YELLOW}WARNING: This will overwrite the current database. All data will be replaced.${NC}"
echo -e "${YELLOW}Press Ctrl+C now to cancel, or the restoration will begin in 10 seconds...${NC}"

# Countdown timer
for i in {10..1}; do
  echo -ne "${YELLOW}$i...${NC} "
  sleep 1
done
echo ""

echo -e "${BLUE}Starting restoration process...${NC}"

# Verify backup file integrity
echo "Verifying backup file integrity..."
pg_restore -l "$BACKUP_FILE" > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}Backup file verification failed! The file may be corrupted.${NC}"
  echo -e "${RED}Aborting restoration.${NC}"
  exit 1
fi

# Create backup of current database before restoration
echo "Creating safety backup of current database before restoration..."
SAFETY_BACKUP_DIR="./database_backups/pre_restore_safety"
mkdir -p "$SAFETY_BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFETY_BACKUP="$SAFETY_BACKUP_DIR/${DB_NAME}_pre_restore_${TIMESTAMP}.sql"

export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -b -f "$SAFETY_BACKUP" "$DB_NAME"

if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Warning: Could not create safety backup of current database.${NC}"
  echo -e "${YELLOW}Do you still want to proceed with restoration? (y/n)${NC}"
  read -r PROCEED
  if [[ "$PROCEED" != "y" && "$PROCEED" != "Y" ]]; then
    echo -e "${BLUE}Restoration aborted.${NC}"
    exit 0
  fi
else
  echo -e "${GREEN}Safety backup created: $SAFETY_BACKUP${NC}"
fi

# Drop connections to the database
echo "Dropping connections to the database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
AND pid <> pg_backend_pid();"

# Restore from backup
echo -e "${BLUE}Restoring database from backup...${NC}"
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c -v "$BACKUP_FILE"

RESTORE_RESULT=$?
if [ $RESTORE_RESULT -eq 0 ]; then
  echo -e "${GREEN}Database restored successfully from $BACKUP_FILE${NC}"
  
  # Verify the restoration
  echo "Verifying database integrity after restoration..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database verification successful!${NC}"
    echo -e "${GREEN}Restoration process completed.${NC}"
    exit 0
  else
    echo -e "${RED}Database verification failed! The database may be in an inconsistent state.${NC}"
    echo -e "${YELLOW}Consider restoring from the safety backup: $SAFETY_BACKUP${NC}"
    exit 2
  fi
else
  echo -e "${RED}Database restore failed with error code $RESTORE_RESULT${NC}"
  echo -e "${YELLOW}The database may be in an inconsistent state.${NC}"
  echo -e "${YELLOW}Consider restoring from the safety backup: $SAFETY_BACKUP${NC}"
  exit 1
fi