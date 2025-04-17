# Replit-GitHub Integration Guide for AetherWallet-1

This comprehensive guide explains how to set up bidirectional synchronization between your Replit project (`AetherWallet-1`) and your GitHub repository.

## Overview

The integration provides these benefits:

- **Automatic synchronization** of code changes between Replit and GitHub
- **Version control** for your project with full Git capabilities
- **Collaborative development** across both platforms
- **CI/CD integration** for automated testing and deployment

## Prerequisites

- A GitHub account with repository admin access
- Your Replit project (AetherWallet-1)
- A GitHub Personal Access Token (PAT) with `repo` and `workflow` scopes

## Setup Options

We've provided two methods to configure the integration:

### Option 1: Interactive Setup Script (Recommended)

1. Run the interactive setup script:
   ```bash
   node setup-github-sync.js
   ```

2. Follow the prompts to:
   - Enter your GitHub token
   - Confirm repository details
   - Generate the necessary secrets

3. The script will create a configuration file with detailed instructions.

### Option 2: Manual Configuration

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `repo` and `workflow` scopes
   - Save the token securely

2. Configure these repository secrets in GitHub:
   - `REPLIT_REPO_URL`: `https://replit.com/@aifreedomtrust/AetherWallet-1`
   - `REPLIT_GIT_URL`: `https://YOUR_PAT@github.com/aifreedomtrust/AetherWallet-1.git`

3. Add these secrets in two places:
   - GitHub repository > Settings > Secrets and variables > Actions
   - GitHub repository > Settings > Secrets and variables > Codespaces

## Workflow Configuration

The `.github/workflows/auto-sync.yml` file contains the GitHub Actions workflow that:

- Runs automatically every 6 hours
- Can be manually triggered via the Actions tab
- Synchronizes changes from Replit to GitHub
- Handles merge conflicts by creating a new branch

## Testing the Integration

After setting up the secrets:

1. Make a change in your Replit project
2. Go to the Actions tab in your GitHub repository
3. Run the "Auto-Sync from Replit for AetherWallet-1" workflow
4. Verify that changes appear in your GitHub repository

## Troubleshooting

If synchronization fails:

1. Check that your GitHub token is valid and has not expired
2. Verify that the repository secrets are correctly configured
3. Ensure that the GitHub repository name in the Git URL matches your actual repository
4. Check the workflow run logs for specific error messages

## Support Files

We've included several files to help with the integration:

- `setup-github-sync.js` - Interactive setup script
- `generate-replit-git-url.js` - Helper script for token configuration
- `GITHUB_SYNC_SETUP.md` - Detailed setup instructions
- `github-sync-config.md` - Generated configuration (after running the setup script)

## Security Considerations

- Never commit your GitHub token or expose it in public repositories
- Regularly rotate your GitHub tokens for security
- Consider using repository environments for production deployments