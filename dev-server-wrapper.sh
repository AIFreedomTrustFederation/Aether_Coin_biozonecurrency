#!/bin/bash

# This script wraps the npm run dev command to ensure the server starts on port 5000
# Since we can't directly modify package.json or vite.config.ts

echo "Starting Aetherion development server on port 5000..."

# Use custom configuration for Vite through environment variables
export VITE_PORT=5000

# Start the Vite server with host and port flags to override defaults
npx vite --port 5000 --host 0.0.0.0