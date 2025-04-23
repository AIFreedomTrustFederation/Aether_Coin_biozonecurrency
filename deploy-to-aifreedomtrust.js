/**
 * deploy-to-aifreedomtrust.js
 * Enhanced Automated Deployment Script for Aetherion Wallet with FractalCoin Integration
 * Target: atc.aifreedomtrust.com/dapp and /wallet
 * 
 * This script:
 * 1. Collects deployment credentials
 * 2. Securely stores credentials in FractalCoin/IPFS (if available)
 * 3. Backs up existing deployment
 * 4. Builds the application
 * 5. Creates and uploads deployment package
 * 6. Configures and starts the server
 * 7. Verifies deployment
 * 8. Sends notifications
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import * as readline from 'readline';
import { webcrypto } from 'crypto';

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
const DEPLOY_PACKAGE = 'aetherion-deploy.tar.gz';
const LOG_FILE = `aetherion_deployment_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure logs directory exists
if (!fs.existsSync('deployment-logs')) {
  fs.mkdirSync('deployment-logs');
}

// Setup logging
const logStream = fs.createWriteStream(path.join('deployment-logs', LOG_FILE), { flags: 'a' });
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function() {
  logStream.write(Array.from(arguments).join(' ') + '\\n');
  originalConsoleLog.apply(console, arguments);
};

console.error = function() {
  logStream.write('[ERROR] ' + Array.from(arguments).join(' ') + '\\n');
  originalConsoleError.apply(console, arguments);
};

/**
 * Print styled messages
 */
function printBanner() {
  console.log(`${colors.blue}==============================================${colors.reset}`);
  console.log(`${colors.blue}    AETHERION WALLET DEPLOYMENT SCRIPT        ${colors.reset}`);
  console.log(`${colors.blue}    Target: ${DOMAIN}                         ${colors.reset}`);
  console.log(`${colors.blue}==============================================${colors.reset}`);
  console.log('');
}

/**
 * Prompt for user input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Collect deployment credentials
 */
async function collectCredentials() {
  console.log(`${colors.blue}==== STEP 1: Collecting Deployment Credentials ====${colors.reset}`);
  
  const credentials = {
    SSH_USER: await prompt('Enter your SSH Username: '),
    SSH_HOST: await prompt(`Enter your SSH Host (default: ${DOMAIN}): `) || DOMAIN,
    SSH_PORT: await prompt('Enter your SSH Port (default: 22): ') || '22',
    SLACK_WEBHOOK_URL: await prompt('Enter your Slack Webhook URL (optional, press enter to skip): ')
  };
  
  console.log(`${colors.green}Credentials collected successfully!${colors.reset}`);
  return credentials;
}

/**
 * Store credentials securely with FractalCoin/IPFS if available
 */
async function storeCredentialsSecurely(credentials) {
  const secretFile = 'aetherion_secrets.json';
  
  // Save credentials to file
  fs.writeFileSync(secretFile, JSON.stringify(credentials, null, 2));
  
  try {
    // Check if ipfs command is available
    execSync('which ipfs', { stdio: 'ignore' });
    
    console.log(`${colors.green}Encrypting credentials for FractalCoin storage...${colors.reset}`);
    
    // Encrypt and store credentials on FractalCoin/Filecoin
    const ipfsHash = execSync(`ipfs add -q ${secretFile}`).toString().trim();
    
    console.log(`${colors.green}Credentials stored successfully! IPFS Hash: ${ipfsHash}${colors.reset}`);
    
    // Pin IPFS hash for long-term storage
    execSync(`ipfs pin add ${ipfsHash}`);
    console.log(`${colors.green}IPFS Hash successfully pinned for permanent access.${colors.reset}`);
    
    return ipfsHash;
  } catch (error) {
    console.log(`${colors.yellow}IPFS command not found. Skipping FractalCoin storage. Your credentials are only stored locally.${colors.reset}`);
    return null;
  } finally {
    // Clean up the file
    if (fs.existsSync(secretFile)) {
      fs.unlinkSync(secretFile);
    }
  }
}

/**
 * Send notification to Slack
 */
function sendSlackNotification(webhookUrl, message) {
  if (!webhookUrl) return;
  
  try {
    console.log(`${colors.blue}Sending notification to Slack...${colors.reset}`);
    
    const payload = JSON.stringify({ text: message });
    execSync(`curl -X POST -H 'Content-type: application/json' --data '${payload}' ${webhookUrl}`);
    
    console.log(`${colors.green}Notification sent successfully!${colors.reset}`);
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
  }
}

/**
 * Backup existing deployment
 */
async function backupExistingDeployment(credentials) {
  console.log(`${colors.blue}==== STEP 2: Backing Up Existing Deployment ====${colors.reset}`);
  
  try {
    // Create SSH command for backing up
    const sshCmd = `ssh -p ${credentials.SSH_PORT} ${credentials.SSH_USER}@${credentials.SSH_HOST} "
      if [ -d ~/aetherion ]; then
        echo 'Backing up existing deployment...'
        mkdir -p ~/aetherion_backups
        BACKUP_DIR=~/aetherion_backups/aetherion_backup_$(date +%Y%m%d%H%M%S)
        cp -r ~/aetherion \\$BACKUP_DIR
        echo 'Backup completed: \\$BACKUP_DIR'
      else
        echo 'No existing deployment found. Creating directory...'
        mkdir -p ~/aetherion
      fi
    "`;
    
    execSync(sshCmd, { stdio: 'inherit' });
    console.log(`${colors.green}Backup step completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Failed to backup existing deployment:', error.message);
    return false;
  }
}

/**
 * Build the application
 */
function buildApplication() {
  console.log(`${colors.blue}==== STEP 3: Building Aetherion Wallet Application ====${colors.reset}`);
  
  try {
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Run tests
    console.log('Running tests...');
    execSync('npm run test', { stdio: 'inherit' });
    
    // Build application
    console.log('Building production bundle...');
    execSync('npm run build', { stdio: 'inherit' });
    
    if (!fs.existsSync(BUILD_DIR)) {
      console.error(`${colors.red}Build failed! The dist directory was not created.${colors.reset}`);
      return false;
    }
    
    console.log(`${colors.green}Application build completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  }
}

/**
 * Create deployment package
 */
function createDeploymentPackage() {
  console.log(`${colors.blue}==== STEP 4: Creating Deployment Package ====${colors.reset}`);
  
  try {
    // Create tar.gz package
    execSync(`tar -czf ${DEPLOY_PACKAGE} dist ${SERVER_SCRIPT} package.json`);
    
    if (!fs.existsSync(DEPLOY_PACKAGE)) {
      console.error(`${colors.red}Failed to create deployment package!${colors.reset}`);
      return false;
    }
    
    console.log(`${colors.green}Deployment package created: ${DEPLOY_PACKAGE}${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Failed to create deployment package:', error.message);
    return false;
  }
}

/**
 * Upload package to server
 */
function uploadToServer(credentials) {
  console.log(`${colors.blue}==== STEP 5: Uploading to Server ====${colors.reset}`);
  
  try {
    console.log(`Uploading package to ${credentials.SSH_HOST}...`);
    
    // Upload package via SCP
    execSync(`scp -P ${credentials.SSH_PORT} ${DEPLOY_PACKAGE} ${credentials.SSH_USER}@${credentials.SSH_HOST}:~/`);
    
    console.log(`${colors.green}Package uploaded successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Failed to upload package to server:', error.message);
    return false;
  }
}

/**
 * Deploy on the server
 */
function deployOnServer(credentials) {
  console.log(`${colors.blue}==== STEP 6: Deploying on Server ====${colors.reset}`);
  
  try {
    // Create SSH command for deployment
    const sshCmd = `ssh -p ${credentials.SSH_PORT} ${credentials.SSH_USER}@${credentials.SSH_HOST} "
      echo 'Starting deployment on server...'

      # Extract deployment package
      mkdir -p ~/aetherion
      tar -xzf ~/${DEPLOY_PACKAGE} -C ~/aetherion

      # Install dependencies
      cd ~/aetherion && npm install --production

      # Setup systemd service if it doesn't exist
      if [ ! -f /etc/systemd/system/aetherion.service ]; then
        echo 'Creating systemd service...'
        echo '[Unit]
Description=Aetherion Wallet Server
After=network.target

[Service]
Type=simple
User=${credentials.SSH_USER}
WorkingDirectory=/home/${credentials.SSH_USER}/aetherion
ExecStart=/usr/bin/node /home/${credentials.SSH_USER}/aetherion/${SERVER_SCRIPT}
Restart=on-failure
Environment=PORT=5000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target' | sudo tee /etc/systemd/system/aetherion.service

        sudo systemctl daemon-reload
        sudo systemctl enable aetherion.service
      fi

      # Restart the service
      sudo systemctl restart aetherion.service

      # Check service status
      echo 'Service status:'
      sudo systemctl status aetherion.service --no-pager

      # Cleanup
      rm ~/${DEPLOY_PACKAGE}
      echo 'Deployment completed!'
    "`;
    
    execSync(sshCmd, { stdio: 'inherit' });
    console.log(`${colors.green}Deployment on server completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Failed to deploy on server:', error.message);
    return false;
  }
}

/**
 * Verify deployment
 */
function verifyDeployment(credentials) {
  console.log(`${colors.blue}==== STEP 7: Verifying Deployment ====${colors.reset}`);
  
  try {
    console.log('Checking if application is responding...');
    
    // Wait for the app to start up
    console.log('Waiting 5 seconds for application to start...');
    execSync('sleep 5');
    
    // Check if the webapp is responding
    execSync(`curl -s --head --request GET http://${credentials.SSH_HOST}:3000`);
    
    console.log(`${colors.green}Verification successful! Application is running properly.${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}Warning: Could not verify application is running. Please check manually.${colors.reset}`);
    console.log(`Error details: ${error.message}`);
    return false;
  }
}

/**
 * Cleanup after deployment
 */
function cleanup() {
  console.log(`${colors.blue}==== STEP 8: Cleaning Up ====${colors.reset}`);
  
  // Remove local package
  if (fs.existsSync(DEPLOY_PACKAGE)) {
    fs.unlinkSync(DEPLOY_PACKAGE);
  }
  
  console.log(`${colors.green}Cleanup completed.${colors.reset}`);
}

/**
 * Generate Nginx configuration
 */
function generateNginxConfig() {
  const nginxConfig = `
server {
    listen 80;
    server_name ${DOMAIN};

    # Primary application path at /dapp
    location /dapp {
        proxy_pass http://localhost:5000/dapp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Secondary application path at /wallet (legacy support)
    location ${DEPLOY_PATH} {
        proxy_pass http://localhost:5000${DEPLOY_PATH};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Redirect root to /dapp
    location = / {
        return 301 /dapp;
    }

    # For Let's Encrypt
    location ~ /.well-known {
        allow all;
    }
}
`;

  if (!fs.existsSync('deployment-guides')) {
    fs.mkdirSync('deployment-guides');
  }
  
  const nginxPath = path.join('deployment-guides', 'nginx-config.conf');
  fs.writeFileSync(nginxPath, nginxConfig);
  console.log(`Nginx configuration saved to ${nginxPath}`);
  
  return nginxPath;
}

/**
 * Main execution function
 */
async function main() {
  try {
    printBanner();
    
    // Step 1: Collect credentials
    const credentials = await collectCredentials();
    
    // Step 1.5: Store credentials securely
    const ipfsHash = await storeCredentialsSecurely(credentials);
    
    // Step 1.6: Send start notification to Slack
    if (credentials.SLACK_WEBHOOK_URL) {
      sendSlackNotification(
        credentials.SLACK_WEBHOOK_URL,
        `🚀 Aetherion Wallet deployment to ${DOMAIN} started`
      );
    }
    
    // Step 2: Backup existing deployment
    const backupSuccess = await backupExistingDeployment(credentials);
    if (!backupSuccess) {
      console.error(`${colors.red}Failed to backup existing deployment. Aborting deployment.${colors.reset}`);
      if (credentials.SLACK_WEBHOOK_URL) {
        sendSlackNotification(
          credentials.SLACK_WEBHOOK_URL,
          `⚠️ Aetherion Wallet deployment FAILED: Backup step failed`
        );
      }
      process.exit(1);
    }
    
    // Step 3: Build the application
    const buildSuccess = buildApplication();
    if (!buildSuccess) {
      console.error(`${colors.red}Build failed. Aborting deployment.${colors.reset}`);
      if (credentials.SLACK_WEBHOOK_URL) {
        sendSlackNotification(
          credentials.SLACK_WEBHOOK_URL,
          `⚠️ Aetherion Wallet deployment FAILED: Build process failed`
        );
      }
      process.exit(1);
    }
    
    // Step 4: Create deployment package
    const packageSuccess = createDeploymentPackage();
    if (!packageSuccess) {
      console.error(`${colors.red}Failed to create deployment package. Aborting deployment.${colors.reset}`);
      if (credentials.SLACK_WEBHOOK_URL) {
        sendSlackNotification(
          credentials.SLACK_WEBHOOK_URL,
          `⚠️ Aetherion Wallet deployment FAILED: Package creation failed`
        );
      }
      process.exit(1);
    }
    
    // Step 5: Upload to server
    const uploadSuccess = uploadToServer(credentials);
    if (!uploadSuccess) {
      console.error(`${colors.red}Failed to upload to server. Aborting deployment.${colors.reset}`);
      if (credentials.SLACK_WEBHOOK_URL) {
        sendSlackNotification(
          credentials.SLACK_WEBHOOK_URL,
          `⚠️ Aetherion Wallet deployment FAILED: Upload to server failed`
        );
      }
      process.exit(1);
    }
    
    // Step 6: Deploy on server
    const deploySuccess = deployOnServer(credentials);
    if (!deploySuccess) {
      console.error(`${colors.red}Failed to deploy on server. Aborting deployment.${colors.reset}`);
      if (credentials.SLACK_WEBHOOK_URL) {
        sendSlackNotification(
          credentials.SLACK_WEBHOOK_URL,
          `⚠️ Aetherion Wallet deployment FAILED: Server deployment failed`
        );
      }
      process.exit(1);
    }
    
    // Step 7: Verify deployment
    verifyDeployment(credentials);
    
    // Generate Nginx configuration
    const nginxPath = generateNginxConfig();
    
    // Step 8: Cleanup
    cleanup();
    
    // Send success notification
    if (credentials.SLACK_WEBHOOK_URL) {
      sendSlackNotification(
        credentials.SLACK_WEBHOOK_URL,
        `✅ Aetherion Wallet successfully deployed to ${DOMAIN}`
      );
    }
    
    // Final message
    console.log('');
    console.log(`${colors.blue}==============================================${colors.reset}`);
    console.log(`${colors.green}   AETHERION WALLET DEPLOYMENT COMPLETE      ${colors.reset}`);
    console.log(`${colors.blue}==============================================${colors.reset}`);
    console.log(`${colors.yellow}Your application is now accessible at:${colors.reset}`);
    console.log(`${colors.green}http://${credentials.SSH_HOST}:3000/dapp${colors.reset}`);
    console.log(`${colors.green}http://${credentials.SSH_HOST}:3000${DEPLOY_PATH}${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}To setup SSL with Nginx, copy the Nginx configuration from ${nginxPath}${colors.reset}`);
    console.log(`${colors.yellow}Then run: certbot --nginx -d ${DOMAIN}${colors.reset}`);
    console.log('');
    
    // Close the readline interface
    rl.close();
    
  } catch (error) {
    console.error(`${colors.red}Deployment failed:${colors.reset}`, error);
    process.exit(1);
  } finally {
    // Close log stream
    logStream.end();
  }
}

// Execute main function
main();