#!/bin/bash
# Automated deployment script for Aetherion to cPanel hosting
# This script prepares the application for deployment to your specific cPanel environment

# Configuration - Update these variables
DEPLOY_DIR="./deployment-package"
APP_NAME="biozone-harmony-boost"
BUILD_TYPE="static" # Options: static, node
CPANEL_HOST="crispr"
CPANEL_USER="bixnyorm"  # Update with your cPanel username
DEPLOY_PATH="public_html/aetherion"  # Subdirectory under public_html

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${GREEN}"
echo "=========================================================="
echo "  Aetherion - AI Freedom Trust Deployment Package Builder"
echo "  For cPanel on $CPANEL_HOST"
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
RewriteBase /aetherion/

# Enable HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirect all requests to index.html except for actual files and directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L,QSA]

# Serve static files from the 'aifreedomtrust' directory
RewriteCond %{REQUEST_URI} ^/aetherion/aifreedomtrust/(.*)$
RewriteCond %{DOCUMENT_ROOT}/aetherion/aifreedomtrust/%1 -f
RewriteRule ^aifreedomtrust/(.*)$ aifreedomtrust/$1 [L]

# Set security headers
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set Content-Security-Policy "upgrade-insecure-requests;"
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
DOMAIN=aifreedomtrust.com
SITE_URL=https://aifreedomtrust.com
ATC_SUBDOMAIN=atc.aifreedomtrust.com
EOF

  # Copy AI Freedom Trust static site files
  echo "Copying AI Freedom Trust static site files..."
  mkdir -p "$DEPLOY_DIR/aifreedomtrust"
  cp -r client/public/aifreedomtrust/* "$DEPLOY_DIR/aifreedomtrust/"

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
# Enable the rewrite engine
RewriteEngine On

# Set the base directory
RewriteBase /aetherion/

# Enable HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy requests to Node.js server
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:8080/$1 [P,L]

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
DOMAIN=aifreedomtrust.com
SITE_URL=https://aifreedomtrust.com
ATC_SUBDOMAIN=atc.aifreedomtrust.com
EOF

  # Create a passenger config for cPanel
  echo "Creating passenger configuration for cPanel..."
  cat > "$DEPLOY_DIR/.cpanel.yml" << 'EOF'
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/user/public_html/aetherion
    - /bin/cp -R * $DEPLOYPATH
EOF

  echo -e "${GREEN}Node.js deployment package created successfully${NC}"
}

# Function to create a cPanel Node.js App deployment script
create_cpanel_app_script() {
  echo "Creating cPanel Node.js app setup script..."
  cat > "$DEPLOY_DIR/setup-cpanel-app.sh" << 'EOF'
#!/bin/bash
# This script should be run on your cPanel server to set up the Node.js application

# Configuration
APP_NAME="biozone-harmony-boost"
APP_ROOT="/home/user/public_html/aetherion"
APP_ENTRY="server.js"
APP_PORT=8080

# Print banner
echo "=========================================================="
echo "  Setting up Node.js application in cPanel"
echo "=========================================================="

# Create application directory if it doesn't exist
if [ ! -d "$APP_ROOT" ]; then
  mkdir -p "$APP_ROOT"
  echo "Created application directory: $APP_ROOT"
fi

# Install dependencies
echo "Installing dependencies..."
cd "$APP_ROOT"
npm install --production

# Create application startup script
echo "Creating application startup script..."
cat > "$APP_ROOT/start.sh" << 'EOL'
#!/bin/bash
cd "$(dirname "$0")"
NODE_ENV=production node server.js
EOL
chmod +x "$APP_ROOT/start.sh"

echo "Node.js application setup complete!"
echo "You can now use the cPanel Node.js App interface to set up and run your application."
echo "Application entry point: $APP_ENTRY"
echo "Application port: $APP_PORT"
EOF
  chmod +x "$DEPLOY_DIR/setup-cpanel-app.sh"
}

# Create README file for the deployment package
create_readme() {
  echo "Creating deployment README file..."
  cat > "$DEPLOY_DIR/DEPLOYMENT-README.md" << 'EOF'
# Aetherion Deployment Package for cPanel

This package contains the files necessary to deploy the Aetherion biozone-harmony-boost application
to your cPanel hosting environment on server "crispr".

## Quick Start Deployment Instructions

1. Upload all files in this package to your cPanel environment at: `public_html/aetherion`
   * Use the File Manager in cPanel
   * Or use FTP with your cPanel credentials

2. Set appropriate file permissions:
   * Directories: 755
   * Files: 644
   * Configuration files (.env, etc.): 600

3. Rename `.env.example` to `.env` and update the configuration values

4. Verify that the .htaccess file is properly configured for your environment

## Additional Notes

* The application is configured to run at: `https://yourdomain.com/aetherion`
* The AI Freedom Trust landing page will be accessible at: `https://yourdomain.com/aetherion/aifreedomtrust`
* For subdomain configuration, refer to DOMAIN-DEPLOYMENT.md

## Troubleshooting

If you encounter any issues:
1. Check the Apache error logs in cPanel
2. Verify that mod_rewrite is enabled
3. Ensure the file permissions are set correctly
4. Confirm that all paths in .htaccess match your actual deployment

For more detailed instructions, refer to HOSTING-DEPLOYMENT-GUIDE.md.
EOF

  # Copy the hosting deployment guide
  cp HOSTING-DEPLOYMENT-GUIDE.md "$DEPLOY_DIR/"
  cp DOMAIN-DEPLOYMENT.md "$DEPLOY_DIR/"
  cp CPANEL-README.md "$DEPLOY_DIR/"
}

# Create deployment package based on configuration
if [ "$BUILD_TYPE" = "static" ]; then
  create_static_build
else
  create_node_deployment
  create_cpanel_app_script
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

echo "You can now upload this package to your cPanel hosting environment at: $CPANEL_HOST"
echo "1. Log in to cPanel"
echo "2. Use File Manager to upload the ZIP file to your account"
echo "3. Extract the ZIP to $DEPLOY_PATH"
echo "4. Configure as per the instructions in DEPLOYMENT-README.md"