#!/bin/bash
# create-deployment-package.sh - Script to create a deployable package for Aetherion Wallet
#
# This script automates the process of:
# 1. Building the application
# 2. Collecting necessary files
# 3. Creating a deployable ZIP archive
#
# Usage: ./create-deployment-package.sh [--version VERSION]

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
echo "  Aetherion Wallet - Deployment Package Creator"
echo "================================================================"
echo -e "${RESET}"

# Parse arguments
# Set default version
VERSION="1.0.0"

# Try to extract version from package.json
if [ -f "package.json" ]; then
    # Different methods to extract version (for compatibility with various formats)
    VERSION_FROM_JSON=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' package.json | grep -o '[0-9][0-9.]*' | head -1)
    if [ -n "$VERSION_FROM_JSON" ]; then
        VERSION="$VERSION_FROM_JSON"
    fi
fi

for arg in "$@"; do
    case $arg in
        --version=*)
            VERSION="${arg#*=}"
            shift
            ;;
        *)
            # Unknown option
            echo -e "${YELLOW}Warning: Unknown option $arg${RESET}"
            shift
            ;;
    esac
done

echo -e "Detected version: ${GREEN}${VERSION}${RESET}"

# Create a temporary directory for the package
PACKAGE_DIR="aetherion-wallet-v${VERSION}"
echo -e "${BLUE}Creating deployment package v${VERSION}...${RESET}"

# Remove previous package if it exists
if [ -d "$PACKAGE_DIR" ]; then
    echo "Removing existing package directory..."
    rm -rf "$PACKAGE_DIR"
fi

# Create package directory structure
mkdir -p "$PACKAGE_DIR"

# Copy deployment scripts
echo "Copying deployment scripts..."
cp run-with-docker.sh "$PACKAGE_DIR"
cp deploy-traditional.sh "$PACKAGE_DIR"
cp setup-github-sync.sh "$PACKAGE_DIR" 2>/dev/null || true
cp sync-to-github.sh "$PACKAGE_DIR" 2>/dev/null || true
cp resolve-conflicts.sh "$PACKAGE_DIR" 2>/dev/null || true
chmod +x "$PACKAGE_DIR"/*.sh

# Copy Docker configuration
echo "Copying Docker configuration..."
cp docker-compose.yml "$PACKAGE_DIR" 2>/dev/null || true
cp Dockerfile "$PACKAGE_DIR" 2>/dev/null || true

# Copy documentation
echo "Copying documentation..."
cp README.md "$PACKAGE_DIR" 2>/dev/null || true
cp CROSS-PLATFORM-DEPLOYMENT.md "$PACKAGE_DIR" 2>/dev/null || true
cp GITHUB-SYNC-TROUBLESHOOTING.md "$PACKAGE_DIR" 2>/dev/null || true
cp LICENSE "$PACKAGE_DIR" 2>/dev/null || true
cp CHANGELOG.md "$PACKAGE_DIR" 2>/dev/null || true

# Copy configuration files
echo "Copying configuration files..."
cp package.json "$PACKAGE_DIR"
cp package-lock.json "$PACKAGE_DIR" 2>/dev/null || true
cp .env.example "$PACKAGE_DIR"
cp drizzle.config.ts "$PACKAGE_DIR" 2>/dev/null || true
cp tsconfig.json "$PACKAGE_DIR" 2>/dev/null || true
cp vite.config.js "$PACKAGE_DIR" 2>/dev/null || true
cp vite.config.ts "$PACKAGE_DIR" 2>/dev/null || true
cp tailwind.config.js "$PACKAGE_DIR" 2>/dev/null || true
cp postcss.config.js "$PACKAGE_DIR" 2>/dev/null || true

# Copy source code directories
echo "Copying source code..."

# Check if directories exist before copying
mkdir -p "$PACKAGE_DIR/client" "$PACKAGE_DIR/server" "$PACKAGE_DIR/shared" "$PACKAGE_DIR/api-gateway"

# Client
if [ -d "client/src" ]; then
    echo "Copying client code..."
    mkdir -p "$PACKAGE_DIR/client/src"
    cp -r client/src/* "$PACKAGE_DIR/client/src/" 2>/dev/null || true
    
    # Copy client configuration
    cp client/*.json "$PACKAGE_DIR/client/" 2>/dev/null || true
    cp client/*.js "$PACKAGE_DIR/client/" 2>/dev/null || true
fi

# Server
if [ -d "server/src" ]; then
    echo "Copying server code..."
    mkdir -p "$PACKAGE_DIR/server/src"
    cp -r server/src/* "$PACKAGE_DIR/server/src/" 2>/dev/null || true
    
    # Copy server configuration
    cp server/*.json "$PACKAGE_DIR/server/" 2>/dev/null || true
    cp server/*.js "$PACKAGE_DIR/server/" 2>/dev/null || true
fi

# Shared
if [ -d "shared/src" ]; then
    echo "Copying shared code..."
    mkdir -p "$PACKAGE_DIR/shared/src"
    cp -r shared/src/* "$PACKAGE_DIR/shared/src/" 2>/dev/null || true
    
    # Copy shared configuration
    cp shared/*.json "$PACKAGE_DIR/shared/" 2>/dev/null || true
    cp shared/*.js "$PACKAGE_DIR/shared/" 2>/dev/null || true
fi

# API Gateway
if [ -d "api-gateway/src" ]; then
    echo "Copying API gateway code..."
    mkdir -p "$PACKAGE_DIR/api-gateway/src"
    cp -r api-gateway/src/* "$PACKAGE_DIR/api-gateway/src/" 2>/dev/null || true
    
    # Copy API gateway configuration
    cp api-gateway/*.json "$PACKAGE_DIR/api-gateway/" 2>/dev/null || true
    cp api-gateway/*.js "$PACKAGE_DIR/api-gateway/" 2>/dev/null || true
fi

# Or, if we just have a flatter structure
if [ -d "src" ]; then
    echo "Copying source code from src directory..."
    mkdir -p "$PACKAGE_DIR/src"
    cp -r src/* "$PACKAGE_DIR/src/" 2>/dev/null || true
fi

# Create a zip archive
echo -e "${BLUE}Creating ZIP archive...${RESET}"
ZIP_FILE="aetherion-wallet-v${VERSION}.zip"

# Remove previous ZIP if it exists
if [ -f "$ZIP_FILE" ]; then
    echo "Removing existing ZIP file..."
    rm -f "$ZIP_FILE"
fi

# Create ZIP
if command -v zip &> /dev/null; then
    zip -r "$ZIP_FILE" "$PACKAGE_DIR"
else
    echo -e "${YELLOW}Warning: 'zip' command not found, skipping ZIP creation.${RESET}"
    echo "You can manually create a ZIP from the '$PACKAGE_DIR' directory."
fi

# Create README for deployment package
cat > "$PACKAGE_DIR/DEPLOYMENT-README.md" << EOL
# Aetherion Wallet v${VERSION} - Deployment Package

This package contains everything needed to deploy Aetherion Wallet on any platform.

## Quick Start

### Option 1: Docker Deployment (Recommended)

1. Ensure Docker and Docker Compose are installed
2. Run:
   \`\`\`
   ./run-with-docker.sh
   \`\`\`
3. Access the application at http://localhost:5000

### Option 2: Traditional Deployment

1. Ensure Node.js (v20+) and PostgreSQL are installed
2. Run:
   \`\`\`
   ./deploy-traditional.sh
   \`\`\`
3. Access the application at http://localhost:5000

## Detailed Instructions

For complete deployment documentation, see [CROSS-PLATFORM-DEPLOYMENT.md](CROSS-PLATFORM-DEPLOYMENT.md)

## GitHub Integration

To set up GitHub synchronization:

1. Run \`./setup-github-sync.sh\`
2. To push changes and create releases: \`./sync-to-github.sh\`
3. For troubleshooting, see [GITHUB-SYNC-TROUBLESHOOTING.md](GITHUB-SYNC-TROUBLESHOOTING.md)

## Package Contents

- Deployment scripts: \`run-with-docker.sh\`, \`deploy-traditional.sh\`
- GitHub tools: \`setup-github-sync.sh\`, \`sync-to-github.sh\`, \`resolve-conflicts.sh\`
- Docker configuration: \`docker-compose.yml\`, \`Dockerfile\`
- Source code: \`client/\`, \`server/\`, \`shared/\`, \`api-gateway/\`
- Documentation: \`README.md\`, \`CROSS-PLATFORM-DEPLOYMENT.md\`, etc.
- Configuration: \`package.json\`, \`.env.example\`, etc.

## Version Information

- Package Version: ${VERSION}
- Created On: $(date)

For support or more information, see the main [README.md](README.md)
EOL

echo -e "${GREEN}Deployment package created:${RESET}"
echo -e "- Directory: ${BOLD}$PACKAGE_DIR${RESET}"
if [ -f "$ZIP_FILE" ]; then
    echo -e "- ZIP Archive: ${BOLD}$ZIP_FILE${RESET}"
fi
echo -e "\n${GREEN}You can now distribute this package for deployment on any platform.${RESET}"
echo -e "${YELLOW}For detailed deployment instructions, see ${BOLD}CROSS-PLATFORM-DEPLOYMENT.md${RESET}"