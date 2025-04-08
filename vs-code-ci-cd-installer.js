/**
 * VS Code CI/CD Installer for Aetherion Wallet
 * 
 * This script integrates the GitHub Actions workflow generator with VS Code
 * by creating the necessary directories and files for the extension.
 * 
 * To use:
 * 1. Run this script from the VS Code terminal
 * 2. It will create the .vscode directory with the necessary files
 * 3. It will prepare the GitHub Actions workflow generator
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
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
  VS Code CI/CD Installer for Aetherion Wallet
==========================================================
${COLORS.reset}
${COLORS.magenta}This script sets up VS Code integration for generating 
GitHub Actions workflows and deploying the Aetherion Wallet.${COLORS.reset}
`);
}

// Create directory if it doesn't exist
function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`${COLORS.green}Created directory: ${dir}${COLORS.reset}`);
  }
}

// Create VS Code tasks.json for GitHub Actions workflow generation
function createTasksJson() {
  const tasksDir = './.vscode';
  createDirIfNotExists(tasksDir);
  
  const tasksContent = {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "Generate GitHub Actions Workflow",
        "type": "shell",
        "command": "node github-actions-generator.js",
        "problemMatcher": [],
        "presentation": {
          "reveal": "always",
          "panel": "new",
          "focus": true
        },
        "group": {
          "kind": "build",
          "isDefault": true
        }
      },
      {
        "label": "Deploy to aifreedomtrust.com",
        "type": "shell",
        "command": "node deploy-to-aifreedomtrust.js",
        "problemMatcher": [],
        "presentation": {
          "reveal": "always",
          "panel": "new",
          "focus": true
        }
      },
      {
        "label": "Setup CI/CD Environment",
        "type": "shell",
        "command": "mkdir -p .github/workflows && cat github-deploy-ci-cd.yml > .github/workflows/deploy.yml",
        "problemMatcher": [],
        "presentation": {
          "reveal": "always",
          "panel": "new",
          "focus": true
        }
      }
    ]
  };
  
  fs.writeFileSync(path.join(tasksDir, 'tasks.json'), JSON.stringify(tasksContent, null, 2));
  console.log(`${COLORS.green}Created VS Code tasks.json${COLORS.reset}`);
}

// Create VS Code launch.json for debugging
function createLaunchJson() {
  const launchDir = './.vscode';
  createDirIfNotExists(launchDir);
  
  const launchContent = {
    "version": "0.2.0",
    "configurations": [
      {
        "type": "node",
        "request": "launch",
        "name": "Generate GitHub Actions Workflow",
        "program": "${workspaceFolder}/github-actions-generator.js",
        "skipFiles": [
          "<node_internals>/**"
        ],
        "console": "integratedTerminal"
      },
      {
        "type": "node",
        "request": "launch",
        "name": "Deploy to aifreedomtrust.com",
        "program": "${workspaceFolder}/deploy-to-aifreedomtrust.js",
        "skipFiles": [
          "<node_internals>/**"
        ],
        "console": "integratedTerminal",
        "env": {
          "NODE_ENV": "production"
        }
      }
    ]
  };
  
  fs.writeFileSync(path.join(launchDir, 'launch.json'), JSON.stringify(launchContent, null, 2));
  console.log(`${COLORS.green}Created VS Code launch.json${COLORS.reset}`);
}

// Create VS Code settings.json with relevant settings
function createSettingsJson() {
  const settingsDir = './.vscode';
  createDirIfNotExists(settingsDir);
  
  const settingsContent = {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "yaml.schemas": {
      "https://json.schemastore.org/github-workflow.json": [
        "github-deploy-ci-cd.yml",
        ".github/workflows/deploy.yml"
      ]
    },
    "files.associations": {
      "github-deploy-ci-cd.yml": "yaml",
      ".github/workflows/deploy.yml": "yaml"
    },
    "terminal.integrated.defaultProfile.windows": "Command Prompt",
    "terminal.integrated.defaultProfile.linux": "bash",
    "terminal.integrated.defaultProfile.osx": "bash"
  };
  
  fs.writeFileSync(path.join(settingsDir, 'settings.json'), JSON.stringify(settingsContent, null, 2));
  console.log(`${COLORS.green}Created VS Code settings.json${COLORS.reset}`);
}

// Create VS Code extensions.json to recommend relevant extensions
function createExtensionsJson() {
  const extensionsDir = './.vscode';
  createDirIfNotExists(extensionsDir);
  
  const extensionsContent = {
    "recommendations": [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode",
      "redhat.vscode-yaml",
      "github.vscode-github-actions",
      "ms-azuretools.vscode-docker",
      "ms-vscode.js-debug"
    ]
  };
  
  fs.writeFileSync(path.join(extensionsDir, 'extensions.json'), JSON.stringify(extensionsContent, null, 2));
  console.log(`${COLORS.green}Created VS Code extensions.json${COLORS.reset}`);
}

// Create a new shell script to run the VS Code automation
function createVsCodeDeployScript() {
  const scriptContent = `#!/bin/bash
# VS Code deploy script for Aetherion Wallet
# This script automates the deployment process from VS Code

echo "=== Aetherion Wallet Deployment from VS Code ==="
echo "Preparing deployment..."

# Generate GitHub Actions workflow if needed
if [ ! -f ".github/workflows/deploy.yml" ]; then
  echo "Generating GitHub Actions workflow..."
  node github-actions-generator.js
fi

# Run deployment
echo "Starting deployment to aifreedomtrust.com..."
node deploy-to-aifreedomtrust.js

echo "Deployment process complete!"
`;

  fs.writeFileSync('deploy-vscode.sh', scriptContent);
  try {
    execSync('chmod +x deploy-vscode.sh');
  } catch (err) {
    console.log(`${COLORS.yellow}Warning: Could not make script executable. You may need to run 'chmod +x deploy-vscode.sh' manually.${COLORS.reset}`);
  }
  console.log(`${COLORS.green}Created VS Code deployment script: deploy-vscode.sh${COLORS.reset}`);
}

// Update VS-CODE-DEPLOYMENT-GUIDE.md with instructions
function createDeploymentGuide() {
  const guideContent = `# VS Code Deployment Guide for Aetherion Wallet

This guide will help you deploy the Aetherion Wallet directly from VS Code using our enhanced CI/CD capabilities.

## Prerequisites

1. VS Code installed on your machine
2. Node.js 18 or higher
3. Git installed and configured
4. Network access to GitHub and aifreedomtrust.com

## Recommended VS Code Extensions

Install the following extensions to enhance your deployment experience:

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- YAML (redhat.vscode-yaml)
- GitHub Actions (github.vscode-github-actions)
- Docker (ms-azuretools.vscode-docker)
- JavaScript Debugger (ms-vscode.js-debug)

## Setup Instructions

1. Open the project in VS Code
2. Use the integrated terminal to run:
   \`\`\`
   node vs-code-ci-cd-installer.js
   \`\`\`
3. This will create the necessary VS Code configuration files

## Deployment Options

### Option 1: Using VS Code Tasks

1. Press \`Ctrl+Shift+P\` (or \`Cmd+Shift+P\` on macOS)
2. Type "Tasks: Run Task"
3. Select "Generate GitHub Actions Workflow" to create the workflow file
4. Select "Deploy to aifreedomtrust.com" to deploy directly

### Option 2: Using the Deployment Script

1. Open the integrated terminal
2. Run \`./deploy-vscode.sh\`

### Option 3: Using the Run and Debug Panel

1. Open the Run and Debug panel (Ctrl+Shift+D or Cmd+Shift+D)
2. Select "Deploy to aifreedomtrust.com" from the dropdown
3. Press the play button to start the deployment

## Configuring Deployment Options

You can configure deployment options by:

1. Editing the \`.vscode/tasks.json\` file for command-line options
2. Editing the \`.vscode/launch.json\` file for debugging options

## CI/CD Integration

This setup automatically creates the GitHub Actions workflow file in \`.github/workflows/deploy.yml\`. 
After generating the file, commit and push it to your repository to enable CI/CD.

## Troubleshooting

If you encounter issues during deployment:

1. Check VS Code's terminal output for errors
2. Verify your SSH credentials are set up correctly
3. Check the logs on the target server
4. Run the deployment script with the \`--debug\` flag: 
   \`node deploy-to-aifreedomtrust.js --debug\`

For additional help, refer to the main DEPLOYMENT.md and CI-CD-GUIDE.txt documentation.
`;

  fs.writeFileSync('VS-CODE-DEPLOYMENT-GUIDE.md', guideContent);
  console.log(`${COLORS.green}Created VS Code deployment guide: VS-CODE-DEPLOYMENT-GUIDE.md${COLORS.reset}`);
}

// Main function
function main() {
  try {
    printBanner();
    
    // Create VS Code configurations
    createTasksJson();
    createLaunchJson();
    createSettingsJson();
    createExtensionsJson();
    
    // Create deployment script
    createVsCodeDeployScript();
    
    // Create deployment guide
    createDeploymentGuide();
    
    // Ensure GitHub workflow directory exists
    createDirIfNotExists('./.github/workflows');
    
    // Update execution permissions for deployment scripts
    try {
      execSync('chmod +x github-actions-generator.js');
      execSync('chmod +x deploy-to-aifreedomtrust.js');
    } catch (err) {
      console.log(`${COLORS.yellow}Warning: Could not set execute permissions on scripts. You may need to do this manually.${COLORS.reset}`);
    }
    
    console.log(`
${COLORS.green}${COLORS.bright}==========================================================
  VS Code CI/CD Setup Complete
==========================================================
${COLORS.reset}

${COLORS.cyan}Your VS Code environment is now set up for GitHub Actions workflow 
generation and deployment to aifreedomtrust.com.

To use these features:
1. Press Ctrl+Shift+P (or Cmd+Shift+P on macOS)
2. Type "Tasks: Run Task"
3. Select "Generate GitHub Actions Workflow" or "Deploy to aifreedomtrust.com"

For more details, refer to the ${COLORS.bright}VS-CODE-DEPLOYMENT-GUIDE.md${COLORS.reset}${COLORS.cyan} file.
${COLORS.reset}
`);
  } catch (err) {
    console.error(`${COLORS.red}Error: ${err.message}${COLORS.reset}`);
  }
}

// Run the main function
main();