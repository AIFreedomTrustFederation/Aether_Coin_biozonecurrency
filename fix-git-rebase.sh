#!/bin/bash

# fix-git-rebase.sh
# Script to safely abort an in-progress git rebase operation

echo "=== Aetherion Git Rebase Fix ==="
echo "This script will help resolve the 'in the middle of a rebase' error"
echo "by safely aborting the rebase and resetting the repository state."
echo

# Create backup directory for untracked files
BACKUP_DIR="git_rebase_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Move untracked files to backup directory
echo "Moving untracked files to backup directory..."
git status --porcelain | grep '??' | sed 's/^?? //' | while read file; do
  # Create the directory structure in the backup
  mkdir -p "$BACKUP_DIR/$(dirname "$file")"
  # Copy the file to backup
  cp -f "$file" "$BACKUP_DIR/$file"
done

# Check if we're actually in a rebase
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "Detected an in-progress rebase operation."
  echo "Current state:"
  git status
  
  echo
  echo "Proceeding to abort the rebase operation..."
  # Force the rebase abort
  rm -rf .git/rebase-apply
  rm -rf .git/rebase-merge
  
  echo
  echo "Rebase manually aborted. Current state:"
  git status
  
  echo
  echo "Restoring files from backup..."
  cp -R $BACKUP_DIR/* .
  
  echo
  echo "Files restored from backup."
  echo "Your repository should now be in a clean state."
else
  echo "No rebase operation in progress detected."
  echo "Current git status:"
  git status
fi

echo
echo "Backup of your untracked files is available in: $BACKUP_DIR"
echo "Script completed. You may need to manually commit and push changes."