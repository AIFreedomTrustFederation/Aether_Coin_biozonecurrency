#!/usr/bin/env node

/**
 * GitHub-Replit Sync Setup Utility for AetherWallet-1
 * 
 * This interactive script helps you configure GitHub repository secrets
 * for synchronizing your Replit project with GitHub.
 * 
 * Features:
 * - Generates proper Git URLs for GitHub Actions
 * - Creates step-by-step instructions
 * - Validates configuration
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Repository configuration 
const config = {
  replitUsername: 'aifreedomtrust',
  replitProjectName: 'AetherWallet-1',
  githubUsername: 'aifreedomtrust',
  githubToken: null,
  githubRepoName: 'AetherWallet-1',
  workflowName: 'Auto-Sync from Replit for AetherWallet-1'
};

/**
 * Print a styled banner
 */
function printBanner() {
  console.log('\n' + colors.cyan + colors.bright + '╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║  AetherWallet GitHub-Replit Synchronization Setup      ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('\nThis utility will help you set up automatic synchronization');
  console.log('between your Replit project and GitHub repository.\n');
}

/**
 * Print a section header
 */
function printSection(title) {
  console.log('\n' + colors.magenta + colors.bright + '■ ' + title + colors.reset);
  console.log(colors.gray + '─'.repeat(60) + colors.reset + '\n');
}

/**
 * Get GitHub token from user
 */
function promptForGitHubToken() {
  printSection('GitHub Personal Access Token (PAT)');
  
  console.log('You need a GitHub Personal Access Token with the following permissions:');
  console.log('  • ' + colors.yellow + 'repo' + colors.reset + ' - Full control of private repositories');
  console.log('  • ' + colors.yellow + 'workflow' + colors.reset + ' - Update GitHub Action workflows\n');

  console.log('To create a token:');
  console.log('1. Go to ' + colors.cyan + 'https://github.com/settings/tokens' + colors.reset);
  console.log('2. Click "Generate new token (classic)"');
  console.log('3. Name it "Replit-GitHub Sync"');
  console.log('4. Select the scopes mentioned above');
  console.log('5. Click "Generate token" and copy it\n');

  return new Promise((resolve) => {
    rl.question(colors.green + 'Enter your GitHub token: ' + colors.reset, (token) => {
      if (!token || token.trim() === '') {
        console.log(colors.red + 'Error: GitHub token is required' + colors.reset);
        return promptForGitHubToken().then(resolve);
      }
      resolve(token.trim());
    });
  });
}

/**
 * Validate GitHub repository name
 */
function promptForGitHubRepo() {
  printSection('GitHub Repository Configuration');

  console.log('Please confirm your GitHub repository details:\n');
  console.log('Default repository: ' + colors.yellow + config.githubUsername + '/' + config.githubRepoName + colors.reset);
  
  return new Promise((resolve) => {
    rl.question(colors.green + 'GitHub repository name [' + config.githubRepoName + ']: ' + colors.reset, (repoName) => {
      resolve(repoName.trim() || config.githubRepoName);
    });
  });
}

/**
 * Generate the secrets and display instructions
 */
function generateSecrets() {
  printSection('Generated GitHub Secrets');

  const replitRepoUrl = `https://replit.com/@${config.replitUsername}/${config.replitProjectName}`;
  const gitUrl = `https://${config.githubToken}@github.com/${config.githubUsername}/${config.githubRepoName}.git`;

  console.log('Add these secrets to your GitHub repository:\n');

  console.log('1. ' + colors.yellow + 'REPLIT_REPO_URL' + colors.reset);
  console.log('   Value: ' + colors.cyan + replitRepoUrl + colors.reset + '\n');

  console.log('2. ' + colors.yellow + 'REPLIT_GIT_URL' + colors.reset);
  console.log('   Value: ' + colors.cyan + gitUrl.replace(config.githubToken, '<TOKEN>') + colors.reset);
  console.log('   (Replace <TOKEN> with your actual GitHub token)\n');

  // Save the instructions to a file
  const instructions = `# GitHub Sync Configuration
  
## Created: ${new Date().toISOString()}

Add these secrets to your GitHub repository:

1. Secret Name: REPLIT_REPO_URL
   Value: ${replitRepoUrl}

2. Secret Name: REPLIT_GIT_URL
   Value: https://YOUR_GITHUB_TOKEN@github.com/${config.githubUsername}/${config.githubRepoName}.git
   (Replace YOUR_GITHUB_TOKEN with your actual GitHub Personal Access Token)

## Where to add these secrets:

1. For GitHub Codespaces:
   GitHub repository > Settings > Secrets and variables > Codespaces

2. For GitHub Actions:
   GitHub repository > Settings > Secrets and variables > Actions

## After adding the secrets:

1. Go to the "Actions" tab in your GitHub repository
2. Find the "${config.workflowName}" workflow
3. Click "Run workflow" to test the synchronization

## Important Note:

Keep your GitHub token secure and never share it publicly!
`;

  fs.writeFileSync(path.join(__dirname, 'github-sync-config.md'), instructions);
  console.log('These instructions have been saved to: ' + colors.green + 'github-sync-config.md' + colors.reset + '\n');
}

/**
 * Display final instructions
 */
function displayFinalInstructions() {
  printSection('Next Steps');

  console.log('1. Add the secrets to your GitHub repository:');
  console.log('   • Go to ' + colors.cyan + `https://github.com/${config.githubUsername}/${config.githubRepoName}/settings/secrets/actions` + colors.reset);
  console.log('   • Click "New repository secret"');
  console.log('   • Add both REPLIT_REPO_URL and REPLIT_GIT_URL secrets\n');

  console.log('2. Repeat the process for GitHub Codespaces:');
  console.log('   • Go to ' + colors.cyan + `https://github.com/${config.githubUsername}/${config.githubRepoName}/settings/secrets/codespaces` + colors.reset);
  console.log('   • Add the same secrets\n');

  console.log('3. Test the synchronization:');
  console.log('   • Go to ' + colors.cyan + `https://github.com/${config.githubUsername}/${config.githubRepoName}/actions` + colors.reset);
  console.log('   • Select the workflow: ' + colors.yellow + config.workflowName + colors.reset);
  console.log('   • Click "Run workflow"\n');

  console.log(colors.green + 'Setup complete! Your Replit project will now synchronize with GitHub.' + colors.reset);
}

/**
 * Main function
 */
async function main() {
  printBanner();
  
  try {
    // Get GitHub token
    config.githubToken = await promptForGitHubToken();
    
    // Get GitHub repository name
    config.githubRepoName = await promptForGitHubRepo();
    
    // Generate and display secrets
    generateSecrets();
    
    // Display final instructions
    displayFinalInstructions();
  } catch (error) {
    console.error(colors.red + 'Error: ' + error.message + colors.reset);
  } finally {
    rl.close();
  }
}

// Run the main function
main();