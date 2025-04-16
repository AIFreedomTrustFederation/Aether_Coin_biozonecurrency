#!/bin/bash
#
# CPanel Deployment Script for Aetherion Wallet
#
# This script prepares and deploys the Aetherion Wallet to a CPanel hosting environment
# It handles:
# 1. Building the production version
# 2. Creating necessary files for CPanel (.htaccess, etc.)
# 3. Preparing the database connection if needed
# 4. Packaging everything for easy upload

set -e
echo "======================================================="
echo "    Aetherion Wallet - CPanel Deployment Package       "
echo "======================================================="

# Configuration - Edit these variables
CPANEL_DOMAIN="atc.aifreedomtrust.com"
CPANEL_USERNAME="your_cpanel_username"
CPANEL_APP_PATH="/wallet"  # Subdirectory on your website
DB_REQUIRED=true

# Create build directory
BUILD_DIR="./build_cpanel"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Build the React application for production
echo "📦 Building application for production..."
npm run build
# Copy build files
cp -r dist/* "$BUILD_DIR"

# Create .htaccess file for React router support
echo "📝 Creating .htaccess file for SPA routing..."
cat > "$BUILD_DIR/.htaccess" << EOL
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  # Handle Front Controller Pattern (SPA routing)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.html [QSA,L]
  
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

# If database is required, create setup script
if [ "$DB_REQUIRED" = true ]; then
    echo "🗄️ Creating database setup script..."
    cat > "$BUILD_DIR/db_setup.php" << EOL
<?php
// Database setup helper for Aetherion Wallet
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
\$dbname = "cpanel_db_name";

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
    CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        wallet_address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        transaction_hash VARCHAR(255) NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
        status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS node_devices (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
        resource_type ENUM('storage', 'computation', 'bandwidth') NOT NULL,
        resource_amount INT NOT NULL,
        earnings_rate DECIMAL(10, 6) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ";
    
    \$conn->exec(\$sql);
    echo "Tables created successfully<br>";
    
    echo "<h3>Setup Completed Successfully!</h3>";
    echo "<p>Please delete this file immediately for security reasons.</p>";
} catch(PDOException \$e) {
    echo "Error: " . \$e->getMessage();
}
\$conn = null;
?>
EOL

    # Create database connection config file
    cat > "$BUILD_DIR/server/.env.production.template" << EOL
# Database Configuration
# Replace these with your actual CPanel database credentials
DB_HOST=localhost
DB_USER=cpanel_db_username
DB_PASS=your_db_password
DB_NAME=cpanel_db_name

# Security
JWT_SECRET=generate_a_secure_random_string_here
SESSION_SECRET=generate_another_secure_random_string_here

# Application Settings
NODE_ENV=production
PORT=8080
API_BASE_URL=/api
FRONTEND_URL=https://${CPANEL_DOMAIN}${CPANEL_APP_PATH}
EOL
fi

# Create installation instructions
cat > "$BUILD_DIR/CPANEL_INSTALLATION.md" << EOL
# Aetherion Wallet - CPanel Installation Instructions

This guide will help you deploy the Aetherion Wallet to your CPanel hosting environment.

## Prerequisites

1. A CPanel hosting account with:
   - PHP 7.4+ support
   - MySQL database
   - SSH access (preferred, but optional)

## Installation Steps

### 1. Database Setup (if using database)

1. Log in to CPanel
2. Go to MySQL Database Wizard
3. Create a new database and user
4. Grant all privileges to the user for this database
5. Note the database name, username, and password

### 2. Upload Files

#### Method 1: Using File Manager
1. In CPanel, open File Manager
2. Navigate to public_html/${CPANEL_APP_PATH} (create the directory if it doesn't exist)
3. Upload all files from this package into that directory

#### Method 2: Using FTP
1. Connect to your hosting using an FTP client
2. Navigate to public_html/${CPANEL_APP_PATH}
3. Upload all files from this package into that directory

### 3. Configure Environment

1. If using a database, rename server/.env.production.template to server/.env.production
2. Edit the file with your actual database credentials and paths

### 4. Run Database Setup (if using database)

1. Open your browser and navigate to https://${CPANEL_DOMAIN}${CPANEL_APP_PATH}/db_setup.php
2. Follow the on-screen instructions
3. Delete db_setup.php immediately after successful completion

### 5. Test the Installation

1. Open your browser and navigate to https://${CPANEL_DOMAIN}${CPANEL_APP_PATH}
2. The Aetherion Wallet application should load correctly

## Troubleshooting

1. If you see a 404 error for pages other than the homepage, check that .htaccess is correctly uploaded
2. If you have database connection errors, verify your database credentials
3. Check the CPanel error logs for more detailed information

## Need Help?

Contact support at support@aifreedomtrust.com
EOL

# Create a zip file for easy upload
echo "📦 Creating deployment package..."
ZIP_FILE="aetherion-cpanel-deploy.zip"
cd "$BUILD_DIR"
zip -r "../$ZIP_FILE" .
cd ..

echo "✅ Deployment package created: $ZIP_FILE"
echo "📋 Follow the instructions in CPANEL_INSTALLATION.md inside the zip file"