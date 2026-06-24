#!/bin/bash
# sync-frontend-repos.sh
#
# This script synchronizes the frontend code between Aether_Coin_biozonecurrency (source)
# and biozone-harmony-boost (target) repositories.
#
# It should be run on the server where both repositories are hosted.
# Set up as a cron job for automatic synchronization.
#
# Usage: ./sync-frontend-repos.sh [--force]
#   --force: Skip confirmation prompt and force synchronization

# Configuration
SOURCE_REPO="/path/to/Aether_Coin_biozonecurrency"
TARGET_REPO="/path/to/biozone-harmony-boost"
LOG_FILE="/var/log/frontend-sync.log"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK:-}" # Optional: Set in environment or .env file

# Directories to synchronize (relative to repository root)
SYNC_DIRS=(
  "client"
  "public"
)

# Files to synchronize (relative to repository root)
SYNC_FILES=(
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "server-redirect.js"
  ".env.example"
  "vite.config.ts"
  "tailwind.config.js"
  "postcss.config.js"
)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables if .env exists
if [ -f "${SOURCE_REPO}/.env" ]; then
  export $(grep -v '^#' "${SOURCE_REPO}/.env" | xargs)
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Function to log messages
log() {
  local message="$1"
  local level="${2:-INFO}"
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Function to send Slack notification
send_slack_notification() {
  local status="$1"
  local message="$2"
  local color="good"
  
  if [ "$status" != "success" ]; then
    color="danger"
  fi
  
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data "{\"attachments\":[{\"color\":\"${color}\",\"title\":\"Frontend Sync ${status^}\",\"text\":\"${message}\"}]}" \
      "$SLACK_WEBHOOK_URL" > /dev/null
    
    if [ $? -eq 0 ]; then
      log "Slack notification sent" "INFO"
    else
      log "Failed to send Slack notification" "ERROR"
    fi
  fi
}

# Function to check if repositories exist
check_repos() {
  if [ ! -d "$SOURCE_REPO" ]; then
    log "Source repository not found: $SOURCE_REPO" "ERROR"
    send_slack_notification "error" "Source repository not found: $SOURCE_REPO"
    exit 1
  fi
  
  if [ ! -d "$TARGET_REPO" ]; then
    log "Target repository not found: $TARGET_REPO" "ERROR"
    send_slack_notification "error" "Target repository not found: $TARGET_REPO"
    exit 1
  }
  
  log "Repositories found" "INFO"
}

# Function to check for changes
check_for_changes() {
  local has_changes=false
  
  log "Checking for changes in source repository..." "INFO"
  
  # Check directories
  for dir in "${SYNC_DIRS[@]}"; do
    if [ -d "${SOURCE_REPO}/${dir}" ]; then
      if [ ! -d "${TARGET_REPO}/${dir}" ] || \
         [ "$(find "${SOURCE_REPO}/${dir}" -type f -exec md5sum {} \; | sort | md5sum)" != \
           "$(find "${TARGET_REPO}/${dir}" -type f -exec md5sum {} \; | sort | md5sum 2>/dev/null)" ]; then
        log "Changes detected in directory: ${dir}" "INFO"
        has_changes=true
      fi
    fi
  done
  
  # Check files
  for file in "${SYNC_FILES[@]}"; do
    if [ -f "${SOURCE_REPO}/${file}" ]; then
      if [ ! -f "${TARGET_REPO}/${file}" ] || \
         [ "$(md5sum "${SOURCE_REPO}/${file}" | cut -d' ' -f1)" != \
           "$(md5sum "${TARGET_REPO}/${file}" 2>/dev/null | cut -d' ' -f1)" ]; then
        log "Changes detected in file: ${file}" "INFO"
        has_changes=true
      fi
    fi
  done
  
  if [ "$has_changes" = false ]; then
    log "No changes detected. Repositories are in sync." "INFO"
    exit 0
  fi
  
  return 0
}

# Function to synchronize repositories
sync_repos() {
  local force="$1"
  local sync_timestamp=$(date "+%Y%m%d%H%M%S")
  local backup_dir="${TARGET_REPO}_backup_${sync_timestamp}"
  
  # Create backup of target repository
  log "Creating backup of target repository: ${backup_dir}" "INFO"
  cp -r "$TARGET_REPO" "$backup_dir"
  
  if [ $? -ne 0 ]; then
    log "Failed to create backup. Aborting sync." "ERROR"
    send_slack_notification "error" "Failed to create backup of target repository. Sync aborted."
    exit 1
  fi
  
  # Confirm synchronization if not forced
  if [ "$force" != "--force" ]; then
    read -p "Are you sure you want to synchronize the repositories? This will overwrite files in the target repository. (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log "Synchronization cancelled by user" "INFO"
      exit 0
    fi
  fi
  
  log "Starting synchronization..." "INFO"
  
  # Synchronize directories
  for dir in "${SYNC_DIRS[@]}"; do
    if [ -d "${SOURCE_REPO}/${dir}" ]; then
      log "Synchronizing directory: ${dir}" "INFO"
      
      # Create target directory if it doesn't exist
      mkdir -p "${TARGET_REPO}/${dir}"
      
      # Use rsync for efficient directory synchronization
      rsync -av --delete "${SOURCE_REPO}/${dir}/" "${TARGET_REPO}/${dir}/" >> "$LOG_FILE" 2>&1
      
      if [ $? -ne 0 ]; then
        log "Failed to synchronize directory: ${dir}" "ERROR"
      else
        log "Successfully synchronized directory: ${dir}" "INFO"
      fi
    else
      log "Source directory not found: ${dir}" "WARN"
    fi
  done
  
  # Synchronize files
  for file in "${SYNC_FILES[@]}"; do
    if [ -f "${SOURCE_REPO}/${file}" ]; then
      log "Synchronizing file: ${file}" "INFO"
      
      # Create target directory if it doesn't exist
      mkdir -p "$(dirname "${TARGET_REPO}/${file}")"
      
      # Copy file
      cp "${SOURCE_REPO}/${file}" "${TARGET_REPO}/${file}" >> "$LOG_FILE" 2>&1
      
      if [ $? -ne 0 ]; then
        log "Failed to synchronize file: ${file}" "ERROR"
      else
        log "Successfully synchronized file: ${file}" "INFO"
      fi
    else
      log "Source file not found: ${file}" "WARN"
    fi
  done
  
  # Special handling for .env file - don't overwrite, but update with new variables
  if [ -f "${SOURCE_REPO}/.env.example" ] && [ -f "${TARGET_REPO}/.env" ]; then
    log "Updating .env file with new variables from .env.example" "INFO"
    
    # Extract variables from source .env.example
    source_vars=$(grep -v '^#' "${SOURCE_REPO}/.env.example" | cut -d= -f1)
    
    # For each variable in source, check if it exists in target .env
    for var in $source_vars; do
      if ! grep -q "^${var}=" "${TARGET_REPO}/.env"; then
        # Variable doesn't exist in target, add it with example value
        example_value=$(grep "^${var}=" "${SOURCE_REPO}/.env.example" | cut -d= -f2-)
        echo "${var}=${example_value}" >> "${TARGET_REPO}/.env"
        log "Added new variable to .env: ${var}" "INFO"
      fi
    done
  fi
  
  log "Synchronization completed successfully" "INFO"
  send_slack_notification "success" "Frontend repositories synchronized successfully. Backup created at ${backup_dir}"
}

# Function to update package.json name and repository fields
update_package_json() {
  if [ -f "${TARGET_REPO}/package.json" ]; then
    log "Updating package.json in target repository" "INFO"
    
    # Use temporary file for sed operations
    tmp_file=$(mktemp)
    
    # Update name field
    sed 's/"name": "aetherion"/"name": "biozone-harmony-boost"/' "${TARGET_REPO}/package.json" > "$tmp_file"
    
    # Update repository field if it exists
    if grep -q '"repository":' "$tmp_file"; then
      sed -i 's|"url": ".*"|"url": "https://github.com/AIFreedomTrustFederation/biozone-harmony-boost.git"|' "$tmp_file"
    fi
    
    # Move temporary file back
    mv "$tmp_file" "${TARGET_REPO}/package.json"
    
    log "package.json updated successfully" "INFO"
  fi
}

# Main execution
main() {
  local force="$1"
  
  log "=== Frontend Repository Synchronization Started ===" "INFO"
  log "Source: $SOURCE_REPO" "INFO"
  log "Target: $TARGET_REPO" "INFO"
  
  # Check if repositories exist
  check_repos
  
  # Check for changes
  check_for_changes
  
  # Synchronize repositories
  sync_repos "$force"
  
  # Update package.json
  update_package_json
  
  log "=== Frontend Repository Synchronization Completed ===" "INFO"
}

# Execute main function with arguments
main "$1"