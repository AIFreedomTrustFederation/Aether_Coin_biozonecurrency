#!/bin/bash
# run-with-docker.sh - One-step script to run Aetherion Wallet with Docker
#
# This script automates the process of:
# 1. Setting up required environment variables
# 2. Building and starting Docker containers
# 3. Initializing the database
# 4. Providing status information
#
# Usage: ./run-with-docker.sh [--rebuild] [--clean]
#   --rebuild: Force rebuild of Docker images
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
echo "  Aetherion Wallet - Docker Deployment Script"
echo "================================================================"
echo -e "${RESET}"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${RESET}"
    echo "Please install Docker and Docker Compose before running this script."
    echo "Visit https://docs.docker.com/get-docker/ for installation instructions."
    exit 1
fi

# Check for Docker Compose
if ! (command -v docker-compose &> /dev/null || docker compose version &> /dev/null); then
    echo -e "${RED}Error: Docker Compose is not installed${RESET}"
    echo "Please install Docker Compose before running this script."
    echo "Visit https://docs.docker.com/compose/install/ for installation instructions."
    exit 1
fi

# Parse arguments
REBUILD=0
CLEAN=0

for arg in "$@"; do
    case $arg in
        --rebuild)
            REBUILD=1
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
    JWT_SECRET=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    cat > .env << EOL
# Aetherion Wallet - Docker environment configuration
# Created by run-with-docker.sh on $(date)

# Node.js environment
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=aetherion
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/aetherion

# Redis configuration
REDIS_URL=redis://redis:6379

# Security (auto-generated secure values)
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# GitHub Token (optional)
# GITHUB_TOKEN=your-github-token

# Additional configuration
# Add your custom environment variables here
EOL
    
    echo -e "${GREEN}Created .env file with default values.${RESET}"
    echo -e "${YELLOW}For production environments, please edit the .env file to set secure passwords.${RESET}"
else
    echo -e "${GREEN}Using existing .env file.${RESET}"
fi

# Clean data if requested
if [ $CLEAN -eq 1 ]; then
    echo -e "${YELLOW}Cleaning all data as requested...${RESET}"
    echo -e "${RED}WARNING: This will remove all application data!${RESET}"
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping any running containers..."
        docker-compose down -v 2>/dev/null || true
        echo "Removing volumes..."
        docker volume rm $(docker volume ls -q | grep -E 'aetherion-wallet_postgres-data|aetherion-wallet_redis-data') 2>/dev/null || true
        echo -e "${GREEN}Clean completed.${RESET}"
    else
        echo "Clean operation cancelled."
        CLEAN=0
    fi
fi

# Start Docker Compose
echo -e "${BLUE}Starting Aetherion Wallet with Docker Compose...${RESET}"

if [ $REBUILD -eq 1 ]; then
    echo "Rebuilding Docker images..."
    docker-compose build --no-cache
fi

# Start containers
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${RESET}"
sleep 5

# Check if containers are running
if ! docker-compose ps | grep -q "aetherion-app.*Up"; then
    echo -e "${RED}Error: Aetherion app container failed to start${RESET}"
    echo "Showing logs:"
    docker-compose logs aetherion-app
    exit 1
fi

# Display status
echo -e "${GREEN}${BOLD}Aetherion Wallet is now running!${RESET}"
echo
echo -e "${BOLD}Access the application at:${RESET}"
echo -e "  Main application: http://localhost:5000"
echo -e "  API Gateway: http://localhost:3001"
echo
echo -e "${BOLD}Useful commands:${RESET}"
echo -e "  View logs: ${YELLOW}docker-compose logs -f${RESET}"
echo -e "  Stop application: ${YELLOW}docker-compose down${RESET}"
echo -e "  Restart application: ${YELLOW}docker-compose restart${RESET}"
echo
echo -e "${BOLD}For more information, see CROSS-PLATFORM-DEPLOYMENT.md${RESET}"
echo