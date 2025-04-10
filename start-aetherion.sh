#!/bin/bash
# Aetherion startup script that starts both Vite server and the redirect server

echo "=== Aetherion Startup Script ==="
echo "Fixing git rebase issues if present..."

# Clean up any git rebase state
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "Detected an in-progress rebase operation. Cleaning up..."
  rm -rf .git/rebase-apply 2>/dev/null
  rm -rf .git/rebase-merge 2>/dev/null
  echo "Git rebase state cleaned."
fi

echo "Starting Vite development server and redirect server..."

# Start Vite server in the background
npm run dev &
VITE_PID=$!

# Wait a few seconds for Vite to start
echo "Waiting for Vite server to start..."
sleep 5

# Start redirect server
echo "Starting redirect server on port 5000..."
node server.js

# If redirect server exits, kill Vite server
kill $VITE_PID