#!/bin/bash

# Comprehensive backup script for the project
# Creates backups of code, database, and configuration

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}       Project Backup Tool             ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Parse arguments
FULL_BACKUP=true
DB_ONLY=false
CODE_ONLY=false
CONFIG_ONLY=false
BACKUP_DIR=".backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Parse command line options
for i in "$@"; do
  case $i in
    --db-only)
      DB_ONLY=true
      FULL_BACKUP=false
      shift
      ;;
    --code-only)
      CODE_ONLY=true
      FULL_BACKUP=false
      shift
      ;;
    --config-only)
      CONFIG_ONLY=true
      FULL_BACKUP=false
      shift
      ;;
    --dir=*)
      BACKUP_DIR="${i#*=}"
      shift
      ;;
    --help|-h)
      echo -e "Usage: ${GREEN}./backup.sh${NC} [options]"
      echo ""
      echo -e "Options:"
      echo -e "  ${GREEN}--db-only${NC}      Backup only the database"
      echo -e "  ${GREEN}--code-only${NC}    Backup only the code"
      echo -e "  ${GREEN}--config-only${NC}  Backup only configuration files"
      echo -e "  ${GREEN}--dir=PATH${NC}     Custom backup directory (default: .backup)"
      echo -e "  ${GREEN}--help, -h${NC}     Show this help message"
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

# Create backup directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/db"
mkdir -p "$BACKUP_DIR/code"
mkdir -p "$BACKUP_DIR/config"

# Backup database
backup_database() {
  echo -e "${GREEN}Creating database backup...${NC}"
  
  if [ -n "$DATABASE_URL" ]; then
    DB_BACKUP_FILE="$BACKUP_DIR/db/backup_${TIMESTAMP}.sql"
    
    if command -v pg_dump &> /dev/null; then
      pg_dump "$DATABASE_URL" -f "$DB_BACKUP_FILE" 2>/dev/null
      
      if [ $? -ne 0 ]; then
        echo -e "${RED}Database backup failed. Please check your database connection.${NC}"
        return 1
      else
        echo -e "${GREEN}Database backup created at: ${DB_BACKUP_FILE}${NC}"
      fi
    else
      echo -e "${YELLOW}pg_dump command not found. Skipping database backup.${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW}No DATABASE_URL found. Skipping database backup.${NC}"
    return 1
  fi
  
  return 0
}

# Backup code
backup_code() {
  echo -e "${GREEN}Creating code backup...${NC}"
  
  CODE_BACKUP_FILE="$BACKUP_DIR/code/code_backup_${TIMESTAMP}.zip"
  
  # Create a list of files to exclude
  cat > /tmp/backup_exclude.txt << EOF
node_modules/
.git/
.backup/
dist/
build/
.cache/
*.log
EOF

  # Create zip archive
  if command -v zip &> /dev/null; then
    zip -r "$CODE_BACKUP_FILE" . -x@/tmp/backup_exclude.txt > /dev/null
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Code backup failed.${NC}"
      rm /tmp/backup_exclude.txt
      return 1
    else
      echo -e "${GREEN}Code backup created at: ${CODE_BACKUP_FILE}${NC}"
      rm /tmp/backup_exclude.txt
    fi
  else
    echo -e "${YELLOW}zip command not found. Creating tar archive instead.${NC}"
    CODE_BACKUP_FILE="$BACKUP_DIR/code/code_backup_${TIMESTAMP}.tar.gz"
    
    tar --exclude=./node_modules --exclude=./.git --exclude=./.backup \
        --exclude=./dist --exclude=./build --exclude=./.cache \
        -czf "$CODE_BACKUP_FILE" . 2>/dev/null
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Code backup failed.${NC}"
      return 1
    else
      echo -e "${GREEN}Code backup created at: ${CODE_BACKUP_FILE}${NC}"
    fi
  fi
  
  return 0
}

# Backup configuration
backup_config() {
  echo -e "${GREEN}Creating configuration backup...${NC}"
  
  CONFIG_BACKUP_DIR="$BACKUP_DIR/config/config_${TIMESTAMP}"
  mkdir -p "$CONFIG_BACKUP_DIR"
  
  # Copy configuration files
  CONFIG_FILES=(
    ".env"
    ".env.example"
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "tailwind.config.ts"
    "drizzle.config.ts"
    ".replit"
    "theme.json"
  )
  
  for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
      cp "$file" "$CONFIG_BACKUP_DIR/"
    fi
  done
  
  # Create zip archive of config files
  CONFIG_ARCHIVE="$BACKUP_DIR/config/config_backup_${TIMESTAMP}.zip"
  
  if command -v zip &> /dev/null; then
    (cd "$CONFIG_BACKUP_DIR" && zip -r "$CONFIG_ARCHIVE" . > /dev/null)
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Configuration backup failed.${NC}"
      return 1
    else
      echo -e "${GREEN}Configuration backup created at: ${CONFIG_ARCHIVE}${NC}"
      # Clean up the temporary directory
      rm -rf "$CONFIG_BACKUP_DIR"
    fi
  else
    echo -e "${GREEN}Configuration files copied to: ${CONFIG_BACKUP_DIR}${NC}"
  fi
  
  return 0
}

# Create backup manifest
create_manifest() {
  MANIFEST_FILE="$BACKUP_DIR/backup_manifest_${TIMESTAMP}.txt"
  
  echo "Backup created on $(date)" > "$MANIFEST_FILE"
  echo "Project: Aetherion Blockchain Wallet" >> "$MANIFEST_FILE"
  echo "----------------------------------------" >> "$MANIFEST_FILE"
  echo "" >> "$MANIFEST_FILE"
  
  echo "System information:" >> "$MANIFEST_FILE"
  echo "- OS: $(uname -s)" >> "$MANIFEST_FILE"
  echo "- Hostname: $(hostname)" >> "$MANIFEST_FILE"
  echo "- Date: $(date)" >> "$MANIFEST_FILE"
  echo "" >> "$MANIFEST_FILE"
  
  echo "Package versions:" >> "$MANIFEST_FILE"
  if command -v node &> /dev/null; then
    echo "- Node.js: $(node -v)" >> "$MANIFEST_FILE"
  fi
  if command -v npm &> /dev/null; then
    echo "- npm: $(npm -v)" >> "$MANIFEST_FILE"
  fi
  echo "" >> "$MANIFEST_FILE"
  
  echo "Backup contents:" >> "$MANIFEST_FILE"
  if [ "$DB_ONLY" = true ] || [ "$FULL_BACKUP" = true ]; then
    echo "- Database backup: db/backup_${TIMESTAMP}.sql" >> "$MANIFEST_FILE"
  fi
  if [ "$CODE_ONLY" = true ] || [ "$FULL_BACKUP" = true ]; then
    echo "- Code backup: code/code_backup_${TIMESTAMP}.zip" >> "$MANIFEST_FILE"
  fi
  if [ "$CONFIG_ONLY" = true ] || [ "$FULL_BACKUP" = true ]; then
    echo "- Config backup: config/config_backup_${TIMESTAMP}.zip" >> "$MANIFEST_FILE"
  fi
  
  echo -e "${GREEN}Backup manifest created at: ${MANIFEST_FILE}${NC}"
}

# Perform backup based on options
BACKUP_SUCCESS=true

if [ "$DB_ONLY" = true ] || [ "$FULL_BACKUP" = true ]; then
  backup_database
  if [ $? -ne 0 ]; then
    BACKUP_SUCCESS=false
  fi
fi

if [ "$CODE_ONLY" = true ] || [ "$FULL_BACKUP" = true ]; then
  backup_code
  if [ $? -ne 0 ]; then
    BACKUP_SUCCESS=false
  fi
fi

if [ "$CONFIG_ONLY" = true ] || [ "$FULL_BACKUP" = true ]; then
  backup_config
  if [ $? -ne 0 ]; then
    BACKUP_SUCCESS=false
  fi
fi

# Create manifest file
create_manifest

# Final status
if [ "$BACKUP_SUCCESS" = true ]; then
  echo -e "${GREEN}Backup completed successfully!${NC}"
  exit 0
else
  echo -e "${YELLOW}Backup completed with some warnings.${NC}"
  exit 1
fi