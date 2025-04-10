#!/bin/bash
# Aetherion workflow script for Replit
# This script resolves the git rebase issue and starts the application correctly

echo "=== Aetherion Startup Script ==="
echo "Starting application on port 5000..."

# First, ensure git is in a clean state
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "Detected an in-progress rebase operation. Cleaning up..."
  rm -rf .git/rebase-apply 2>/dev/null
  rm -rf .git/rebase-merge 2>/dev/null
  echo "Git rebase state cleaned."
fi

# Start the application on port 5000
echo "Starting development server..."
exec npx vite --port 5000 --host 0.0.0.0