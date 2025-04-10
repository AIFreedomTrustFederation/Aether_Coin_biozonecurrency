/**
 * GitHub Deployment Status Checker for Aetherion Wallet
 * 
 * This script checks the status of GitHub Actions deployments for the Aetherion wallet.
 * It uses the GitHub API to fetch deployment information and displays it in a formatted way.
 * 
 * Usage:
 * node check-deploy-status.js
 * 
 * Environment variables:
 * GITHUB_TOKEN - Your GitHub personal access token
 * GITHUB_REPO - The repository in format "owner/repo"
 */

import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'aifreedomtrust/aetherion-wallet';
const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Check if token is available
if (!GITHUB_TOKEN) {
  console.error(`${colors.red}Error: GITHUB_TOKEN environment variable is required.${colors.reset}`);
  console.error('Please set it in your .env file or as an environment variable.');
  process.exit(1);
}

/**
 * Format date to a readable string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Get status emoji
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'success':
      return '✅';
    case 'failure':
      return '❌';
    case 'pending':
      return '⏳';
    case 'in_progress':
      return '🔄';
    default:
      return '❓';
  }
}

/**
 * Fetch workflow runs
 */
async function fetchWorkflowRuns() {
  console.log(`${colors.blue}Fetching deployment status for ${GITHUB_REPO}...${colors.reset}`);
  
  try {
    const response = await fetch(`${API_BASE}/actions/runs`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.workflow_runs || [];
  } catch (error) {
    console.error(`${colors.red}Error fetching workflow runs: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Fetch deployment details
 */
async function fetchDeployments() {
  try {
    const response = await fetch(`${API_BASE}/deployments`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error(`${colors.red}Error fetching deployments: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Display deployment status
 */
function displayDeploymentStatus(workflowRuns, deployments) {
  console.log(`${colors.blue}=== Aetherion Wallet Deployment Status ===${colors.reset}`);
  console.log('');
  
  // Display recent workflow runs
  console.log(`${colors.magenta}Recent Workflow Runs:${colors.reset}`);
  if (workflowRuns.length === 0) {
    console.log('No workflow runs found.');
  } else {
    workflowRuns.slice(0, 5).forEach(run => {
      const emoji = getStatusEmoji(run.conclusion || run.status);
      console.log(`${emoji} ${colors.cyan}${run.name}${colors.reset} (${run.head_branch}) - ${run.conclusion || run.status}`);
      console.log(`   Started: ${formatDate(run.created_at)}`);
      console.log(`   Updated: ${formatDate(run.updated_at)}`);
      console.log(`   Workflow: ${run.workflow_name}`);
      console.log(`   URL: ${run.html_url}`);
      console.log('');
    });
  }
  
  // Display deployments
  console.log(`${colors.magenta}Deployments:${colors.reset}`);
  if (deployments.length === 0) {
    console.log('No deployments found.');
  } else {
    deployments.forEach(deployment => {
      console.log(`${colors.cyan}Environment:${colors.reset} ${deployment.environment}`);
      console.log(`   Created: ${formatDate(deployment.created_at)}`);
      console.log(`   Updated: ${formatDate(deployment.updated_at)}`);
      console.log(`   Status: ${deployment.state}`);
      console.log(`   URL: ${deployment.url || 'N/A'}`);
      console.log('');
    });
  }
  
  // Display information about the AI Freedom Trust deployment
  console.log(`${colors.magenta}AI Freedom Trust Deployment:${colors.reset}`);
  console.log(`URL: https://atc.aifreedomtrust.com/dapp`);
  console.log('');
  
  console.log(`${colors.blue}To check deployment health, run:${colors.reset}`);
  console.log(`curl https://atc.aifreedomtrust.com/dapp/health`);
  console.log('');
}

/**
 * Main function
 */
async function main() {
  try {
    const [workflowRuns, deployments] = await Promise.all([
      fetchWorkflowRuns(),
      fetchDeployments()
    ]);
    
    displayDeploymentStatus(workflowRuns, deployments);
  } catch (error) {
    console.error(`${colors.red}An error occurred: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main();