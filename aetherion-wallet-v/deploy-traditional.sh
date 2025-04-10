#!/bin/bash
# deploy-traditional.sh - One-step script to deploy Aetherion Wallet without Docker
#
# This script automates the process of:
# 1. Installing dependencies
# 2. Setting up environment variables
# 3. Building the application
# 4. Initializing the database
# 5. Starting the application
#
# Usage: ./deploy-traditional.sh [--build-only] [--clean]
#   --build-only: Only build the app without starting it
#   --clean: Remove all data and start fresh

set -e

# ANSI color codes
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RED="\033[31m"

# Banner
echo -e "${BLUE}${BOLD}"
echo "================================================================"
echo "  Aetherion Wallet - Standalone Deployment Script"
echo "================================================================"
echo -e "${RESET}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${RESET}"
    echo "Please install Node.js v20 or higher before running this script."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}Error: Node.js version 20 or higher is required${RESET}"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js before running this script."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${RESET}"
    echo "Please install npm before running this script."
    exit 1
fi

# Check for PostgreSQL client
if ! command -v pg_isready &> /dev/null; then
    echo -e "${YELLOW}Warning: PostgreSQL client tools not found${RESET}"
    echo "PostgreSQL client tools are recommended for database operations."
    echo "The application may still work if the database is properly configured."
fi

# Parse arguments
BUILD_ONLY=0
CLEAN=0

for arg in "$@"; do
    case $arg in
        --build-only)
            BUILD_ONLY=1
            shift
            ;;
        --clean)
            CLEAN=1
            shift
            ;;
        *)
            # Unknown option
            echo -e "${YELLOW}Warning: Unknown option $arg${RESET}"
            shift
            ;;
    esac
done

# Check for .env file and create if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating one with default values.${RESET}"
    echo -e "${YELLOW}For production use, please edit the .env file with secure values.${RESET}"
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
    SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
    
    cat > .env << EOL
# Aetherion Wallet - Standalone environment configuration
# Created by deploy-traditional.sh on $(date)

# Node.js environment
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database configuration
# Change these values to connect to your PostgreSQL instance
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aetherion

# Redis configuration (optional, used for caching)
REDIS_URL=redis://localhost:6379

# Security (auto-generated secure values)
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# GitHub Token (optional)
# GITHUB_TOKEN=your-github-token

# Additional configuration
# Add your custom environment variables here
EOL
    
    echo -e "${GREEN}Created .env file with default values.${RESET}"
    echo -e "${YELLOW}Please edit the .env file to set correct database connection details.${RESET}"
else
    echo -e "${GREEN}Using existing .env file.${RESET}"
fi

# Clean data if requested
if [ $CLEAN -eq 1 ]; then
    echo -e "${YELLOW}Cleaning installation as requested...${RESET}"
    echo -e "${RED}WARNING: This will remove node_modules and build directories!${RESET}"
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing node_modules..."
        rm -rf node_modules
        echo "Removing dist directory..."
        rm -rf dist
        echo "Removing build artifacts..."
        rm -rf .cache .parcel-cache
        echo -e "${GREEN}Clean completed.${RESET}"
    else
        echo "Clean operation cancelled."
        CLEAN=0
    fi
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${RESET}"
npm ci

# Build the application
echo -e "${BLUE}Building the application...${RESET}"
npm run build

echo -e "${GREEN}Build completed successfully.${RESET}"

# Exit if build-only flag is set
if [ $BUILD_ONLY -eq 1 ]; then
    echo -e "${YELLOW}Build-only flag set, exiting without starting the application.${RESET}"
    echo -e "To start the application, run: ${BOLD}npm run start${RESET}"
    exit 0
fi

# Initialize database
echo -e "${BLUE}Initializing database...${RESET}"
echo -e "${YELLOW}Note: This step requires a running PostgreSQL database.${RESET}"
echo -e "${YELLOW}If you encounter errors, check your DATABASE_URL in the .env file.${RESET}"

if npm run db:push; then
    echo -e "${GREEN}Database initialization successful.${RESET}"
else
    echo -e "${RED}Database initialization failed.${RESET}"
    echo -e "${YELLOW}Please check your database connection and try again.${RESET}"
    echo -e "You can edit the .env file to update the DATABASE_URL."
    echo -e "To manually initialize the database later, run: ${BOLD}npm run db:push${RESET}"
fi

# Start the application
echo -e "${BLUE}Starting Aetherion Wallet...${RESET}"
echo -e "${YELLOW}The application will start in the foreground. Press Ctrl+C to stop.${RESET}"
echo -e "${YELLOW}For production use, consider using PM2 or a systemd service.${RESET}"
echo

# Start the application
npm run start