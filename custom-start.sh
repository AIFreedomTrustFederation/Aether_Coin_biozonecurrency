#!/bin/bash

# Kill any existing processes on port 5000
fuser -k 5000/tcp 2>/dev/null

# Start the main server in the background
echo "Starting main server on port 3000..."
node server.js &
MAIN_PID=$!

# Wait a moment for the main server to start
sleep 3

# Start the proxy server
echo "Starting proxy server on port 5000..."
node port-proxy.js &
PROXY_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down servers..."
  kill $MAIN_PID $PROXY_PID 2>/dev/null
  exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $MAIN_PID $PROXY_PID