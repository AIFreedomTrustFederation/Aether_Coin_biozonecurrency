/**
 * deploy-to-crispr.js
 * 
 * Deployment script for the Aetherion Ecosystem to crispr.fah-dc3-ds.com
 * 
 * This script:
 * 1. Builds the application
 * 2. Creates a deployment package
 * 3. Generates deployment instructions
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Target deployment URL
  targetUrl: 'https://crispr.fah-dc3-ds.com',
  
  // Deployment package name
  packageName: 'aetherion-ecosystem-deployment',
  
  // Timestamp for unique filenames
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  
  // Directories to include in the package
  includeDirs: [
    'client',
    'public',
    'shared',
    'server',
    'aetherion-wallet-v1.0.0/client/src/assets'
  ],
  
  // Files to include in the package root
  includeFiles: [
    'index.js',
    'combined-server.js',
    'config.js',
    'api-modules.js',
    'package.json',
    'package-lock.json',
    '.env.example',
    'README.md'
  ],
  
  // Output directory for the deployment package
  outputDir: path.join(__dirname, 'deployment-package')
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

/**
 * Print styled banner message
 */
function printBanner() {
  console.log(`${colors.cyan}${colors.bright}
  ┌─────────────────────────────────────────────────┐
  │            Aetherion Ecosystem                  │
  │       Deployment Package Generator              │
  │                                                 │
  │         Target: crispr.fah-dc3-ds.com           │
  └─────────────────────────────────────────────────┘
  ${colors.reset}`);
}

/**
 * Execute a command and return a promise
 * @param {string} command - Command to execute
 * @returns {Promise<string>} - Command output
 */
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

/**
 * Create the output directory if it doesn't exist
 */
function createOutputDir() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
    console.log(`${colors.green}✓ Created output directory: ${config.outputDir}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}! Output directory already exists: ${config.outputDir}${colors.reset}`);
  }
}

/**
 * Copy directories and files to the output directory
 */
function copyFilesToOutputDir() {
  // Copy directories
  for (const dir of config.includeDirs) {
    const source = path.join(__dirname, dir);
    const destination = path.join(config.outputDir, dir);
    
    if (fs.existsSync(source)) {
      fs.mkdirSync(destination, { recursive: true });
      
      // Use cp -r for directories
      try {
        execPromise(`cp -r ${source}/* ${destination}`);
        console.log(`${colors.green}✓ Copied directory: ${dir}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}✗ Failed to copy directory ${dir}: ${error.message}${colors.reset}`);
      }
    } else {
      console.warn(`${colors.yellow}! Directory not found: ${source}${colors.reset}`);
    }
  }
  
  // Copy individual files
  for (const file of config.includeFiles) {
    const source = path.join(__dirname, file);
    const destination = path.join(config.outputDir, file);
    
    if (fs.existsSync(source)) {
      try {
        fs.copyFileSync(source, destination);
        console.log(`${colors.green}✓ Copied file: ${file}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}✗ Failed to copy file ${file}: ${error.message}${colors.reset}`);
      }
    } else {
      console.warn(`${colors.yellow}! File not found: ${source}${colors.reset}`);
    }
  }
}

/**
 * Create deployment configuration files
 */
function createDeploymentConfig() {
  // Create a deployment-specific .env file
  const envContent = `# Aetherion Ecosystem Deployment Configuration
# Generated on: ${new Date().toISOString()}
# Target: ${config.targetUrl}

PORT=80
NODE_ENV=production
PUBLIC_URL=${config.targetUrl}

# Database configuration
# Replace these with your production database credentials
# DATABASE_URL=postgres://username:password@hostname:port/database

# API Keys - Make sure to set these in your production environment
# STRIPE_SECRET_KEY=
# OPENAI_API_KEY=
`;

  fs.writeFileSync(path.join(config.outputDir, '.env.production'), envContent);
  console.log(`${colors.green}✓ Created deployment environment configuration${colors.reset}`);
  
  // Create deployment readme
  const readmeContent = `# Aetherion Ecosystem Deployment
  
## Deployment Instructions for crispr.fah-dc3-ds.com

This package contains the Aetherion Ecosystem application prepared for deployment
to ${config.targetUrl}.

## Quick Start

1. Upload this entire directory to your server
2. Create a .env file with your production environment variables
3. Install dependencies: \`npm install --production\`
4. Start the application: \`npm start\`

## Directory Structure

- \`client/\`: Frontend assets and components
- \`server/\`: Backend server code
- \`shared/\`: Shared code between client and server
- \`aetherion-wallet-v1.0.0/\`: Aetherion Wallet assets
- \`combined-server.js\`: Main server entry point

## Environment Variables

Make sure to set the following environment variables in your production environment:

- \`PORT\`: The port to run the server on (default: 80)
- \`NODE_ENV\`: Should be set to 'production'
- \`DATABASE_URL\`: Your PostgreSQL connection string (if using a database)
- \`STRIPE_SECRET_KEY\`: Your Stripe secret key (if using Stripe)
- \`OPENAI_API_KEY\`: Your OpenAI API key (if using OpenAI)

## Support

For issues or questions, please contact the AI Freedom Trust team.
`;

  fs.writeFileSync(path.join(config.outputDir, 'DEPLOYMENT.md'), readmeContent);
  console.log(`${colors.green}✓ Created deployment instructions${colors.reset}`);
}

/**
 * Create a Nginx configuration file for the deployment
 */
function createNginxConfig() {
  const nginxConfig = `# Nginx configuration for Aetherion Ecosystem
# Place this file in /etc/nginx/sites-available/ and create a symlink to it in sites-enabled

server {
    listen 80;
    server_name ${config.targetUrl.replace('https://', '')};

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ${config.targetUrl.replace('https://', '')};

    # SSL certificate configuration
    ssl_certificate /etc/letsencrypt/live/${config.targetUrl.replace('https://', '')}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${config.targetUrl.replace('https://', '')}/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    ssl_session_cache shared:SSL:10m;
    
    # Root directory
    root /var/www/aetherion-ecosystem;
    
    # Proxy settings for the Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
}
`;

  fs.writeFileSync(path.join(config.outputDir, 'nginx.conf'), nginxConfig);
  console.log(`${colors.green}✓ Created Nginx configuration file${colors.reset}`);
}

/**
 * Create a systemd service file
 */
function createSystemdService() {
  const serviceFile = `[Unit]
Description=Aetherion Ecosystem
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/aetherion-ecosystem
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
`;

  fs.writeFileSync(path.join(config.outputDir, 'aetherion-ecosystem.service'), serviceFile);
  console.log(`${colors.green}✓ Created systemd service file${colors.reset}`);
}

/**
 * Create a start script for the deployment
 */
function createStartScript() {
  const startScript = `#!/bin/bash
# Start script for Aetherion Ecosystem
# This script starts the application and ensures it keeps running

# Load environment variables
source .env.production

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    exit 1
fi

# Start the application
echo "Starting Aetherion Ecosystem..."
npm start
`;

  fs.writeFileSync(path.join(config.outputDir, 'start.sh'), startScript);
  fs.chmodSync(path.join(config.outputDir, 'start.sh'), '755');
  console.log(`${colors.green}✓ Created start script${colors.reset}`);
}

/**
 * Update package.json for production
 */
function updatePackageJson() {
  const packageJsonPath = path.join(config.outputDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    
    // Update package.json for production
    packageJson.scripts = {
      ...packageJson.scripts,
      start: 'NODE_ENV=production node combined-server.js'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${colors.green}✓ Updated package.json for production${colors.reset}`);
  } else {
    console.error(`${colors.red}✗ package.json not found in output directory${colors.reset}`);
  }
}

/**
 * Create the deployment package
 */
async function createDeploymentPackage() {
  // Create output directory
  createOutputDir();
  
  // Copy files to output directory
  copyFilesToOutputDir();
  
  // Create deployment configuration
  createDeploymentConfig();
  
  // Create Nginx configuration
  createNginxConfig();
  
  // Create systemd service file
  createSystemdService();
  
  // Create start script
  createStartScript();
  
  // Update package.json for production
  updatePackageJson();
  
  // Create a zip file of the package
  const zipFilename = `${config.packageName}-${config.timestamp}.zip`;
  try {
    console.log(`${colors.blue}Creating deployment package zip...${colors.reset}`);
    await execPromise(`cd ${config.outputDir} && zip -r ../${zipFilename} .`);
    console.log(`${colors.green}✓ Created deployment package: ${zipFilename}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to create zip file: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}! You can manually zip the contents of ${config.outputDir}${colors.reset}`);
  }
}

/**
 * Display final instructions
 */
function displayInstructions() {
  const zipFilename = `${config.packageName}-${config.timestamp}.zip`;
  
  console.log(`
${colors.cyan}${colors.bright}Deployment Package Created Successfully!${colors.reset}

${colors.bright}Next Steps:${colors.reset}

1. ${colors.yellow}Upload the deployment package to your server:${colors.reset}
   scp ${zipFilename} user@${config.targetUrl.replace('https://', '')}:/tmp/

2. ${colors.yellow}SSH into your server:${colors.reset}
   ssh user@${config.targetUrl.replace('https://', '')}

3. ${colors.yellow}Extract the package:${colors.reset}
   mkdir -p /var/www/aetherion-ecosystem
   unzip /tmp/${zipFilename} -d /var/www/aetherion-ecosystem
   cd /var/www/aetherion-ecosystem

4. ${colors.yellow}Configure the environment:${colors.reset}
   cp .env.production .env
   nano .env  # Edit with your production configuration

5. ${colors.yellow}Install dependencies:${colors.reset}
   npm install --production

6. ${colors.yellow}Set up Nginx:${colors.reset}
   sudo cp nginx.conf /etc/nginx/sites-available/aetherion-ecosystem
   sudo ln -s /etc/nginx/sites-available/aetherion-ecosystem /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx

7. ${colors.yellow}Set up systemd service:${colors.reset}
   sudo cp aetherion-ecosystem.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable aetherion-ecosystem
   sudo systemctl start aetherion-ecosystem

8. ${colors.yellow}Check status:${colors.reset}
   sudo systemctl status aetherion-ecosystem
   curl -I ${config.targetUrl}

${colors.bright}Your application should now be deployed at: ${config.targetUrl}${colors.reset}
`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Print banner
    printBanner();
    
    // Create deployment package
    await createDeploymentPackage();
    
    // Display final instructions
    displayInstructions();
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main();