#!/bin/bash

# Change to API Gateway directory
cd api-gateway

# Install dependencies if needed
npm install

# Start the API Gateway
npx tsx src/index.ts