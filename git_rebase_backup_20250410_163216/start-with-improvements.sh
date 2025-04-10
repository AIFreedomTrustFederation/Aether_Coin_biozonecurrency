#!/bin/bash

# Run the auto-improvements script
echo "Running automated improvements..."
node scripts/auto-improvements.js

# Start the application normally
echo "Starting Aetherion application..."
npm run start