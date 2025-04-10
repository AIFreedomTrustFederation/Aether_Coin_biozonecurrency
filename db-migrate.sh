#!/bin/bash
# db-migrate.sh
# Safe database migration script for Aetherion Wallet using Drizzle

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

# Ensure necessary tools are installed
if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is not installed. Please install Node.js and npm before continuing.${NC}"
  exit 1
fi

# Create backup before migration
echo -e "${BLUE}Creating database backup before migration...${NC}"
BACKUP_FILE=$(./db-backup.sh)

if [ $? -ne 0 ]; then
  echo -e "${RED}Backup failed. Aborting migration for safety.${NC}"
  exit 1
fi

echo -e "${GREEN}Backup created successfully: $BACKUP_FILE${NC}"

# Display current schema version
echo -e "${BLUE}Current database schema:${NC}"
npm run drizzle-kit introspect:pg

# Generate migration
echo -e "${BLUE}Generating migration...${NC}"
npm run drizzle-kit generate:pg

if [ $? -ne 0 ]; then
  echo -e "${RED}Migration generation failed. Aborting.${NC}"
  exit 1
fi

# Check for potential data loss in migration
echo -e "${BLUE}Checking for potential data loss...${NC}"
MIGRATION_FILES=$(find ./drizzle/migrations -type f -name "*.sql" -newermt "$(date -d '1 minute ago' '+%Y-%m-%d %H:%M:%S')")

if [ -n "$MIGRATION_FILES" ]; then
  for file in $MIGRATION_FILES; do
    if grep -q -E "(DROP|ALTER COLUMN|DROP COLUMN)" "$file"; then
      echo -e "${YELLOW}WARNING: Potential data loss detected in migration file:${NC}"
      echo -e "${YELLOW}$file${NC}"
      echo -e "${YELLOW}The following operations may cause data loss:${NC}"
      grep -E "(DROP|ALTER COLUMN|DROP COLUMN)" "$file" | sed 's/^/  /'
      
      echo -e "${YELLOW}Do you want to continue with this migration? (y/n)${NC}"
      read -r CONTINUE_MIGRATION
      
      if [[ "$CONTINUE_MIGRATION" != "y" && "$CONTINUE_MIGRATION" != "Y" ]]; then
        echo -e "${BLUE}Migration aborted.${NC}"
        exit 0
      fi
    fi
  done
fi

# Confirm migration
echo -e "${YELLOW}Ready to apply database migration.${NC}"
echo -e "${YELLOW}A backup has been created at: $BACKUP_FILE${NC}"
echo -e "${YELLOW}Do you want to continue? (y/n)${NC}"
read -r CONFIRM_MIGRATION

if [[ "$CONFIRM_MIGRATION" != "y" && "$CONFIRM_MIGRATION" != "Y" ]]; then
  echo -e "${BLUE}Migration aborted.${NC}"
  exit 0
fi

# Apply migration
echo -e "${BLUE}Applying migration...${NC}"
npm run db:push

MIGRATION_RESULT=$?

if [ $MIGRATION_RESULT -eq 0 ]; then
  echo -e "${GREEN}Migration applied successfully!${NC}"
  
  # Verify database connectivity after migration
  echo "Verifying database after migration..."
  DB_URL=${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}
  
  # Simple database connectivity test
  npx tsx << EOF
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  
  async function testConnection() {
    try {
      const client = postgres('${DB_URL}');
      const db = drizzle(client);
      
      // Basic query to verify connection
      const result = await db.execute(sql\`SELECT 1 as test\`);
      console.log('Database verification successful');
      process.exit(0);
    } catch (err) {
      console.error('Database verification failed:', err.message);
      process.exit(1);
    }
  }
  
  testConnection();
EOF
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database verification successful! Migration completed.${NC}"
    
    # Check for new migration files
    echo "Updating migration metadata..."
    npm run drizzle-kit up:pg
    
    exit 0
  else
    echo -e "${RED}Database verification failed after migration!${NC}"
    echo -e "${YELLOW}Consider restoring from backup: $BACKUP_FILE${NC}"
    echo -e "${YELLOW}Use: ./db-restore.sh $BACKUP_FILE${NC}"
    exit 2
  fi
else
  echo -e "${RED}Migration failed with error code $MIGRATION_RESULT${NC}"
  echo -e "${YELLOW}Consider restoring from backup: $BACKUP_FILE${NC}"
  echo -e "${YELLOW}Use: ./db-restore.sh $BACKUP_FILE${NC}"
  exit 1
fi