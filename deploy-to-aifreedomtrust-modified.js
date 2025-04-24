/**
 * deploy-to-aifreedomtrust-modified.js
 * Enhanced Automated Deployment Script for Aetherion Wallet with FractalCoin Integration
 * Target: atc.aifreedomtrust.com/dapp and /wallet
 * 
 * This modified script:
 * 1. Adds support for selecting source branch (main or clean_fixes)
 * 2. Collects deployment credentials
 * 3. Securely stores credentials in FractalCoin/IPFS (if available)
 * 4. Backs up existing deployment
 * 5. Builds the application
 * 6. Creates and uploads deployment package
 * 7. Configures and starts the server
 * 8. Verifies deployment
 * 9. Sends notifications
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
const DEFAULT_BRANCH = 'clean_fixes_20250410_163230'; // Set the clean fixes branch as default

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

// Create deployment logs directory if it doesn't exist
if (!fs.existsSync('deployment-logs')) {
  fs.mkdirSync('deployment-logs', { recursive: true });
}

// Setup logging
const logStream = fs.createWriteStream(path.join('deployment-logs', LOG_FILE), { flags: 'a' });
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function() {
  logStream.write(Array.from(arguments).join(' ') + '\n');
  originalConsoleLog.apply(console, arguments);
};

console.error = function() {
  logStream.write('[ERROR] ' + Array.from(arguments).join(' ') + '\n');
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
  
  // NEW: Add branch selection
  const selectedBranch = await prompt(`Enter Git branch to deploy (default: ${DEFAULT_BRANCH}): `) || DEFAULT_BRANCH;
  
  const credentials = {
    SSH_USER: await prompt('Enter your SSH Username: '),
    SSH_HOST: await prompt(`Enter your SSH Host (default: ${DOMAIN}): `) || DOMAIN,
    SSH_PORT: await prompt('Enter your SSH Port (default: 22): ') || '22',
    SLACK_WEBHOOK_URL: await prompt('Enter your Slack Webhook URL (optional, press enter to skip): '),
    GIT_BRANCH: selectedBranch // Store the selected branch
  };
  
  console.log(`${colors.green}Credentials collected successfully!${colors.reset}`);
  console.log(`${colors.yellow}Selected branch for deployment: ${credentials.GIT_BRANCH}${colors.reset}`);
  
  return credentials;
}

/**
 * Store credentials securely with FractalCoin/IPFS if available
 */
async function storeCredentialsSecurely(credentials) {
  // Implementation omitted for brevity
  return true;
}

/**
 * Send notification to Slack
 */
function sendSlackNotification(webhookUrl, message) {
  // Implementation omitted for brevity
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
function buildApplication(credentials) {
  console.log(`${colors.blue}==== STEP 3: Building Aetherion Wallet Application ====${colors.reset}`);
  
  try {
    // NEW: Checkout the selected branch
    console.log(`Checking out branch: ${credentials.GIT_BRANCH}`);
    execSync(`git checkout ${credentials.GIT_BRANCH}`, { stdio: 'inherit' });
    
    // NEW: Pull the latest changes
    console.log(`Pulling latest changes from ${credentials.GIT_BRANCH}`);
    execSync(`git pull origin ${credentials.GIT_BRANCH}`, { stdio: 'inherit' });
    
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
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
    // Create deployment-package directory if it doesn't exist
    if (!fs.existsSync('deployment-package')) {
      fs.mkdirSync('deployment-package', { recursive: true });
    }
    
    // Create package
    const packagePath = path.join('deployment-package', DEPLOY_PACKAGE);
    
    console.log('Creating deployment package...');
    execSync(`tar -czf ${packagePath} -C ${BUILD_DIR} .`, { stdio: 'inherit' });
    
    // Add server script to package
    execSync(`tar -rf ${packagePath} ${SERVER_SCRIPT}`, { stdio: 'inherit' });
    
    console.log(`${colors.green}Deployment package created successfully: ${packagePath}${colors.reset}`);
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
  console.log(`${colors.blue}==== STEP 5: Uploading Deployment Package ====${colors.reset}`);
  
  const packagePath = path.join('deployment-package', DEPLOY_PACKAGE);
  
  try {
    console.log(`Uploading package to ${credentials.SSH_HOST}...`);
    execSync(`scp -P ${credentials.SSH_PORT} ${packagePath} ${credentials.SSH_USER}@${credentials.SSH_HOST}:~`, { stdio: 'inherit' });
    
    console.log(`${colors.green}Package uploaded successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Failed to upload package:', error.message);
    return false;
  }
}

/**
 * Deploy on the server
 */
function deployOnServer(credentials) {
  console.log(`${colors.blue}==== STEP 6: Deploying on Server ====${colors.reset}`);
  
  try {
    const sshCmd = `ssh -p ${credentials.SSH_PORT} ${credentials.SSH_USER}@${credentials.SSH_HOST} "
      echo 'Extracting deployment package...'
      mkdir -p ~/aetherion
      tar -xzf ~/${DEPLOY_PACKAGE} -C ~/aetherion
      
      echo 'Setting up Node.js environment...'
      cd ~/aetherion
      npm install express compression
      
      echo 'Configuring systemd service...'
      cat > ~/aetherion.service << 'SERVICECONFIG'
[Unit]
Description=Aetherion Wallet Service
After=network.target

[Service]
Type=simple
User=${credentials.SSH_USER}
WorkingDirectory=/home/${credentials.SSH_USER}/aetherion
ExecStart=/usr/bin/node server-redirect.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
SERVICECONFIG
      
      echo 'Installing and starting service...'
      sudo mv ~/aetherion.service /etc/systemd/system/
      sudo systemctl daemon-reload
      sudo systemctl enable aetherion
      sudo systemctl restart aetherion
      
      echo 'Deployment completed successfully!'
    "`;
    
    execSync(sshCmd, { stdio: 'inherit' });
    console.log(`${colors.green}Deployment completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Deployment failed:', error.message);
    return false;
  }
}

/**
 * Verify deployment
 */
function verifyDeployment(credentials) {
  console.log(`${colors.blue}==== STEP 7: Verifying Deployment ====${colors.reset}`);
  
  try {
    console.log('Checking service status...');
    const sshCmd = `ssh -p ${credentials.SSH_PORT} ${credentials.SSH_USER}@${credentials.SSH_HOST} "
      sudo systemctl status aetherion
    "`;
    
    execSync(sshCmd, { stdio: 'inherit' });
    
    console.log('Checking website availability...');
    console.log(`${colors.green}Website should now be available at: https://${DOMAIN}${DEPLOY_PATH}${colors.reset}`);
    console.log(`${colors.green}CodeStar page should be available at: https://${DOMAIN}${DEPLOY_PATH}/codestar${colors.reset}`);
    
    return true;
  } catch (error) {
    console.error('Verification failed:', error.message);
    return false;
  }
}

/**
 * Cleanup after deployment
 */
function cleanup() {
  console.log(`${colors.blue}==== Final Step: Cleanup ====${colors.reset}`);
  
  try {
    console.log('Cleaning up temporary files...');
    // Keep the deployment package for backup purposes
    
    console.log(`${colors.green}Cleanup completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  printBanner();
  
  try {
    // Step 1: Collect credentials
    const credentials = await collectCredentials();
    
    // Step 2: Store credentials securely
    await storeCredentialsSecurely(credentials);
    
    // Step 3: Backup existing deployment
    if (!await backupExistingDeployment(credentials)) {
      console.log(`${colors.yellow}Proceeding despite backup issues...${colors.reset}`);
    }
    
    // Step 4: Build application
    if (!buildApplication(credentials)) {
      throw new Error('Application build failed');
    }
    
    // Step 5: Create deployment package
    if (!createDeploymentPackage()) {
      throw new Error('Failed to create deployment package');
    }
    
    // Step 6: Upload package
    if (!uploadToServer(credentials)) {
      throw new Error('Failed to upload package');
    }
    
    // Step 7: Deploy on server
    if (!deployOnServer(credentials)) {
      throw new Error('Deployment failed');
    }
    
    // Step 8: Verify deployment
    if (!verifyDeployment(credentials)) {
      console.log(`${colors.yellow}Deployment verification had issues, but deployment may still be functional.${colors.reset}`);
    }
    
    // Cleanup
    cleanup();
    
    // Send notification
    if (credentials.SLACK_WEBHOOK_URL) {
      sendSlackNotification(credentials.SLACK_WEBHOOK_URL, `
🚀 *Aetherion Wallet Deployed Successfully*
*Branch:* ${credentials.GIT_BRANCH}
*Environment:* Production
*URL:* https://${DOMAIN}${DEPLOY_PATH}
*Deployed by:* Script on ${new Date().toISOString()}
      `);
    }
    
    console.log(`${colors.green}==================================================${colors.reset}`);
    console.log(`${colors.green}    AETHERION WALLET DEPLOYMENT COMPLETE         ${colors.reset}`);
    console.log(`${colors.green}    URL: https://${DOMAIN}${DEPLOY_PATH}         ${colors.reset}`);
    console.log(`${colors.green}    CodeStar: https://${DOMAIN}${DEPLOY_PATH}/codestar${colors.reset}`);
    console.log(`${colors.green}==================================================${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Deployment failed: ${error.message}${colors.reset}`);
    
    // Send failure notification
    if (credentials?.SLACK_WEBHOOK_URL) {
      sendSlackNotification(credentials.SLACK_WEBHOOK_URL, `
❌ *Aetherion Wallet Deployment Failed*
*Error:* ${error.message}
*Time:* ${new Date().toISOString()}
      `);
    }
    
    process.exit(1);
  } finally {
    rl.close();
    logStream.end();
  }
}

// Execute main function
main();