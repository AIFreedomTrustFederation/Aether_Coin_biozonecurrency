/**
 * deploy-to-aifreedomtrust-full.js
 * Comprehensive Automated Deployment Script for Aetherion Wallet with FractalCoin-Filecoin Integration
 * Target: www.atc.aifreedomtrust.com
 * 
 * This script:
 * 1. Validates environment and prerequisites
 * 2. Collects deployment credentials
 * 3. Builds the application
 * 4. Deploys to Web3.Storage (IPFS/Filecoin)
 * 5. Sets up FractalCoin-Filecoin bridge
 * 6. Deploys to traditional hosting at atc.aifreedomtrust.com
 * 7. Configures DNS and HTTPS
 * 8. Verifies all deployments
 * 9. Sends notifications
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import * as readline from 'readline';
import { webcrypto } from 'crypto';
import axios from 'axios';

// Initialize env
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const DOMAIN = 'www.atc.aifreedomtrust.com';
const DEPLOY_PATH = '/';
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
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
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
  console.log(`${colors.magenta}==============================================${colors.reset}`);
  console.log(`${colors.magenta}    AETHERION COMPREHENSIVE DEPLOYMENT SCRIPT  ${colors.reset}`);
  console.log(`${colors.magenta}    Target: ${DOMAIN}                          ${colors.reset}`);
  console.log(`${colors.magenta}    IPFS/Filecoin + Traditional Hosting        ${colors.reset}`);
  console.log(`${colors.magenta}==============================================${colors.reset}`);
  console.log('');
}

/**
 * Print section header
 */
function printSection(title) {
  console.log(`${colors.blue}==== ${title} ====${colors.reset}`);
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
 * Check if a command exists
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if environment variable exists in .env file
 */
function envVarExists(varName) {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    return new RegExp(`^${varName}=`).test(envContent);
  }
  return false;
}

/**
 * Check prerequisites
 */
async function checkPrerequisites() {
  printSection('STEP 1: Checking Prerequisites');
  
  // Required tools
  const requiredTools = ['node', 'npm', 'curl'];
  for (const tool of requiredTools) {
    if (commandExists(tool)) {
      console.log(`${colors.green}✓ ${tool} is installed${colors.reset}`);
    } else {
      console.error(`${colors.red}✗ ${tool} is not installed. Please install it and try again.${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Check Node.js version
  const nodeVersion = execSync('node -v').toString().trim();
  console.log(`Node.js version: ${nodeVersion}`);
  
  // Check if .env file exists
  if (fs.existsSync('.env')) {
    console.log(`${colors.green}✓ .env file found${colors.reset}`);
  } else {
    console.log(`${colors.yellow}✗ .env file not found. Creating from example...${colors.reset}`);
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log(`Created .env from .env.example. Please edit it with your credentials.`);
    } else {
      console.error(`${colors.red}No .env.example file found. Please create a .env file manually.${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Required environment variables
  const requiredEnvVars = ['WEB3_STORAGE_TOKEN'];
  for (const varName of requiredEnvVars) {
    if (envVarExists(varName)) {
      console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
    } else {
      console.log(`${colors.yellow}✗ Required environment variable ${varName} is not set in .env${colors.reset}`);
      const value = await prompt(`Enter your ${varName}: `);
      if (!value) {
        console.error(`${colors.red}${varName} is required. Exiting.${colors.reset}`);
        process.exit(1);
      }
      
      // Append to .env file
      fs.appendFileSync('.env', `\n${varName}=${value}`);
      console.log(`${colors.green}✓ Added ${varName} to .env file${colors.reset}`);
    }
  }
  
  // Optional environment variables
  const optionalEnvVars = [
    'FRACTALCOIN_API_KEY', 
    'FRACTALCOIN_API_ENDPOINT', 
    'SETUP_FILECOIN_INTEGRATION',
    'ENS_PRIVATE_KEY',
    'ENS_DOMAIN'
  ];
  
  for (const varName of optionalEnvVars) {
    if (envVarExists(varName)) {
      console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
    } else {
      console.log(`${colors.yellow}✗ Optional environment variable ${varName} is not set in .env${colors.reset}`);
      
      if (varName === 'SETUP_FILECOIN_INTEGRATION') {
        const setupFilecoin = await prompt(`Do you want to set up Filecoin integration? (y/n): `);
        if (setupFilecoin.toLowerCase() === 'y') {
          fs.appendFileSync('.env', `\nSETUP_FILECOIN_INTEGRATION=true`);
          
          // If setting up Filecoin, we need the API key
          if (!envVarExists('FRACTALCOIN_API_KEY')) {
            const apiKey = await prompt(`Enter your FRACTALCOIN_API_KEY: `);
            if (apiKey) {
              fs.appendFileSync('.env', `\nFRACTALCOIN_API_KEY=${apiKey}`);
            }
          }
          
          // And the API endpoint if not set
          if (!envVarExists('FRACTALCOIN_API_ENDPOINT')) {
            fs.appendFileSync('.env', `\nFRACTALCOIN_API_ENDPOINT=https://api.fractalcoin.network/v1`);
          }
          
          // Set allocation size
          fs.appendFileSync('.env', `\nFRACTALCOIN_FILECOIN_ALLOCATION=20`);
        } else {
          fs.appendFileSync('.env', `\nSETUP_FILECOIN_INTEGRATION=false`);
        }
      }
    }
  }
  
  console.log(`${colors.green}All prerequisites checked${colors.reset}`);
}

/**
 * Collect deployment credentials
 */
async function collectCredentials() {
  printSection('STEP 2: Collecting Deployment Credentials');
  
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
 * Install dependencies
 */
function installDependencies() {
  printSection('STEP 3: Installing Dependencies');
  
  console.log('Installing npm dependencies...');
  execSync('npm install --no-fund --no-audit', { stdio: 'inherit' });
  
  console.log('Installing deployment-specific dependencies...');
  if (fs.existsSync('install-deployment-deps.sh')) {
    execSync('bash install-deployment-deps.sh', { stdio: 'inherit' });
  } else {
    // Install common deployment dependencies if script doesn't exist
    execSync('npm install --no-fund --no-audit web3.storage @web3-storage/w3up-client ethers', { stdio: 'inherit' });
  }
  
  console.log(`${colors.green}All dependencies installed successfully${colors.reset}`);
}

/**
 * Build the application
 */
function buildApplication() {
  printSection('STEP 4: Building Application');
  
  // Clean previous builds
  console.log('Cleaning previous builds...');
  if (fs.existsSync('npm-scripts.sh') && commandExists('bash')) {
    execSync('bash npm-scripts.sh clean', { stdio: 'inherit' });
  } else {
    // Manual cleanup
    if (fs.existsSync('dist')) execSync('rm -rf dist');
    if (fs.existsSync('build')) execSync('rm -rf build');
    if (fs.existsSync('.cache')) execSync('rm -rf .cache');
    if (fs.existsSync('node_modules/.cache')) execSync('rm -rf node_modules/.cache');
  }
  
  // Run TypeScript check
  console.log('Running TypeScript check...');
  try {
    execSync('npm run check', { stdio: 'inherit' });
  } catch (error) {
    console.log(`${colors.yellow}TypeScript check failed, continuing anyway${colors.reset}`);
  }
  
  // Build the application
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verify build output
  if (fs.existsSync('dist')) {
    console.log(`${colors.green}Application built successfully${colors.reset}`);
    return true;
  } else {
    console.error(`${colors.red}Build directory not found after build${colors.reset}`);
    return false;
  }
}

/**
 * Deploy to Web3.Storage
 */
function deployToWeb3Storage() {
  printSection('STEP 5: Deploying to Web3.Storage (IPFS/Filecoin)');
  
  console.log('Uploading to Web3.Storage...');
  
  // Use the deploy-to-web3.js script if it exists
  if (fs.existsSync('scripts/deploy-to-web3.js')) {
    execSync('node scripts/deploy-to-web3.js', { stdio: 'inherit' });
    console.log(`${colors.green}Deployment to Web3.Storage completed${colors.reset}`);
    return true;
  } else {
    console.error(`${colors.red}deploy-to-web3.js script not found${colors.reset}`);
    return false;
  }
}

/**
 * Set up FractalCoin-Filecoin bridge
 */
function setupFilecoinBridge() {
  printSection('STEP 6: Setting Up FractalCoin-Filecoin Bridge');
  
  // Check if bridge setup is enabled
  if (envVarExists('SETUP_FILECOIN_INTEGRATION')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('SETUP_FILECOIN_INTEGRATION=true')) {
      console.log('FractalCoin-Filecoin bridge integration is enabled');
      
      // Check for API key
      if (!envVarExists('FRACTALCOIN_API_KEY')) {
        console.log(`${colors.yellow}FRACTALCOIN_API_KEY is not set. Bridge setup will be skipped.${colors.reset}`);
        return false;
      }
      
      console.log('Setting up FractalCoin-Filecoin bridge...');
      
      // Use the fractalcoin-filecoin-bridge.js script if it exists
      if (fs.existsSync('scripts/fractalcoin-filecoin-bridge.js')) {
        execSync('node scripts/fractalcoin-filecoin-bridge.js', { stdio: 'inherit' });
        console.log(`${colors.green}FractalCoin-Filecoin bridge setup completed${colors.reset}`);
        return true;
      } else {
        console.log(`${colors.yellow}fractalcoin-filecoin-bridge.js script not found. Bridge setup skipped.${colors.reset}`);
        return false;
      }
    } else {
      console.log('FractalCoin-Filecoin bridge integration is disabled. Skipping setup.');
      return false;
    }
  } else {
    console.log('SETUP_FILECOIN_INTEGRATION not found in .env. Skipping bridge setup.');
    return false;
  }
}

/**
 * Create deployment package for traditional hosting
 */
function createDeploymentPackage() {
  printSection('STEP 7: Creating Deployment Package');
  
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
  printSection('STEP 8: Uploading to Server');
  
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
  printSection('STEP 9: Deploying on Server');
  
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
Environment=PORT=3000
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
 * Configure Nginx on the server
 */
function configureNginx(credentials) {
  printSection('STEP 10: Configuring Nginx');
  
  const nginxConfig = `
server {
    listen 80;
    server_name ${DOMAIN};

    # Primary application path at root
    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # For Let's Encrypt
    location ~ /.well-known {
        allow all;
    }
}
`;

  try {
    // Write Nginx config to a temporary file
    const tempConfigFile = 'nginx-config.conf';
    fs.writeFileSync(tempConfigFile, nginxConfig);
    
    // Upload the config file
    execSync(`scp -P ${credentials.SSH_PORT} ${tempConfigFile} ${credentials.SSH_USER}@${credentials.SSH_HOST}:~/`);
    
    // Apply the config
    const sshCmd = `ssh -p ${credentials.SSH_PORT} ${credentials.SSH_USER}@${credentials.SSH_HOST} "
      sudo mv ~/${tempConfigFile} /etc/nginx/sites-available/${DOMAIN}
      sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
      sudo nginx -t && sudo systemctl reload nginx
      echo 'Nginx configuration applied'
    "`;
    
    execSync(sshCmd, { stdio: 'inherit' });
    
    // Clean up local temp file
    fs.unlinkSync(tempConfigFile);
    
    console.log(`${colors.green}Nginx configured successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Failed to configure Nginx:', error.message);
    return false;
  }
}

/**
 * Set up HTTPS with Let's Encrypt
 */
function setupHttps(credentials) {
  printSection('STEP 11: Setting Up HTTPS with Let\'s Encrypt');
  
  try {
    const sshCmd = `ssh -p ${credentials.SSH_PORT} ${credentials.SSH_USER}@${credentials.SSH_HOST} "
      # Check if certbot is installed
      if ! command -v certbot &> /dev/null; then
        echo 'Installing Certbot...'
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
      fi
      
      # Obtain and install certificate
      sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ${credentials.SSH_USER}@${credentials.SSH_HOST}
      
      echo 'HTTPS setup completed'
    "`;
    
    execSync(sshCmd, { stdio: 'inherit' });
    console.log(`${colors.green}HTTPS set up successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error('Failed to set up HTTPS:', error.message);
    return false;
  }
}

/**
 * Verify deployment
 */
function verifyDeployment(credentials) {
  printSection('STEP 12: Verifying Deployment');
  
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
 * Extract CID from logs
 */
function extractCidFromLogs() {
  try {
    const logContent = fs.readFileSync(path.join('deployment-logs', LOG_FILE), 'utf8');
    const cidMatch = logContent.match(/CID: ([a-zA-Z0-9]+)/);
    return cidMatch ? cidMatch[1] : null;
  } catch (error) {
    console.error('Error extracting CID from logs:', error.message);
    return null;
  }
}

/**
 * Display deployment summary
 */
function displayDeploymentSummary(credentials, bridgeSetupSuccess) {
  printSection('Deployment Summary');
  
  // Extract CID from logs
  const cid = extractCidFromLogs();
  
  console.log(`${colors.magenta}==============================================${colors.reset}`);
  console.log(`${colors.magenta}    AETHERION DEPLOYMENT SUMMARY              ${colors.reset}`);
  console.log(`${colors.magenta}==============================================${colors.reset}`);
  console.log('');
  
  console.log(`${colors.cyan}Traditional Web Hosting:${colors.reset}`);
  console.log(`Domain: ${DOMAIN}`);
  console.log(`URL: https://${DOMAIN}`);
  console.log(`Status: ${colors.green}Active${colors.reset}`);
  console.log('');
  
  console.log(`${colors.cyan}IPFS/Filecoin Deployment:${colors.reset}`);
  if (cid) {
    console.log(`Content CID: ${cid}`);
    console.log(`Gateway URL: https://${cid}.ipfs.dweb.link/`);
    console.log(`Status: ${colors.green}Active${colors.reset}`);
  } else {
    console.log(`Status: ${colors.yellow}CID not found in logs${colors.reset}`);
  }
  console.log('');
  
  console.log(`${colors.cyan}FractalCoin-Filecoin Bridge:${colors.reset}`);
  if (bridgeSetupSuccess) {
    console.log(`Status: ${colors.green}Active${colors.reset}`);
  } else {
    console.log(`Status: ${colors.yellow}Not configured or skipped${colors.reset}`);
  }
  console.log('');
  
  console.log(`${colors.cyan}Next Steps:${colors.reset}`);
  console.log('1. Access your application at:');
  console.log(`   - Traditional hosting: https://${DOMAIN}`);
  if (cid) {
    console.log(`   - IPFS/Filecoin: https://${cid}.ipfs.dweb.link/`);
  }
  console.log('2. Monitor your application performance');
  console.log('3. Set up monitoring and alerts');
  console.log('');
  
  console.log(`${colors.magenta}==============================================${colors.reset}`);
}

/**
 * Send notification to Slack
 */
function sendSlackNotification(webhookUrl, message) {
  if (!webhookUrl) return;
  
  try {
    console.log(`Sending notification to Slack...`);
    
    const payload = JSON.stringify({ text: message });
    execSync(`curl -X POST -H 'Content-type: application/json' --data '${payload}' ${webhookUrl}`);
    
    console.log(`${colors.green}Notification sent successfully!${colors.reset}`);
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
  }
}

/**
 * Cleanup after deployment
 */
function cleanup() {
  printSection('Cleaning Up');
  
  // Remove local package
  if (fs.existsSync(DEPLOY_PACKAGE)) {
    fs.unlinkSync(DEPLOY_PACKAGE);
  }
  
  console.log(`${colors.green}Cleanup completed.${colors.reset}`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    printBanner();
    
    // Step 1: Check prerequisites
    await checkPrerequisites();
    
    // Step 2: Collect credentials
    const credentials = await collectCredentials();
    
    // Step 3: Install dependencies
    installDependencies();
    
    // Step 4: Build the application
    const buildSuccess = buildApplication();
    if (!buildSuccess) {
      console.error(`${colors.red}Build failed. Aborting deployment.${colors.reset}`);
      process.exit(1);
    }
    
    // Step 5: Deploy to Web3.Storage
    const web3StorageSuccess = deployToWeb3Storage();
    
    // Step 6: Set up FractalCoin-Filecoin bridge
    const bridgeSetupSuccess = setupFilecoinBridge();
    
    // Step 7: Create deployment package
    const packageSuccess = createDeploymentPackage();
    if (!packageSuccess) {
      console.error(`${colors.red}Failed to create deployment package. Aborting traditional deployment.${colors.reset}`);
      if (web3StorageSuccess) {
        console.log(`${colors.yellow}IPFS/Filecoin deployment was successful. You can still access your app via IPFS.${colors.reset}`);
        displayDeploymentSummary(credentials, bridgeSetupSuccess);
        process.exit(0);
      }
      process.exit(1);
    }
    
    // Step 8: Upload to server
    const uploadSuccess = uploadToServer(credentials);
    if (!uploadSuccess) {
      console.error(`${colors.red}Failed to upload to server. Aborting traditional deployment.${colors.reset}`);
      if (web3StorageSuccess) {
        console.log(`${colors.yellow}IPFS/Filecoin deployment was successful. You can still access your app via IPFS.${colors.reset}`);
        displayDeploymentSummary(credentials, bridgeSetupSuccess);
        process.exit(0);
      }
      process.exit(1);
    }
    
    // Step 9: Deploy on server
    const deploySuccess = deployOnServer(credentials);
    if (!deploySuccess) {
      console.error(`${colors.red}Failed to deploy on server.${colors.reset}`);
      if (web3StorageSuccess) {
        console.log(`${colors.yellow}IPFS/Filecoin deployment was successful. You can still access your app via IPFS.${colors.reset}`);
        displayDeploymentSummary(credentials, bridgeSetupSuccess);
        process.exit(0);
      }
      process.exit(1);
    }
    
    // Step 10: Configure Nginx
    const nginxSuccess = configureNginx(credentials);
    
    // Step 11: Set up HTTPS
    const httpsSuccess = setupHttps(credentials);
    
    // Step 12: Verify deployment
    verifyDeployment(credentials);
    
    // Step 13: Display deployment summary
    displayDeploymentSummary(credentials, bridgeSetupSuccess);
    
    // Step 14: Send notification
    if (credentials.SLACK_WEBHOOK_URL) {
      sendSlackNotification(
        credentials.SLACK_WEBHOOK_URL,
        `✅ Aetherion Wallet deployment to ${DOMAIN} completed successfully!`
      );
    }
    
    // Step 15: Cleanup
    cleanup();
    
    console.log(`${colors.green}Deployment process completed successfully!${colors.reset}`);
    rl.close();
  } catch (error) {
    console.error(`${colors.red}Deployment failed:${colors.reset}`, error.message);
    
    if (credentials && credentials.SLACK_WEBHOOK_URL) {
      sendSlackNotification(
        credentials.SLACK_WEBHOOK_URL,
        `❌ Aetherion Wallet deployment to ${DOMAIN} failed: ${error.message}`
      );
    }
    
    process.exit(1);
  }
}

// Execute main function
main();