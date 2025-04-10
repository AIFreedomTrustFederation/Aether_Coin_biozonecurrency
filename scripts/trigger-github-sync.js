/**
 * Script to manually trigger the GitHub workflow for syncing Replit changes
 * 
 * Usage: node scripts/trigger-github-sync.js
 * 
 * Prerequisites:
 * - Store your GitHub personal access token with "workflow" permissions in .env as GITHUB_TOKEN
 * - Set your GitHub username and repository name below
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Configuration - EDIT THESE VALUES
const GITHUB_USERNAME = 'AIFreedomTrustFederation'; // Updated with your GitHub username
const REPO_NAME = 'Aether_Coin_biozonecurrency'; // Updated with your repository name
const WORKFLOW_ID = 'auto-sync.yml'; // The filename of the workflow

// Get token from environment
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error('Error: GitHub token not found. Please add GITHUB_TOKEN to your .env file.');
  process.exit(1);
}

async function triggerWorkflow() {
  try {
    console.log('Triggering GitHub workflow...');
    
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main'
        }),
      }
    );

    if (response.status === 204) {
      console.log('Success! GitHub workflow triggered.');
      console.log('Check your GitHub repository Actions tab to see the workflow run.');
    } else {
      console.error(`Error: Received status code ${response.status}`);
      const text = await response.text();
      console.error('Response:', text);
    }
  } catch (error) {
    console.error('Error triggering workflow:', error.message);
  }
}

triggerWorkflow();