#!/bin/bash
# Automated deployment script for Aetherion to cPanel hosting
# This script prepares the application for deployment to a cPanel environment

# Configuration - Update these variables
DEPLOY_DIR="./deployment-package"
APP_NAME="aetherion"
BUILD_TYPE="static" # Options: static, node

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${GREEN}"
echo "=========================================================="
echo "  Aetherion - AI Freedom Trust Deployment Package Builder"
echo "=========================================================="
echo -e "${NC}"

# Create deployment directory if it doesn't exist
if [ ! -d "$DEPLOY_DIR" ]; then
  mkdir -p "$DEPLOY_DIR"
  echo -e "${GREEN}Created deployment directory: $DEPLOY_DIR${NC}"
else
  # Clean the directory
  rm -rf "$DEPLOY_DIR"/*
  echo -e "${GREEN}Cleaned deployment directory: $DEPLOY_DIR${NC}"
fi

# Function to create a static build deployment package
create_static_build() {
  echo -e "${YELLOW}Creating static deployment package...${NC}"
  
  # Build the application
  echo "Building the application..."
  npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Aborting deployment.${NC}"
    exit 1
  fi
  
  # Copy build output to deployment directory
  echo "Copying build files to deployment directory..."
  cp -r dist/* "$DEPLOY_DIR"
  
  # Create .htaccess file
  echo "Creating .htaccess file for static deployment..."
  cat > "$DEPLOY_DIR/.htaccess" << 'EOF'
# Enable the rewrite engine
RewriteEngine On

# Set the base directory
RewriteBase /

# Redirect all requests to index.html except for actual files and directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L,QSA]

# Serve static files from the 'aifreedomtrust' directory
RewriteCond %{REQUEST_URI} ^/aifreedomtrust/(.*)$
RewriteCond %{DOCUMENT_ROOT}/aifreedomtrust/%1 -f
RewriteRule ^aifreedomtrust/(.*)$ aifreedomtrust/$1 [L]

# Set security headers
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "strict-origin-when-cross-origin"
EOF

  # Create a sample .env file
  echo "Creating sample .env file..."
  cat > "$DEPLOY_DIR/.env.example" << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Application Configuration
NODE_ENV=production
PORT=8080
EOF

  echo -e "${GREEN}Static deployment package created successfully${NC}"
}

# Function to create a Node.js deployment package
create_node_deployment() {
  echo -e "${YELLOW}Creating Node.js deployment package...${NC}"
  
  # Create package structure
  mkdir -p "$DEPLOY_DIR/client/public"
  
  # Copy server files
  echo "Copying server files..."
  cp server.js "$DEPLOY_DIR/"
  cp package.json "$DEPLOY_DIR/"
  cp -r server "$DEPLOY_DIR/"
  cp -r shared "$DEPLOY_DIR/"
  
  # Build the client application
  echo "Building the client application..."
  npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Aborting deployment.${NC}"
    exit 1
  fi
  
  # Copy client files
  echo "Copying client files..."
  cp -r dist/* "$DEPLOY_DIR/client/public/"
  cp -r client/public/* "$DEPLOY_DIR/client/public/"
  
  # Create a start script
  echo "Creating start script..."
  cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
NODE_ENV=production node server.js
EOF
  chmod +x "$DEPLOY_DIR/start.sh"
  
  # Create .htaccess file for Node.js proxy
  echo "Creating .htaccess file for Node.js proxy..."
  cat > "$DEPLOY_DIR/.htaccess" << 'EOF'
# Proxy requests to Node.js server
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:8080/$1 [P,L]
EOF

  # Create a sample .env file
  echo "Creating sample .env file..."
  cat > "$DEPLOY_DIR/.env.example" << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Application Configuration
NODE_ENV=production
PORT=8080
EOF

  echo -e "${GREEN}Node.js deployment package created successfully${NC}"
}

# Create README file for the deployment package
create_readme() {
  echo "Creating deployment README file..."
  cat > "$DEPLOY_DIR/DEPLOYMENT-README.md" << 'EOF'
# Aetherion Deployment Package

This package contains the files necessary to deploy the Aetherion application
to a web hosting environment.

## Deployment Instructions

1. Upload all files in this package to your web hosting environment
2. Set appropriate file permissions:
   - Directories: 755
   - Files: 644
   - Configuration files (.env, etc.): 600
3. Rename `.env.example` to `.env` and update the configuration values
4. For database setup, refer to the HOSTING-DEPLOYMENT-GUIDE.md file

## Additional Notes

- The .htaccess file contains the necessary rewrite rules for the application
- If deploying to a subdirectory, modify the RewriteBase directive in .htaccess

For more detailed instructions, refer to the HOSTING-DEPLOYMENT-GUIDE.md file.
EOF

  # Copy the hosting deployment guide
  cp HOSTING-DEPLOYMENT-GUIDE.md "$DEPLOY_DIR/"
}

# Create deployment package based on configuration
if [ "$BUILD_TYPE" = "static" ]; then
  create_static_build
else
  create_node_deployment
fi

# Create README file
create_readme

# Create deployment zip file
echo "Creating deployment zip file..."
cd "$DEPLOY_DIR"
zip -r ../${APP_NAME}-deployment-package.zip ./*
cd ..

echo -e "${GREEN}"
echo "=========================================================="
echo "  Deployment package created successfully!"
echo "  Location: ${APP_NAME}-deployment-package.zip"
echo "=========================================================="
echo -e "${NC}"

echo "You can now upload this package to your cPanel hosting environment."
echo "Please follow the instructions in DEPLOYMENT-README.md for next steps."