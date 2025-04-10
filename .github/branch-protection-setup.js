/**
 * GitHub Branch Protection Setup Script
 * 
 * This script configures branch protection rules for the repository
 * including required reviews, status checks, and signed commits.
 * 
 * Usage:
 * node .github/branch-protection-setup.js
 */

const https = require('https');
require('dotenv').config();

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'aifreedomtrust';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'aetherion-wallet';
const TARGET_BRANCH = process.env.GITHUB_TARGET_BRANCH || 'main';

// Branch protection settings
const branchProtectionSettings = {
  required_status_checks: {
    strict: true,
    contexts: [
      'build',
      'test'
    ]
  },
  enforce_admins: false,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: true,
    required_approving_review_count: 1
  },
  restrictions: null,
  required_linear_history: true,
  allow_force_pushes: false,
  allow_deletions: false,
  required_conversation_resolution: true,
  require_signed_commits: true
};

// Print banner
console.log('==========================================================');
console.log('   GitHub Branch Protection Setup for Aetherion Wallet   ');
console.log('==========================================================');
console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
console.log(`Target Branch: ${TARGET_BRANCH}`);
console.log('');

// Validate GitHub token
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is not set.');
  console.error('Please set the GITHUB_TOKEN environment variable with a token that has "repo" scope.');
  process.exit(1);
}

// Create API request options
const options = {
  hostname: 'api.github.com',
  path: `/repos/${REPO_OWNER}/${REPO_NAME}/branches/${TARGET_BRANCH}/protection`,
  method: 'PUT',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'Aetherion-Branch-Protection-Setup',
    'Content-Type': 'application/json'
  }
};

// Send request to GitHub API
const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ Branch protection rules successfully set up for ${TARGET_BRANCH}`);
      
      // Parse response for detailed information
      try {
        const response = JSON.parse(data);
        console.log('\nProtection details:');
        console.log(`- Required approving reviews: ${response.required_pull_request_reviews.required_approving_review_count}`);
        console.log(`- Dismiss stale reviews: ${response.required_pull_request_reviews.dismiss_stale_reviews}`);
        console.log(`- Require code owner reviews: ${response.required_pull_request_reviews.require_code_owner_reviews}`);
        console.log(`- Required status checks: ${response.required_status_checks.contexts.join(', ')}`);
        console.log(`- Require signed commits: ${response.required_signatures ? 'Yes' : 'No'}`);
        console.log(`- Required linear history: ${response.required_linear_history.enabled ? 'Yes' : 'No'}`);
      } catch (e) {
        console.log('Protection enabled successfully.');
      }
    } else {
      console.error(`❌ Failed to set up branch protection rules. Status code: ${res.statusCode}`);
      console.error(`Error: ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`❌ Request error: ${error.message}`);
  process.exit(1);
});

// Send branch protection settings
req.write(JSON.stringify(branchProtectionSettings));
req.end();

console.log('Setting up branch protection rules...');
console.log('This may take a few moments...');

// Add CODEOWNERS file if it doesn't exist
const fs = require('fs');
const path = require('path');

const codeownersPath = path.join(__dirname, '..', '.github', 'CODEOWNERS');
const codeownersDir = path.dirname(codeownersPath);

if (!fs.existsSync(codeownersDir)) {
  fs.mkdirSync(codeownersDir, { recursive: true });
}

if (!fs.existsSync(codeownersPath)) {
  console.log('\nCreating CODEOWNERS file...');
  
  const codeownersContent = `# Aetherion Wallet CODEOWNERS file
# This file defines individuals or teams responsible for code in this repository.
# Each line is a file pattern followed by one or more owners.

# These owners will be the default owners for everything in the repo.
* @${REPO_OWNER}

# Core application files
/client/ @${REPO_OWNER}/frontend-team
/server/ @${REPO_OWNER}/backend-team
/shared/ @${REPO_OWNER}/core-team

# Database files
/migrations/ @${REPO_OWNER}/database-team
drizzle.config.ts @${REPO_OWNER}/database-team
/shared/schema.ts @${REPO_OWNER}/database-team

# Deployment files
/.github/workflows/ @${REPO_OWNER}/devops-team
/deploy-* @${REPO_OWNER}/devops-team
/db-* @${REPO_OWNER}/devops-team
`;

  fs.writeFileSync(codeownersPath, codeownersContent);
  console.log('✅ CODEOWNERS file created successfully.');
}