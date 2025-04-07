/**
 * deploy-to-domain.js
 * Deployment script for traditional hosting at atc.aifreedomtrust.com/wallet
 * 
 * This script:
 * 1. Builds the application
 * 2. Generates deployment instructions for a traditional web server
 * 3. Can be extended to include automated deployment via SSH
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Initialize env
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const DOMAIN = 'atc.aifreedomtrust.com';
const DEPLOY_PATH = '/wallet';
const BUILD_DIR = path.join(__dirname, 'dist');
const SERVER_SCRIPT = 'server-redirect.js';

// Ensure the necessary directories exist
if (!fs.existsSync('deployment-guides')) {
  fs.mkdirSync('deployment-guides');
}

/**
 * Build the application
 */
function buildApplication() {
  console.log('Building application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully!');
    return true;
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  }
}

/**
 * Generate Nginx configuration for the domain
 */
function generateNginxConfig() {
  const nginxConfig = `
server {
    listen 80;
    server_name ${DOMAIN};

    location ${DEPLOY_PATH} {
        proxy_pass http://localhost:3000${DEPLOY_PATH};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Redirect root to ${DEPLOY_PATH}
    location = / {
        return 301 ${DEPLOY_PATH};
    }

    # For Let's Encrypt
    location ~ /.well-known {
        allow all;
    }
}
`;

  const nginxPath = path.join('deployment-guides', 'nginx-config.conf');
  fs.writeFileSync(nginxPath, nginxConfig);
  console.log(`Nginx configuration saved to ${nginxPath}`);
}

/**
 * Generate systemd service file
 */
function generateSystemdService() {
  const systemdService = `
[Unit]
Description=Aetherion UI Wallet
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/aetherion
ExecStart=/usr/bin/node /path/to/aetherion/${SERVER_SCRIPT}
Restart=on-failure
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

  const systemdPath = path.join('deployment-guides', 'aetherion.service');
  fs.writeFileSync(systemdPath, systemdService);
  console.log(`Systemd service file saved to ${systemdPath}`);
}

/**
 * Generate deployment instructions
 */
function generateDeploymentInstructions() {
  const instructions = `
# Aetherion Deployment to ${DOMAIN}${DEPLOY_PATH}

## Files to Deploy
1. Copy the entire 'dist' directory to your server
2. Copy 'server-redirect.js' to your server
3. Copy 'package.json' to your server

## Server Setup
1. Install Node.js (v18.x or higher) and npm on your server
2. Run 'npm install --production' in the directory with package.json
3. Configure Nginx using the provided nginx-config.conf
4. Set up the systemd service using the provided aetherion.service
5. Obtain SSL certificate using Let's Encrypt:
   certbot --nginx -d ${DOMAIN}

## Starting the Application
1. Replace placeholders in the systemd service file
2. Run: sudo systemctl enable aetherion
3. Run: sudo systemctl start aetherion

## Verifying Deployment
1. Check server status: sudo systemctl status aetherion
2. Check application logs: journalctl -u aetherion
3. Visit https://${DOMAIN}${DEPLOY_PATH} in your browser

## Troubleshooting
- If Nginx shows 502 errors, ensure the Node.js server is running
- If files aren't loading, check permissions on the dist directory
- For SSL issues, verify Let's Encrypt certificates are properly installed
`;

  const instructionsPath = path.join('deployment-guides', 'deployment-instructions.md');
  fs.writeFileSync(instructionsPath, instructions);
  console.log(`Deployment instructions saved to ${instructionsPath}`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Build the application
    const buildSuccess = buildApplication();
    if (!buildSuccess) {
      console.error('Deployment preparation aborted due to build failure.');
      process.exit(1);
    }
    
    // Generate deployment materials
    generateNginxConfig();
    generateSystemdService();
    generateDeploymentInstructions();
    
    // Output deployment summary
    console.log('\n--- Deployment Summary ---');
    console.log(`Target Domain: ${DOMAIN}`);
    console.log(`Application Path: ${DEPLOY_PATH}`);
    console.log(`Full URL: https://${DOMAIN}${DEPLOY_PATH}`);
    console.log('\nDeployment guides generated in ./deployment-guides/');
    console.log('Follow the instructions in deployment-instructions.md to complete the setup');
    
  } catch (error) {
    console.error('Deployment preparation failed:', error);
    process.exit(1);
  }
}

// Execute main function
main();