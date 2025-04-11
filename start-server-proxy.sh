#!/bin/bash

# Kill any process running on port 5000
echo "Checking for existing processes on port 5000..."
if lsof -ti:5000 >/dev/null 2>&1; then
    echo "Found process using port 5000, killing it..."
    lsof -ti:5000 | xargs kill -9
    echo "Process killed."
fi

# Start Vite in the background with host flag for Replit
echo "Starting Vite development server in background..."
cd client && ../node_modules/.bin/vite --host 0.0.0.0 &
VITE_PID=$!
cd ..

# Wait for Vite to initialize
echo "Waiting for Vite server to initialize..."
sleep 3

# Get the absolute path of the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start the proxy server
echo "Starting proxy server..."
node "$(pwd)/server-proxy.js"

# If the proxy server stops, also terminate Vite
kill $VITE_PID