# VS Code Deployment Guide for Aetherion Wallet

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
   ```
   node vs-code-ci-cd-installer.js
   ```
3. This will create the necessary VS Code configuration files

## Deployment Options

### Option 1: Using VS Code Tasks

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Tasks: Run Task"
3. Select "Generate GitHub Actions Workflow" to create the workflow file
4. Select "Deploy to aifreedomtrust.com" to deploy directly

### Option 2: Using the Deployment Script

1. Open the integrated terminal
2. Run `./deploy-vscode.sh`

### Option 3: Using the Run and Debug Panel

1. Open the Run and Debug panel (Ctrl+Shift+D or Cmd+Shift+D)
2. Select "Deploy to aifreedomtrust.com" from the dropdown
3. Press the play button to start the deployment

## Configuring Deployment Options

You can configure deployment options by:

1. Editing the `.vscode/tasks.json` file for command-line options
2. Editing the `.vscode/launch.json` file for debugging options

## CI/CD Integration

This setup automatically creates the GitHub Actions workflow file in `.github/workflows/deploy.yml`. 
After generating the file, commit and push it to your repository to enable CI/CD.

## Troubleshooting

If you encounter issues during deployment:

1. Check VS Code's terminal output for errors
2. Verify your SSH credentials are set up correctly
3. Check the logs on the target server
4. Run the deployment script with the `--debug` flag: 
   `node deploy-to-aifreedomtrust.js --debug`

For additional help, refer to the main DEPLOYMENT.md and CI-CD-GUIDE.txt documentation.
