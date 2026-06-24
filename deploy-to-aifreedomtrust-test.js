/**
 * Local deployment test script for Aetherion
 * This script helps test the deployment process locally before pushing to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = path.join(__dirname, 'dist');
const SERVER_FILE = path.join(__dirname, 'server-redirect.js');
const PACKAGE_JSON = path.join(__dirname, 'package.json');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function executeCommand(command, options = {}) {
  try {
    log(`Executing: ${command}`, colors.cyan);
    const output = execSync(command, {
      stdio: 'inherit',
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    log(`Command failed: ${command}`, colors.red);
    log(error.message, colors.red);
    return { success: false, error };
  }
}

// Main deployment test function
async function testDeployment() {
  log('Starting deployment test...', colors.magenta);
  
  // Step 1: Clean previous build
  log('\n1. Cleaning previous build...', colors.blue);
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
  
  // Step 2: Install dependencies
  log('\n2. Installing dependencies...', colors.blue);
  const npmInstall = executeCommand('npm ci');
  if (!npmInstall.success) {
    log('Failed to install dependencies. Aborting.', colors.red);
    return;
  }
  
  // Step 3: Build the application
  log('\n3. Building application...', colors.blue);
  const buildResult = executeCommand('npm run build');
  if (!buildResult.success) {
    log('Build failed. Aborting.', colors.red);
    return;
  }
  
  // Step 4: Copy server-redirect.js to dist
  log('\n4. Preparing server files...', colors.blue);
  fs.copyFileSync(SERVER_FILE, path.join(BUILD_DIR, 'server-redirect.js'));
  fs.writeFileSync(path.join(BUILD_DIR, '.env'), 'NODE_ENV=production\nPORT=3000');
  
  // Step 5: Test server-redirect.js
  log('\n5. Testing server-redirect.js...', colors.blue);
  try {
    // Import the server-redirect.js file to check for syntax errors
    require(path.join(BUILD_DIR, 'server-redirect.js'));
    log('server-redirect.js syntax check passed.', colors.green);
  } catch (error) {
    log('server-redirect.js has errors:', colors.red);
    log(error.message, colors.red);
    return;
  }
  
  // Step 6: Create deployment package
  log('\n6. Creating deployment package...', colors.blue);
  const tarCommand = executeCommand('tar -czf deploy-package-test.tar.gz dist package.json');
  if (!tarCommand.success) {
    log('Failed to create deployment package. Aborting.', colors.red);
    return;
  }
  
  // Step 7: Verify package contents
  log('\n7. Verifying package contents...', colors.blue);
  executeCommand('tar -tvf deploy-package-test.tar.gz');
  
  // Step 8: Cleanup
  log('\n8. Cleaning up...', colors.blue);
  fs.unlinkSync('deploy-package-test.tar.gz');
  
  // Done
  log('\nDeployment test completed successfully!', colors.green);
  log('Your application is ready to be deployed via GitHub Actions.', colors.green);
  log('\nNext steps:', colors.yellow);
  log('1. Commit and push your changes to GitHub', colors.yellow);
  log('2. Go to GitHub Actions and run the "Deploy Aetherion to Traditional Server" workflow', colors.yellow);
  log('3. Monitor the workflow for any errors', colors.yellow);
}

// Run the deployment test
testDeployment().catch(error => {
  log('Deployment test failed with an unexpected error:', colors.red);
  log(error.message, colors.red);
});