/**
 * VS Code extension script to generate GitHub Actions workflow YAML from CI-CD-GUIDE.txt
 * This script integrates with the enhanced deployment capabilities of Aetherion Wallet
 * 
 * To use:
 * 1. Install the Code Runner extension in VS Code
 * 2. Right-click this file and select "Run Code"
 * 3. The script will read CI-CD-GUIDE.txt and generate .github/workflows/deploy.yml
 */

import fs from 'fs';
import path from 'path';
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

function printBanner() {
  console.log(`${colors.cyan}${colors.bright}
  ┌─────────────────────────────────────────────────┐
  │       GitHub Actions Workflow Generator         │
  │                                                 │
  │       For Aetherion Wallet Deployment           │
  └─────────────────────────────────────────────────┘
  ${colors.reset}`);
}

function createBasicYamlTemplate() {
  return `# GitHub Actions workflow for Aetherion Wallet and Brand Showcase deployment
# Generated on: ${new Date().toISOString()}

name: Deploy to atc.aifreedomtrust.com

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'production'
        type: choice
        options:
          - production
          - staging

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          
      - name: Deploy to cPanel
        uses: SamKirkland/FTP-Deploy-Action@4.3.3
        with:
          server: \${{ secrets.CPANEL_SERVER }}
          username: \${{ secrets.CPANEL_USERNAME }}
          password: \${{ secrets.CPANEL_PASSWORD }}
          local-dir: ./dist/
          server-dir: \${{ secrets.CPANEL_PATH }}
          
      - name: Send deployment notification
        if: success()
        run: |
          curl -X POST -H 'Content-type: application/json' --data '{"text":"Aetherion Ecosystem deployed successfully to atc.aifreedomtrust.com"}' \${{ secrets.SLACK_WEBHOOK_URL }}
`;
}

function checkDeploymentScriptIntegration() {
  // Check if our deployment scripts are available
  const deployScriptPath = path.join(__dirname, 'deploy-to-aifreedomtrust.js');
  if (fs.existsSync(deployScriptPath)) {
    console.log(`${colors.green}✓ Deployment script found: deploy-to-aifreedomtrust.js${colors.reset}`);
    return true;
  } else {
    console.warn(`${colors.yellow}! Deployment script not found. Using basic template.${colors.reset}`);
    return false;
  }
}

function extractRequiredSecrets() {
  const secrets = [
    {
      name: 'CPANEL_SERVER',
      description: 'cPanel server hostname (e.g., aifreedomtrust.com)'
    },
    {
      name: 'CPANEL_USERNAME',
      description: 'cPanel username'
    },
    {
      name: 'CPANEL_PASSWORD',
      description: 'cPanel password'
    },
    {
      name: 'CPANEL_PATH',
      description: 'Path to deploy to on cPanel (e.g., /public_html/atc/)'
    },
    {
      name: 'SLACK_WEBHOOK_URL',
      description: 'Slack webhook URL for notifications'
    }
  ];
  
  console.log(`${colors.blue}The following secrets are required for deployment:${colors.reset}`);
  for (const secret of secrets) {
    console.log(`  - ${colors.yellow}${secret.name}${colors.reset}: ${secret.description}`);
  }
  
  return secrets;
}

function generateWorkflowYaml() {
  // Check if the deployment script is available for enhanced functionality
  const hasDeploymentScript = checkDeploymentScriptIntegration();
  
  // Create the basic template
  let yamlContent = createBasicYamlTemplate();
  
  // If we have the deployment script, enhance the workflow
  if (hasDeploymentScript) {
    // Add a step to run our custom deployment script
    yamlContent = yamlContent.replace(
      `      - name: Deploy to cPanel
        uses: SamKirkland/FTP-Deploy-Action@4.3.3
        with:
          server: \${{ secrets.CPANEL_SERVER }}
          username: \${{ secrets.CPANEL_USERNAME }}
          password: \${{ secrets.CPANEL_PASSWORD }}
          local-dir: ./dist/
          server-dir: \${{ secrets.CPANEL_PATH }}`,
      `      - name: Deploy to cPanel with enhanced script
        run: |
          node deploy-to-aifreedomtrust.js
        env:
          CPANEL_SERVER: \${{ secrets.CPANEL_SERVER }}
          CPANEL_USERNAME: \${{ secrets.CPANEL_USERNAME }}
          CPANEL_PASSWORD: \${{ secrets.CPANEL_PASSWORD }}
          CPANEL_PATH: \${{ secrets.CPANEL_PATH }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}`
    );
  }
  
  return yamlContent;
}

function createOutputDirectory() {
  const workflowsDir = path.join(__dirname, '.github', 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
    console.log(`${colors.green}✓ Created workflows directory: ${workflowsDir}${colors.reset}`);
  }
  return workflowsDir;
}

function displaySetupInstructions() {
  console.log(`
${colors.cyan}${colors.bright}GitHub Actions Workflow Generated Successfully!${colors.reset}

${colors.bright}Next Steps:${colors.reset}

1. ${colors.yellow}Push the generated workflow file to your GitHub repository${colors.reset}
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment workflow"
   git push origin main

2. ${colors.yellow}Add the required secrets to your GitHub repository:${colors.reset}
   - Go to your repository on GitHub
   - Click on Settings > Secrets and variables > Actions
   - Add each of the required secrets listed above

3. ${colors.yellow}Monitor the workflow:${colors.reset}
   - After pushing to the main branch, go to the Actions tab in your repository
   - You should see the workflow running
   - Once complete, your application will be deployed to atc.aifreedomtrust.com

${colors.green}For more information, refer to deploy-to-aifreedomtrust.js and the GitHub Actions documentation.${colors.reset}
`);
}

function main() {
  try {
    // Print banner
    printBanner();
    
    // Extract required secrets for documentation
    const secrets = extractRequiredSecrets();
    
    // Generate the workflow YAML
    const yamlContent = generateWorkflowYaml();
    
    // Create the output directory
    const workflowsDir = createOutputDirectory();
    
    // Write the workflow file
    const workflowPath = path.join(workflowsDir, 'deploy.yml');
    fs.writeFileSync(workflowPath, yamlContent);
    console.log(`${colors.green}✓ Generated GitHub Actions workflow: ${workflowPath}${colors.reset}`);
    
    // Display setup instructions
    displaySetupInstructions();
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Define VS Code extension functions to make this usable as a VS Code extension
const vscode = {
    activate(context) {
        console.log('Activating GitHub Actions Generator');
        main();
    },
    
    deactivate() {
        console.log('Deactivating GitHub Actions Generator');
    }
};

// Run as a standalone script
main();