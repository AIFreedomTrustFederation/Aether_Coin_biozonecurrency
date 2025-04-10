#!/bin/bash

# Kill any process running on port 5000
echo "Checking for existing processes on port 5000..."
if lsof -ti:5000 >/dev/null 2>&1; then
    echo "Found process using port 5000, killing it..."
    lsof -ti:5000 | xargs kill -9
    echo "Process killed."
fi

# Start Vite in the background
echo "Starting Vite development server in background..."
vite &
VITE_PID=$!

# Wait for Vite to initialize
echo "Waiting for Vite server to initialize..."
sleep 3

# Start the proxy server
echo "Starting proxy server..."
node server-proxy.js

# If the proxy server stops, also terminate Vite
kill $VITE_PID