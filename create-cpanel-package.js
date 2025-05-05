/**
 * create-cpanel-package.js
 * This script creates a deployment package for cPanel from your Replit environment
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Configuration
const config = {
  outputDir: path.join(__dirname, 'deployment-package'),
  packageName: `aetherion-ecosystem-${new Date().toISOString().replace(/[:.]/g, '-')}.tar.gz`,
  
  // Files and directories to include
  include: [
    'combined-server.js',
    'config.js',
    'api-modules.js',
    'error-handler.js',
    'package.json',
    'package-lock.json',
    '.env.example',
    'client',
    'public',
    'server',
    'shared',
    'deploy-to-cpanel.sh',
    'README.md'
  ],
  
  // Files and directories to exclude
  exclude: [
    'node_modules',
    '.git',
    'deployment-package',
    '.replit',
    'replit.nix'
  ]
};

/**
 * Print banner
 */
function printBanner() {
  console.log(`${colors.cyan}${colors.bright}
  ┌─────────────────────────────────────────────────┐
  │      Aetherion Ecosystem Package Creator        │
  │                                                 │
  │         For cPanel Deployment                   │
  └─────────────────────────────────────────────────┘
  ${colors.reset}`);
}

/**
 * Create the output directory
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
 * Execute shell command
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
 * Create the tar.gz package
 */
async function createPackage() {
  const packagePath = path.join(config.outputDir, config.packageName);
  
  // Create exclude arguments for tar
  const excludeArgs = config.exclude.map(item => `--exclude='${item}'`).join(' ');
  
  // Create include arguments for tar
  const includeArgs = config.include.map(item => `"${item}"`).join(' ');
  
  // Create the tar command
  const tarCommand = `tar -czf "${packagePath}" ${excludeArgs} ${includeArgs}`;
  
  console.log(`${colors.blue}Creating package...${colors.reset}`);
  console.log(`${colors.yellow}Command: ${tarCommand}${colors.reset}`);
  
  try {
    await execPromise(tarCommand);
    console.log(`${colors.green}✓ Created package: ${packagePath}${colors.reset}`);
    return packagePath;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to create package: ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Create an example .env file
 */
function createExampleEnv() {
  const envPath = path.join(__dirname, '.env.example');
  
  const envContent = `# Aetherion Ecosystem Environment Variables
# Copy this file to .env and adjust values as needed

# Server configuration
NODE_ENV=production
PORT=3000
PUBLIC_URL=https://atc.aifreedomtrust.com

# API Keys (add your actual keys in production)
# OPENAI_API_KEY=sk_...
# STRIPE_SECRET_KEY=sk_...

# Database configuration (if using a database)
# DATABASE_URL=postgres://username:password@hostname:port/database
`;

  fs.writeFileSync(envPath, envContent);
  console.log(`${colors.green}✓ Created example .env file${colors.reset}`);
}

/**
 * Create a README file
 */
function createReadme() {
  const readmePath = path.join(__dirname, 'README.md');
  
  // Skip if README already exists
  if (fs.existsSync(readmePath)) {
    console.log(`${colors.yellow}! README.md already exists, skipping creation${colors.reset}`);
    return;
  }
  
  const readmeContent = `# Aetherion Ecosystem

This is the Aetherion Ecosystem application, designed to be deployed on atc.aifreedomtrust.com.

## Deployment

To deploy this application to cPanel:

1. Upload the deployment package to your cPanel server
2. Extract the package to your desired directory
3. Run the deployment script:

\`\`\`bash
chmod +x deploy-to-cpanel.sh
./deploy-to-cpanel.sh
\`\`\`

For more detailed instructions, see:
- GITHUB-ACTIONS-DEPLOYMENT-GUIDE.md
- CPANEL-DEPLOYMENT-GUIDE.md
- AIFREEDOMTRUST-DOMAIN-DEPLOYMENT.md

## Components

The Aetherion Ecosystem consists of:

- Brand Showcase application (/brands)
- Aetherion Wallet application (/wallet)
- Third application (/app3)
- WebSocket server for real-time communication

## Configuration

Configure the application by creating a \`.env\` file based on the provided \`.env.example\`.

## License

All rights reserved. AI Freedom Trust.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`${colors.green}✓ Created README.md${colors.reset}`);
}

/**
 * Display success message
 */
function displaySuccess(packagePath) {
  console.log(`
${colors.green}${colors.bright}Package created successfully!${colors.reset}

${colors.bright}File:${colors.reset} ${packagePath}

${colors.bright}Next steps:${colors.reset}

1. ${colors.yellow}Download the package from your Replit environment${colors.reset}
   - From the file explorer, right-click on the package and select "Download"

2. ${colors.yellow}Upload to your cPanel server${colors.reset}
   - Log in to cPanel at https://crispr.fah-dc3-ds.com/
   - Navigate to File Manager
   - Upload the package to your home directory

3. ${colors.yellow}Deploy using the included script${colors.reset}
   - Open the Terminal in cPanel
   - Extract the package: tar -xzf ${config.packageName}
   - Run: chmod +x deploy-to-cpanel.sh
   - Run: ./deploy-to-cpanel.sh

Your application will be deployed to https://atc.aifreedomtrust.com
`);
}

/**
 * Main function
 */
async function main() {
  try {
    // Print banner
    printBanner();
    
    // Create output directory
    createOutputDir();
    
    // Create example .env file
    createExampleEnv();
    
    // Create README
    createReadme();
    
    // Create package
    const packagePath = await createPackage();
    
    // Display success message
    displaySuccess(packagePath);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run main function
main();