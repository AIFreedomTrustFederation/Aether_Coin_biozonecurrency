#!/bin/bash
# Aetherion Docker Runner Script
# This script simplifies running Aetherion across platforms using Docker

# Detect OS for platform-specific commands
OS=$(uname -s)

# Display a banner
echo "=================================="
echo "  Aetherion Cross-Platform Runner"
echo "=================================="
echo ""

# Function to validate Docker installation
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed or not in PATH"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
  fi
  
  echo "✅ Docker and Docker Compose detected"
}

# Function to create/check environment
check_environment() {
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      echo "Creating .env file from example..."
      cp .env.example .env
      echo "✅ Created .env file (please edit with your configuration)"
    else
      echo "Warning: No .env.example file found, creating minimal .env"
      echo "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/aetherion" > .env
      echo "JWT_SECRET=temporarysecret_pleasechange" >> .env
      echo "SESSION_SECRET=temporarysecret_pleasechange" >> .env
      echo "✅ Created minimal .env file (please edit with your configuration)"
    fi
  else
    echo "✅ .env file exists"
  fi
}

# Function to ensure data directories exist with proper permissions
ensure_directories() {
  mkdir -p ./data/postgres
  mkdir -p ./logs
  
  # Set permissions based on platform
  if [ "$OS" = "Linux" ]; then
    chmod -R 777 ./data/postgres
    chmod -R 777 ./logs
    echo "✅ Set Linux permissions for data directories"
  elif [ "$OS" = "Darwin" ]; then
    chmod -R 777 ./data/postgres
    chmod -R 777 ./logs
    echo "✅ Set macOS permissions for data directories"
  elif [[ "$OS" == MINGW* || "$OS" == CYGWIN* ]]; then
    echo "✅ Windows detected - Docker will handle permissions"
  fi
}

# Function to start the application
start_application() {
  echo "Starting Aetherion with Docker Compose..."
  
  # Check for platform-specific settings
  if [[ "$OS" == MINGW* || "$OS" == CYGWIN* ]]; then
    export COMPOSE_CONVERT_WINDOWS_PATHS=1
  fi
  
  # Start the containers
  docker-compose up -d
  
  # Check if containers started successfully
  if [ $? -eq 0 ]; then
    echo "✅ Aetherion started successfully!"
    echo ""
    echo "Your application is running at:"
    echo "- Web App: http://localhost:5000"
    echo "- API Gateway: http://localhost:3001"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
  else
    echo "❌ Error starting Aetherion. Check docker-compose logs."
  fi
}

# Function to check for GitHub token
check_github_token() {
  # Check if GITHUB_TOKEN is in .env
  if grep -q "GITHUB_TOKEN" .env; then
    echo "✅ GitHub token configured in .env"
  else
    echo "⚠️ Warning: No GitHub token found in .env"
    echo "GitHub synchronization may not work correctly."
    echo "To enable it, add GITHUB_TOKEN=your_token to your .env file."
  fi
}

# Main execution
check_docker
check_environment
ensure_directories
check_github_token
start_application