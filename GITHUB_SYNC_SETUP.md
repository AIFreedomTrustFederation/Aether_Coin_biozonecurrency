# GitHub Sync Setup Instructions

This guide will help you set up automatic synchronization between your Replit project `AetherWallet-1` and your GitHub repository.

## Required Secrets

You need to set up the following GitHub secrets:

### 1. REPLIT_REPO_URL

This secret points to your Replit project URL.

**Value to use:** `https://replit.com/@aifreedomtrust/AetherWallet-1`

### 2. REPLIT_GIT_URL

This secret contains the Git URL used to clone your Replit project.

To generate this value:

1. Create a GitHub Personal Access Token (PAT):
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Click "Generate new token (classic)"
   - Give it a name like "Replit Sync"
   - Select these scopes: `repo`, `workflow`
   - Click "Generate token"
   - **COPY YOUR TOKEN IMMEDIATELY - it won't be shown again!**

2. Use this format for the REPLIT_GIT_URL value:
   ```
   https://YOUR_PAT_TOKEN@github.com/aifreedomtrust/AetherWallet-1.git
   ```
   Replace `YOUR_PAT_TOKEN` with the token you just created.

## Setting Up GitHub Codespaces Secrets

1. Navigate to your GitHub repository
2. Go to Settings > Secrets and variables > Codespaces
3. Add both secrets:
   - REPLIT_REPO_URL
   - REPLIT_GIT_URL

## Setting Up GitHub Actions Secrets

1. Navigate to your GitHub repository
2. Go to Settings > Secrets and variables > Actions
3. Add both secrets again:
   - REPLIT_REPO_URL
   - REPLIT_GIT_URL

## Testing the Setup

After configuring the secrets:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Auto-Sync from Replit for AetherWallet-1" workflow
3. Click "Run workflow" and select the branch (usually main)
4. Wait for the workflow to complete
5. Check if your repository has been updated with the latest changes from Replit

## Automatic Sync Schedule

The workflow is configured to run:
- Every 6 hours automatically
- Whenever you manually trigger it
- (You can modify the schedule in the `.github/workflows/auto-sync.yml` file)

## Troubleshooting

If the workflow fails, check:
1. That your PAT has not expired
2. That your secrets are correctly set
3. That the repository name in the Git URL matches your actual repository name