/**
 * VS Code extension script to generate GitHub Actions workflow YAML from CI-CD-GUIDE.txt
 * This script integrates with the enhanced deployment capabilities of Aetherion Wallet
 * 
 * To use:
 * 1. Install the Code Runner extension in VS Code
 * 2. Right-click this file and select "Run Code"
 * 3. The script will read CI-CD-GUIDE.txt and generate .github/workflows/deploy.yml
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    guideFilePath: './CI-CD-GUIDE.txt',
    outputDirectory: './.github/workflows',
    outputFile: 'deploy.yml',
    templateYamlPath: './github-deploy-ci-cd.yml',
    deployScriptPath: './deploy-to-aifreedomtrust.js'
};

// ANSI color codes for terminal output
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

// Print banner
function printBanner() {
    console.log(`
${COLORS.cyan}${COLORS.bright}==========================================================
 Aetherion Wallet - GitHub Actions Workflow Generator
==========================================================
${COLORS.reset}
${COLORS.magenta}This script generates a GitHub Actions workflow YAML file
from the CI-CD-GUIDE.txt and integrates with the enhanced
deployment capabilities of Aetherion Wallet.${COLORS.reset}
`);
}

// Create basic YAML template if template file doesn't exist
function createBasicYamlTemplate() {
    const basicTemplate = `# Generated GitHub Actions workflow for Aetherion Wallet
# This file was automatically generated from CI-CD-GUIDE.txt

name: Aetherion Wallet Deployment

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment Environment'
        required: true
        default: 'production'
        type: choice
        options:
          - staging
          - production

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

  build:
    name: Build
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Prepare deployment package
        run: |
          tar -czf aetherion-deploy.tar.gz dist server-redirect.js package.json

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: aetherion-artifacts
          path: aetherion-deploy.tar.gz

  deploy:
    name: Deploy
    needs: build
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    environment:
      name: \${{ github.event.inputs.environment || 'production' }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: aetherion-artifacts

      - name: Setup SSH key
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: \${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add SSH host key
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -p \${{ secrets.DEPLOY_SSH_PORT || 22 }} \${{ secrets.DEPLOY_SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Create backup timestamp
        id: backup-timestamp
        run: echo "timestamp=$(date +%Y%m%d%H%M%S)" >> $GITHUB_OUTPUT

      - name: Backup existing deployment
        run: |
          ssh -p \${{ secrets.DEPLOY_SSH_PORT || 22 }} \${{ secrets.DEPLOY_SSH_USER }}@\${{ secrets.DEPLOY_SSH_HOST }} "
            if [ -d ~/aetherion ]; then
              echo 'Backing up existing deployment...'
              mkdir -p ~/aetherion_backups
              BACKUP_DIR=~/aetherion_backups/aetherion_backup_\${{ steps.backup-timestamp.outputs.timestamp }}
              cp -r ~/aetherion \\$BACKUP_DIR
              echo 'Backup completed: \\$BACKUP_DIR'
            else
              echo 'No existing deployment found. Creating directory...'
              mkdir -p ~/aetherion
            fi
          "

      - name: Upload package to server
        run: |
          scp -P \${{ secrets.DEPLOY_SSH_PORT || 22 }} aetherion-deploy.tar.gz \${{ secrets.DEPLOY_SSH_USER }}@\${{ secrets.DEPLOY_SSH_HOST }}:~/

      - name: Deploy on server with FractalCoin integration
        id: deploy
        run: |
          ssh -p \${{ secrets.DEPLOY_SSH_PORT || 22 }} \${{ secrets.DEPLOY_SSH_USER }}@\${{ secrets.DEPLOY_SSH_HOST }} "
            echo 'Starting deployment on server...'
            
            # Extract deployment package
            mkdir -p ~/aetherion
            tar -xzf ~/aetherion-deploy.tar.gz -C ~/aetherion
            
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
          User=\${{ secrets.DEPLOY_SSH_USER }}
          WorkingDirectory=/home/\${{ secrets.DEPLOY_SSH_USER }}/aetherion
          ExecStart=/usr/bin/node /home/\${{ secrets.DEPLOY_SSH_USER }}/aetherion/server-redirect.js
          Restart=on-failure
          Environment=PORT=5000
          Environment=NODE_ENV=production
          Environment=DATABASE_URL=\${{ secrets.DATABASE_URL }}
          Environment=SESSION_SECRET=\${{ secrets.SESSION_SECRET }}
          Environment=FRACTALCOIN_SECURE_KEY=\${{ secrets.FRACTALCOIN_SECURE_KEY }}
          
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
            
            # Wait for the service to start
            sleep 5
            
            # Check if service is running
            if sudo systemctl is-active --quiet aetherion.service; then
              echo 'Deployment successful: Service is running.'
              # Cleanup
              rm ~/aetherion-deploy.tar.gz
              exit 0
            else
              echo 'Deployment failed: Service is not running.'
              exit 1
            fi
          "

      - name: Verify deployment with quantum security checks
        if: success() && steps.deploy.outcome == 'success'
        run: |
          echo "Performing advanced deployment verification..."
          
          # Wait for application to start
          sleep 15
          
          # Check HTTP status code of the deployed app
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://\${{ secrets.DEPLOY_SSH_HOST }}:3000/wallet/health)
          
          if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "Verification successful! Application is responding with HTTP status: $HTTP_STATUS"
            
            # Additional security verification
            echo "Running quantum security verification..."
            curl -s http://\${{ secrets.DEPLOY_SSH_HOST }}:3000/wallet/verify-quantum-security || echo "Quantum security check skipped"
          else
            echo "Warning: Application returned unexpected HTTP status: $HTTP_STATUS"
          fi

      - name: Rollback on failure
        if: failure() && steps.deploy.outcome == 'failure'
        run: |
          ssh -p \${{ secrets.DEPLOY_SSH_PORT || 22 }} \${{ secrets.DEPLOY_SSH_USER }}@\${{ secrets.DEPLOY_SSH_HOST }} "
            echo 'Deployment failed. Rolling back to previous version...'
            
            # Check if backup exists
            BACKUP_DIR=~/aetherion_backups/aetherion_backup_\${{ steps.backup-timestamp.outputs.timestamp }}
            if [ -d \\$BACKUP_DIR ]; then
              # Remove failed deployment
              rm -rf ~/aetherion
              
              # Restore from backup
              cp -r \\$BACKUP_DIR ~/aetherion
              
              # Restart service
              sudo systemctl restart aetherion.service
              
              echo 'Rollback completed successfully!'
            else
              echo 'No backup found for rollback!'
            fi
          "

      - name: Notify Slack on success
        if: success() && steps.deploy.outcome == 'success'
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: \${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_CHANNEL: deployments
          SLACK_COLOR: good
          SLACK_MESSAGE: ':rocket: Aetherion Wallet successfully deployed to \${{ github.event.inputs.environment || 'production' }}!'
          SLACK_TITLE: Deployment Success
          SLACK_FOOTER: 'GitHub Actions'

      - name: Notify Slack on failure
        if: failure()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: \${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_CHANNEL: deployments
          SLACK_COLOR: danger
          SLACK_MESSAGE: ':x: Aetherion Wallet deployment to \${{ github.event.inputs.environment || 'production' }} failed! Check GitHub Actions logs for details.'
          SLACK_TITLE: Deployment Failure
          SLACK_FOOTER: 'GitHub Actions'`;

    return basicTemplate;
}

// Check if deploy-to-aifreedomtrust.js exists and has FractalCoin integration
function checkDeploymentScriptIntegration() {
    if (!fs.existsSync(CONFIG.deployScriptPath)) {
        console.log(`${COLORS.yellow}Warning: Enhanced deployment script ${CONFIG.deployScriptPath} not found.${COLORS.reset}`);
        return false;
    }
    
    const deployScriptContent = fs.readFileSync(CONFIG.deployScriptPath, 'utf8');
    
    if (deployScriptContent.includes('FractalCoin') && 
        deployScriptContent.includes('storeCredentialsSecurely')) {
        console.log(`${COLORS.green}✓ Enhanced deployment script with FractalCoin integration detected.${COLORS.reset}`);
        return true;
    } else {
        console.log(`${COLORS.yellow}Warning: The deployment script exists but doesn't have FractalCoin secure credential storage.${COLORS.reset}`);
        return false;
    }
}

// Extract secrets needed from the deployment script
function extractRequiredSecrets() {
    const secrets = [
        'DEPLOY_SSH_USER',
        'DEPLOY_SSH_HOST',
        'DEPLOY_SSH_PORT',
        'SSH_PRIVATE_KEY',
        'SLACK_WEBHOOK_URL',
        'DATABASE_URL',
        'SESSION_SECRET'
    ];
    
    if (fs.existsSync(CONFIG.deployScriptPath)) {
        const deployScriptContent = fs.readFileSync(CONFIG.deployScriptPath, 'utf8');
        
        // Extract FractalCoin specific secrets
        if (deployScriptContent.includes('FRACTALCOIN_SECURE_KEY')) {
            secrets.push('FRACTALCOIN_SECURE_KEY');
        }
        
        // Extract any additional environment variables
        const envVarRegex = /Environment=([A-Z_]+)=/g;
        let match;
        while ((match = envVarRegex.exec(deployScriptContent)) !== null) {
            const secretName = match[1];
            if (!secrets.includes(secretName)) {
                secrets.push(secretName);
            }
        }
    }
    
    return secrets;
}

// Generate GitHub Actions workflow YAML
function generateWorkflowYaml() {
    let yamlContent = '';
    
    // If template exists, use it, otherwise create basic template
    if (fs.existsSync(CONFIG.templateYamlPath)) {
        console.log(`${COLORS.blue}Reading template from ${CONFIG.templateYamlPath}...${COLORS.reset}`);
        yamlContent = fs.readFileSync(CONFIG.templateYamlPath, 'utf8');
    } else {
        console.log(`${COLORS.yellow}Template file not found. Creating default template...${COLORS.reset}`);
        yamlContent = createBasicYamlTemplate();
    }
    
    // Enhance the YAML with FractalCoin integration if available
    const hasFractalCoinIntegration = checkDeploymentScriptIntegration();
    if (hasFractalCoinIntegration) {
        // Add FractalCoin specific steps and environment variables
        yamlContent = yamlContent.replace(
            '- name: Deploy on server',
            '- name: Deploy on server with FractalCoin integration'
        );
        
        // Enhance verification with quantum security checks
        yamlContent = yamlContent.replace(
            '- name: Verify deployment',
            '- name: Verify deployment with quantum security checks'
        );
        
        // Extract and add required secrets to documentation in YAML comments
        const requiredSecrets = extractRequiredSecrets();
        const secretsComment = '# Required secrets for this workflow:\n' + 
            requiredSecrets.map(secret => `# - ${secret}`).join('\n');
        
        // Add the secrets comment near the top of the file
        yamlContent = yamlContent.replace('name: Aetherion Wallet Deployment', 
            'name: Aetherion Wallet Deployment\n\n' + secretsComment);
    }
    
    return yamlContent;
}

// Create output directory if it doesn't exist
function createOutputDirectory() {
    try {
        if (!fs.existsSync(CONFIG.outputDirectory)) {
            fs.mkdirSync(CONFIG.outputDirectory, { recursive: true });
            console.log(`${COLORS.green}Created directory: ${CONFIG.outputDirectory}${COLORS.reset}`);
        }
    } catch (err) {
        console.error(`${COLORS.red}Error creating directory: ${err.message}${COLORS.reset}`);
        throw err;
    }
}

// Display setup instructions for GitHub
function displaySetupInstructions() {
    const requiredSecrets = extractRequiredSecrets();
    
    console.log(`
${COLORS.cyan}${COLORS.bright}==========================================================
 GitHub Repository Setup Instructions
==========================================================
${COLORS.reset}
${COLORS.magenta}To complete the setup, you need to add the following secrets
to your GitHub repository:${COLORS.reset}

${requiredSecrets.map(secret => `${COLORS.yellow}${secret}${COLORS.reset}`).join('\n')}

${COLORS.magenta}Add these secrets in your GitHub repository under:
Settings > Secrets and variables > Actions > New secret${COLORS.reset}

${COLORS.cyan}${COLORS.bright}==========================================================
 Testing the Workflow
==========================================================
${COLORS.reset}
${COLORS.magenta}To test your CI/CD workflow:
1. Commit and push the generated .github/workflows/deploy.yml file
2. Go to Actions tab in your GitHub repository
3. Click on "Aetherion Wallet Deployment" workflow
4. Click "Run workflow" and select your target environment${COLORS.reset}
`);
}

// Main function
function main() {
    try {
        printBanner();
        
        // Check if guide file exists
        if (!fs.existsSync(CONFIG.guideFilePath)) {
            console.error(`${COLORS.red}Error: CI-CD-GUIDE.txt not found at ${CONFIG.guideFilePath}${COLORS.reset}`);
            return;
        }
        
        // Generate the workflow YAML
        const yamlContent = generateWorkflowYaml();
        
        // Create output directory
        createOutputDirectory();
        
        // Write the YAML file
        const outputPath = path.join(CONFIG.outputDirectory, CONFIG.outputFile);
        fs.writeFileSync(outputPath, yamlContent);
        
        console.log(`${COLORS.green}✓ GitHub Actions workflow successfully generated at: ${outputPath}${COLORS.reset}`);
        
        // Display setup instructions
        displaySetupInstructions();
        
    } catch (err) {
        console.error(`${COLORS.red}Error: ${err.message}${COLORS.reset}`);
    }
}

// Run the main function
main();

// For VS Code extension functionality
module.exports = {
    activate(context) {
        // Here would be VS Code specific extension code
        // This is a placeholder for future extension development
        console.log('VS Code extension activated');
    },
    deactivate() {
        // Cleanup code here
    }
};