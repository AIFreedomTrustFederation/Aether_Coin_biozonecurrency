#!/bin/bash

# First, kill any existing processes using port 5000
echo "Checking for existing processes on port 5000..."
if lsof -ti:5000 >/dev/null; then
    echo "Found process using port 5000, killing it..."
    lsof -ti:5000 | xargs kill -9
    echo "Process killed."
fi

# Start the port redirector in the background
echo "Starting port redirector..."
node port-redirector.js &
REDIRECTOR_PID=$!

# Wait a moment for the redirector to start
sleep 1

# Start the Vite dev server using the original dev script
echo "Starting Vite development server..."
vite

# If the Vite server stops, also terminate the redirector
kill $REDIRECTOR_PID