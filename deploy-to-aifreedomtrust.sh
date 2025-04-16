#!/bin/bash
# Enhanced Automated Deployment Script for Aetherion Wallet with FractalCoin Integration
# Target: atc.aifreedomtrust.com/dapp and /wallet

# Set color variables
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}====================================================================${NC}"
echo -e "${GREEN}       Aetherion Wallet Deployment to AI Freedom Trust${NC}"
echo -e "${BLUE}====================================================================${NC}"
echo -e "${YELLOW}This script deploys the Aetherion Wallet to atc.aifreedomtrust.com${NC}"
echo -e "${BLUE}====================================================================${NC}"

# Create deployment directory
DEPLOY_DIR="deployment-package"
mkdir -p $DEPLOY_DIR

# Build frontend
echo -e "${GREEN}Building frontend application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed! Aborting deployment.${NC}"
    exit 1
fi
echo -e "${GREEN}Frontend build successful.${NC}"

# Copy frontend files to deployment directory
echo -e "${GREEN}Copying frontend files to deployment package...${NC}"
cp -r dist/* $DEPLOY_DIR/
cp CNAME $DEPLOY_DIR/

# Create server directory and copy backend files
echo -e "${GREEN}Preparing backend files...${NC}"
mkdir -p $DEPLOY_DIR/api
cp -r server/api/* $DEPLOY_DIR/api/

# Create deployment configs
echo -e "${GREEN}Creating configuration files...${NC}"
mkdir -p $DEPLOY_DIR/config
cat > $DEPLOY_DIR/config/config.php <<EOF
<?php
// Configuration for Aetherion Wallet API
// Environment: Production
// Platform: AI Freedom Trust (atc.aifreedomtrust.com)

return [
    'database' => [
        'host' => 'localhost',
        'dbname' => 'aifreedom_aetherion',
        'username' => 'aifreedom_atcuser',
        // Password should be set after deployment
        'password' => '',
    ],
    'cors' => [
        'allowed_origins' => [
            'https://atc.aifreedomtrust.com',
            'https://www.atc.aifreedomtrust.com',
        ],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
    ],
    'security' => [
        'jwt_secret' => '', // Set after deployment
        'token_expiry' => 86400, // 24 hours
    ],
    'fractalcoin' => [
        'api_endpoint' => 'https://api.fractalcoin.network/v1',
        'api_key' => '', // Set after deployment
    ],
];
EOF

# Create .htaccess file for API security
cat > $DEPLOY_DIR/api/.htaccess <<EOF
# Secure API directory
Options -Indexes
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php?path=\$1 [QSA,L]
</IfModule>

# Force HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</IfModule>

# Set security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.aifreedomtrust.com https://api.fractalcoin.network;"
</IfModule>

# Block access to sensitive files
<FilesMatch "^(\.htaccess|\.htpasswd|config\.php)$">
    Order deny,allow
    Deny from all
</FilesMatch>
EOF

# Create .htaccess for frontend (root)
cat > $DEPLOY_DIR/.htaccess <<EOF
# Frontend .htaccess for SPA routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Force HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType application/x-font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    ExpiresByType application/vnd.ms-fontobject "access plus 1 year"
    ExpiresByType application/x-font-ttf "access plus 1 year"
    ExpiresByType font/opentype "access plus 1 year"
</IfModule>

# Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>
EOF

# Create a README for the deployment
cat > $DEPLOY_DIR/README.txt <<EOF
Aetherion Wallet Deployment Package
===================================

This package contains all files needed to deploy the Aetherion Wallet to atc.aifreedomtrust.com.

Deployment Instructions:
1. Upload all files to the document root of atc.aifreedomtrust.com
2. Configure the API by editing /config/config.php with database credentials and security keys
3. Create the necessary database tables using the included SQL files
4. Test the deployment by visiting https://atc.aifreedomtrust.com

Security Recommendations:
- Make sure all API keys and secrets are properly set in the config file
- Ensure the database user has minimal required permissions
- Check that all .htaccess files are properly loaded
- Set up SSL certificates for HTTPS
- Configure database backups

For support, contact: support@aifreedomtrust.com
EOF

# Create installation SQL script
mkdir -p $DEPLOY_DIR/sql
cat > $DEPLOY_DIR/sql/install.sql <<EOF
-- Aetherion Wallet Database Installation Script
-- For: atc.aifreedomtrust.com

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address VARCHAR(255) NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    balance DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tx_hash VARCHAR(255) NOT NULL UNIQUE,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    fee DECIMAL(18, 8) NOT NULL,
    status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    block_number INT NULL,
    block_hash VARCHAR(255) NULL
);

-- Create fractalnode_marketplace table
CREATE TABLE IF NOT EXISTS fractalnode_marketplace (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_id VARCHAR(100) NOT NULL UNIQUE,
    owner_address VARCHAR(255) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Api keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    permissions JSON NOT NULL,
    last_used TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert initial data (if needed)
-- For example, create an admin user (password should be changed after deployment)
-- INSERT INTO users (username, email, password_hash)
-- VALUES ('admin', 'admin@aifreedomtrust.com', '$2y$10$YOUR_BCRYPT_HASH_HERE');
EOF

# Create database backup script
cat > $DEPLOY_DIR/api/backup-db.php <<EOF
<?php
/**
 * Aetherion Wallet Database Backup Script
 * This script creates a backup of the Aetherion database
 * It should be scheduled to run regularly via cron
 */

// Load configuration
\$config = require_once __DIR__ . '/../config/config.php';

// Get timestamp for filename
\$timestamp = date('Y-m-d_H-i-s');
\$backupFile = __DIR__ . '/../backups/aetherion_backup_' . \$timestamp . '.sql';

// Make sure backup directory exists
if (!file_exists(__DIR__ . '/../backups')) {
    mkdir(__DIR__ . '/../backups', 0755, true);
}

// Build the mysqldump command
\$command = sprintf(
    'mysqldump --host=%s --user=%s --password=%s %s > %s',
    escapeshellarg(\$config['database']['host']),
    escapeshellarg(\$config['database']['username']),
    escapeshellarg(\$config['database']['password']),
    escapeshellarg(\$config['database']['dbname']),
    escapeshellarg(\$backupFile)
);

// Execute the command
\$output = [];
\$returnVar = 0;
exec(\$command, \$output, \$returnVar);

// Check if successful
if (\$returnVar === 0) {
    echo "Backup created successfully: " . \$backupFile . "\n";
    
    // Delete old backups (keep only the last 7 days)
    \$backupDir = __DIR__ . '/../backups/';
    \$files = glob(\$backupDir . 'aetherion_backup_*.sql');
    \$now = time();
    
    foreach (\$files as \$file) {
        if (is_file(\$file)) {
            if (\$now - filemtime(\$file) >= 7 * 24 * 60 * 60) { // 7 days
                unlink(\$file);
                echo "Deleted old backup: " . \$file . "\n";
            }
        }
    }
} else {
    echo "Error creating backup\n";
}
EOF

# Create a deployment verification script
cat > $DEPLOY_DIR/verify-deployment.php <<EOF
<?php
/**
 * Aetherion Wallet Deployment Verification
 * This script checks if all components of the Aetherion Wallet are properly deployed
 */

header('Content-Type: text/plain');

echo "Aetherion Wallet Deployment Verification\n";
echo "=======================================\n\n";

// Check PHP version
echo "PHP Version: " . phpversion() . "\n";
if (version_compare(phpversion(), '7.4.0', '<')) {
    echo "ERROR: PHP version should be at least 7.4.0\n";
} else {
    echo "PHP version check: PASSED\n";
}

echo "\n";

// Check required PHP extensions
\$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'openssl', 'curl', 'mbstring'];
echo "Checking PHP extensions:\n";
foreach (\$requiredExtensions as \$ext) {
    if (extension_loaded(\$ext)) {
        echo " - {$ext}: LOADED\n";
    } else {
        echo " - {$ext}: MISSING (Required)\n";
    }
}

echo "\n";

// Check configuration file
echo "Checking configuration file:\n";
if (file_exists(__DIR__ . '/config/config.php')) {
    echo " - Config file exists: YES\n";
    
    \$config = require_once __DIR__ . '/config/config.php';
    
    // Check database configuration
    if (!empty(\$config['database']['host']) && 
        !empty(\$config['database']['dbname']) && 
        !empty(\$config['database']['username'])) {
        echo " - Database configuration: COMPLETE\n";
    } else {
        echo " - Database configuration: INCOMPLETE\n";
    }
    
    // Check security configuration
    if (!empty(\$config['security']['jwt_secret'])) {
        echo " - Security configuration: COMPLETE\n";
    } else {
        echo " - Security configuration: INCOMPLETE\n";
    }
} else {
    echo " - Config file exists: NO\n";
}

echo "\n";

// Check database connection
echo "Checking database connection:\n";
try {
    \$config = require_once __DIR__ . '/config/config.php';
    \$dsn = "mysql:host={\$config['database']['host']};dbname={\$config['database']['dbname']}";
    \$pdo = new PDO(\$dsn, \$config['database']['username'], \$config['database']['password']);
    echo " - Database connection: SUCCESS\n";
    
    // Check if tables exist
    \$tables = ['users', 'wallets', 'transactions', 'fractalnode_marketplace', 'api_keys'];
    foreach (\$tables as \$table) {
        \$stmt = \$pdo->query("SHOW TABLES LIKE '{\$table}'");
        if (\$stmt->rowCount() > 0) {
            echo " - Table '{$table}': EXISTS\n";
        } else {
            echo " - Table '{$table}': MISSING\n";
        }
    }
} catch (PDOException \$e) {
    echo " - Database connection: FAILED\n";
    echo " - Error: " . \$e->getMessage() . "\n";
}

echo "\n";

// Check .htaccess files
echo "Checking .htaccess files:\n";
if (file_exists(__DIR__ . '/.htaccess')) {
    echo " - Root .htaccess: EXISTS\n";
} else {
    echo " - Root .htaccess: MISSING\n";
}

if (file_exists(__DIR__ . '/api/.htaccess')) {
    echo " - API .htaccess: EXISTS\n";
} else {
    echo " - API .htaccess: MISSING\n";
}

echo "\n";

// Check API endpoints
echo "Checking API endpoints:\n";
\$apiEndpoints = [
    '/api/health.php',
    '/api/wallet.php',
    '/api/node-marketplace.php'
];

foreach (\$apiEndpoints as \$endpoint) {
    if (file_exists(__DIR__ . \$endpoint)) {
        echo " - {$endpoint}: EXISTS\n";
    } else {
        echo " - {$endpoint}: MISSING\n";
    }
}

echo "\n";

// Simple health check test
echo "Performing API health check:\n";
\$healthCheck = @file_get_contents('http://' . \$_SERVER['HTTP_HOST'] . '/api/health.php');
if (\$healthCheck !== false) {
    echo " - Health check response: " . trim(\$healthCheck) . "\n";
} else {
    echo " - Health check: FAILED\n";
}

echo "\n";
echo "Verification completed at: " . date('Y-m-d H:i:s') . "\n";
EOF

# Create API health check endpoint
cat > $DEPLOY_DIR/api/health.php <<EOF
<?php
/**
 * Aetherion Wallet API Health Check
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Load configuration
\$configFile = __DIR__ . '/../config/config.php';
\$configExists = file_exists(\$configFile);

// Prepare response
\$response = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'version' => '1.0.0',
    'environment' => 'production',
    'config_exists' => \$configExists,
    'php_version' => phpversion(),
    'server' => 'aifreedomtrust',
];

// Check database connection if config exists
if (\$configExists) {
    try {
        \$config = require_once \$configFile;
        \$dsn = "mysql:host={\$config['database']['host']};dbname={\$config['database']['dbname']}";
        \$pdo = new PDO(\$dsn, \$config['database']['username'], \$config['database']['password']);
        \$response['database'] = 'connected';
    } catch (PDOException \$e) {
        \$response['status'] = 'warning';
        \$response['database'] = 'error';
        \$response['database_message'] = 'Connection failed';
    }
} else {
    \$response['status'] = 'warning';
    \$response['database'] = 'unknown';
    \$response['message'] = 'Configuration file not found';
}

// Return the response
echo json_encode(\$response, JSON_PRETTY_PRINT);
EOF

# Create a zip file of the deployment package
echo -e "${GREEN}Creating deployment archive...${NC}"
zip -r aetherion-aifreedomtrust-deployment.zip $DEPLOY_DIR

echo -e "${BLUE}====================================================================${NC}"
echo -e "${GREEN}Deployment package created: aetherion-aifreedomtrust-deployment.zip${NC}"
echo -e "${BLUE}====================================================================${NC}"
echo -e "${YELLOW}Upload this package to your CPanel File Manager at atc.aifreedomtrust.com${NC}"
echo -e "${YELLOW}Extract the package to your document root${NC}"
echo -e "${YELLOW}Configure the database settings in config/config.php${NC}"
echo -e "${YELLOW}Run the SQL script in sql/install.sql to create the database tables${NC}"
echo -e "${BLUE}====================================================================${NC}"

# Cleanup
rm -rf $DEPLOY_DIR

echo -e "${GREEN}Deployment package prepared successfully!${NC}"