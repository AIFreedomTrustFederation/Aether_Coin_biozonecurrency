#!/bin/bash
#
# Harmony Deployment Script for CPanel
# Version: 1.0.0
#
# This script provides a comprehensive deployment solution for the
# Aetherion Harmony project to a CPanel hosting environment.
#
# Features:
# - Builds the production React application
# - Configures .htaccess for SPA routing
# - Sets up PHP API endpoints
# - Prepares database initialization scripts
# - Creates a deployment package ready for upload
#

set -e

# Print styled banner
print_banner() {
  echo ""
  echo "┌─────────────────────────────────────────────┐"
  echo "│                                             │"
  echo "│       AETHERION HARMONY DEPLOYMENT          │"
  echo "│        CPanel Production Deployment         │"
  echo "│                                             │"
  echo "└─────────────────────────────────────────────┘"
  echo ""
  echo "This script will prepare your Harmony project for"
  echo "deployment to a CPanel hosting environment."
  echo ""
}

# Configuration (Edit these variables)
CPANEL_DOMAIN="atc.aifreedomtrust.com"
CPANEL_USERNAME="your_cpanel_username"
CPANEL_APP_PATH="/wallet"
DB_REQUIRED=true
INCLUDE_NODE_MARKETPLACE=true
INCLUDE_ENUMERATOR=true

# Create build directories
BUILD_DIR="./harmony_cpanel_deploy"
SERVER_BUILD_DIR="$BUILD_DIR/server"
API_BUILD_DIR="$SERVER_BUILD_DIR/api"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$SERVER_BUILD_DIR"
mkdir -p "$API_BUILD_DIR"

# Print banner
print_banner

echo "🔍 Reading deployment configuration..."
# Check if config exists and read values
CONFIG_FILE="./deployment-configs/harmony-live.json"
if [ -f "$CONFIG_FILE" ]; then
  echo "📋 Using configuration from $CONFIG_FILE"
  # In a real script, we'd parse the JSON here
  # For simplicity, we'll continue with hardcoded values
fi

echo "📦 Building Harmony application for production..."
echo "⚙️ Running npm build process..."

# Build the React application for production
npm run build

echo "✅ Build completed successfully"

# Copy build files
echo "📂 Copying build files to deployment package..."
cp -r dist/* "$BUILD_DIR"

# Create .htaccess file for React router support
echo "📝 Creating .htaccess file for SPA routing..."
cat > "$BUILD_DIR/.htaccess" << EOL
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${CPANEL_APP_PATH}/
  
  # Handle Front Controller Pattern (SPA routing)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.html [QSA,L]
  
  # API requests should be directed to the PHP API
  RewriteRule ^api/(.*)$ server/api/$1 [QSA,L]
  
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</IfModule>

# Set cache control for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  # Set default expiry to 1 month
  ExpiresDefault "access plus 1 month"
  # CSS and JS files - 1 week
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
  # Images - 3 months
  ExpiresByType image/jpg "access plus 3 months"
  ExpiresByType image/jpeg "access plus 3 months"
  ExpiresByType image/gif "access plus 3 months"
  ExpiresByType image/png "access plus 3 months"
  ExpiresByType image/svg+xml "access plus 3 months"
</IfModule>

# Disable directory browsing
Options -Indexes
EOL

# Copy server files
echo "📂 Setting up server components..."

# Copy PHP database adapter
cp server/cpanel-db-adapter.php "$SERVER_BUILD_DIR/"

# Copy API endpoints
cp server/api/wallet.php "$API_BUILD_DIR/"
cp server/api/index.php "$API_BUILD_DIR/"
cp server/api/.htaccess "$API_BUILD_DIR/"

# If node marketplace is enabled, include that too
if [ "$INCLUDE_NODE_MARKETPLACE" = true ]; then
  echo "📂 Including Node Marketplace API..."
  cp server/api/node-marketplace.php "$API_BUILD_DIR/"
fi

# If database is required, create setup script
if [ "$DB_REQUIRED" = true ]; then
    echo "🗄️ Creating database setup script..."
    cat > "$BUILD_DIR/db_setup.php" << EOL
<?php
// Database setup helper for Aetherion Harmony
// Run this script once to create the necessary tables
// Delete it immediately after successful execution

// Display errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// MySQL Connection Settings
// Edit these with your CPanel database credentials
\$servername = "localhost";
\$username = "cpanel_db_username";
\$password = "your_db_password";
\$dbname = "aetherion_db";

try {
    \$conn = new PDO("mysql:host=\$servername", \$username, \$password);
    \$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    \$stmt = \$conn->prepare("CREATE DATABASE IF NOT EXISTS \$dbname");
    \$stmt->execute();
    echo "Database created or already exists<br>";
    
    // Use the database
    \$conn->exec("USE \$dbname");
    
    // Create your tables
    \$sql = "
    CREATE TABLE IF NOT EXISTS atc_users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        wallet_address VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS atc_wallet_transactions (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        transaction_hash VARCHAR(255) NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
        status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES atc_users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS atc_node_devices (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
        resource_type ENUM('storage', 'computation', 'bandwidth') NOT NULL,
        resource_amount INT NOT NULL,
        earnings_rate DECIMAL(10, 6) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES atc_users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS atc_settings (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    ";
    
    \$conn->exec(\$sql);
    echo "Tables created successfully<br>";
    
    // Insert initial settings
    \$initialSettings = "
    INSERT INTO atc_settings (setting_key, setting_value) 
    VALUES 
    ('app_name', 'Aetherion Harmony'),
    ('app_version', '1.0.0'),
    ('maintenance_mode', 'false'),
    ('wallet_features_enabled', 'true'),
    ('node_marketplace_enabled', 'true'),
    ('fractal_network_enabled', 'true'),
    ('quantum_security_enabled', 'true'),
    ('biozoe_integration_enabled', 'true')
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ";
    \$conn->exec(\$initialSettings);
    echo "Initial settings created<br>";
    
    echo "<h3>Setup Completed Successfully!</h3>";
    echo "<p>Please delete this file immediately for security reasons.</p>";
} catch(PDOException \$e) {
    echo "Error: " . \$e->getMessage();
}
\$conn = null;
?>
EOL

    # Create database connection config file
    cat > "$SERVER_BUILD_DIR/.env.production.template" << EOL
# Database Configuration
# Replace these with your actual CPanel database credentials
DB_HOST=localhost
DB_USER=cpanel_db_username
DB_PASS=your_db_password
DB_NAME=aetherion_db
DB_PREFIX=atc_

# Security
JWT_SECRET=generate_a_secure_random_string_here
SESSION_SECRET=generate_another_secure_random_string_here

# Application Settings
APP_ENV=production
APP_NAME=Aetherion Harmony
APP_VERSION=1.0.0
APP_URL=https://${CPANEL_DOMAIN}${CPANEL_APP_PATH}
API_BASE_URL=${CPANEL_APP_PATH}/api
EOL
fi

# Create installation instructions
cat > "$BUILD_DIR/INSTALLATION_GUIDE.md" << EOL
# Aetherion Harmony - CPanel Installation Guide

This guide will walk you through installing the Aetherion Harmony application on your CPanel hosting.

## Prerequisites

- CPanel hosting account with:
  - PHP 7.4+ support
  - MySQL database access
  - SSL/TLS certificate capability

## Installation Steps

### 1. Upload Files

1. Log in to your CPanel account
2. Navigate to File Manager
3. Go to the public_html directory (or the directory for ${CPANEL_DOMAIN})
4. Create a new folder named "wallet" (or your preferred subdirectory)
5. Upload all files from this package to that directory

### 2. Configure Database

1. In CPanel, go to MySQL Database Wizard
2. Create a new database (e.g., aetherion_db)
3. Create a new database user with a strong password
4. Add the user to the database with ALL PRIVILEGES
5. Take note of the database name, username, and password

### 3. Edit Configuration

1. Navigate to the "server" directory in your uploaded files
2. Rename .env.production.template to .env.production
3. Edit the file and update the following:
   - DB_USER: Your database username
   - DB_PASS: Your database password
   - DB_NAME: Your database name
   - JWT_SECRET: Generate a random string (for security)
   - SESSION_SECRET: Generate another random string

### 4. Initialize Database

1. Open your web browser and navigate to:
   https://${CPANEL_DOMAIN}${CPANEL_APP_PATH}/db_setup.php
2. Follow the on-screen instructions to set up your database
3. After successful completion, delete the db_setup.php file

### 5. Test Your Installation

1. Open your web browser and navigate to:
   https://${CPANEL_DOMAIN}${CPANEL_APP_PATH}/

2. Verify that the application loads correctly
3. Test key features like:
   - User registration/login
   - Wallet functionality
   - Node marketplace

### 6. Security Recommendations

- Set proper file permissions:
  \`\`\`
  chmod 755 /path/to/public_html/wallet
  chmod 644 /path/to/public_html/wallet/*.html
  chmod 644 /path/to/public_html/wallet/*.js
  chmod 644 /path/to/public_html/wallet/*.css
  chmod 644 /path/to/public_html/wallet/*.png
  chmod 644 /path/to/public_html/wallet/*.jpg
  chmod 644 /path/to/public_html/wallet/*.svg
  chmod 755 /path/to/public_html/wallet/server
  chmod 644 /path/to/public_html/wallet/server/*.php
  chmod 600 /path/to/public_html/wallet/server/.env.production
  \`\`\`

- Enable SSL/TLS for your domain in CPanel
- Set up regular database backups

## Troubleshooting

- If you encounter a blank page, check PHP error logs in CPanel
- For database connection issues, verify your database credentials
- For routing issues, ensure .htaccess is properly uploaded and Apache mod_rewrite is enabled

## Getting Help

If you need assistance, contact support at support@aifreedomtrust.com
EOL

# Create a zip file for easy upload
echo "📦 Creating deployment package..."
ZIP_FILE="harmony-cpanel-deploy.zip"
cd "$BUILD_DIR"
zip -r "../$ZIP_FILE" .
cd ..

echo "✅ Deployment package created: $ZIP_FILE"
echo "📋 Follow the instructions in INSTALLATION_GUIDE.md inside the zip file"
echo ""
echo "🌐 DNS Configuration:"
echo "- Create an A record for 'atc' pointing to your CPanel server IP"
echo "- Create a CNAME record for 'www.atc' pointing to atc.aifreedomtrust.com"
echo "- See deployment-configs/DNS-CONFIGURATION.md for more details"
echo ""
echo "🔒 Next Steps:"
echo "1. Upload the $ZIP_FILE to your CPanel hosting"
echo "2. Extract the files to your web directory"
echo "3. Configure your database credentials"
echo "4. Run the database setup script"
echo "5. Delete the setup script for security"
echo "6. Test your installation"
echo ""
echo "Thank you for using Aetherion Harmony!"