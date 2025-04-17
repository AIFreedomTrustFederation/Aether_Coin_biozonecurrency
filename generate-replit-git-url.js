/**
 * GitHub-Replit URL Generator for AetherWallet-1
 * 
 * This script helps generate the correct REPLIT_GIT_URL value for GitHub Actions
 * and GitHub Codespaces to synchronize with your Replit project.
 * 
 * Usage:
 * 1. Run with Node.js: node generate-replit-git-url.js YOUR_GITHUB_PAT
 * 2. Copy the generated URL and use it as the REPLIT_GIT_URL secret value
 */

// Get GitHub Personal Access Token from command line argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('\x1b[31mError: GitHub Personal Access Token (PAT) required\x1b[0m');
  console.log('\nUsage: node generate-replit-git-url.js YOUR_GITHUB_PAT\n');
  console.log('To generate a PAT:');
  console.log('1. Go to GitHub Settings > Developer settings > Personal access tokens');
  console.log('2. Click "Generate new token (classic)"');
  console.log('3. Select scopes: repo, workflow');
  console.log('4. Generate and copy the token');
  process.exit(1);
}

const githubPAT = args[0];

// Repository information - update if needed
const githubUsername = 'aifreedomtrust';
const repoName = 'AetherWallet-1';

// Generate the Git URL
const gitUrl = `https://${githubPAT}@github.com/${githubUsername}/${repoName}.git`;

// Display instructions
console.log('\n\x1b[32m=======================================\x1b[0m');
console.log('\x1b[32mReplit-GitHub Sync Configuration\x1b[0m');
console.log('\x1b[32m=======================================\x1b[0m\n');

console.log('Use these values in your GitHub repository secrets:\n');

console.log('\x1b[33mSecret name:\x1b[0m REPLIT_REPO_URL');
console.log(`\x1b[33mValue:\x1b[0m https://replit.com/@${githubUsername}/${repoName}\n`);

console.log('\x1b[33mSecret name:\x1b[0m REPLIT_GIT_URL');
console.log(`\x1b[33mValue:\x1b[0m ${gitUrl}\n`);

console.log('\x1b[36mWhere to add these secrets:\x1b[0m');
console.log('1. GitHub repository > Settings > Secrets and variables > Codespaces');
console.log('2. GitHub repository > Settings > Secrets and variables > Actions\n');

console.log('\x1b[36mAfter adding the secrets:\x1b[0m');
console.log('1. Go to the "Actions" tab in your GitHub repository');
console.log('2. Find the "Auto-Sync from Replit for AetherWallet-1" workflow');
console.log('3. Click "Run workflow" to test the synchronization\n');