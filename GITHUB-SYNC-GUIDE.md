# GitHub Synchronization Guide for Aetherion

This guide provides instructions for setting up automatic and manual synchronization between Replit and GitHub for the Aetherion project.

## Setup Options

You have three options for keeping your GitHub repository in sync with your Replit workspace:

1. **GitHub Actions Workflow** (Recommended) - Automatically syncs changes on a schedule
2. **JavaScript Trigger Script** - Manually trigger the workflow from Replit
3. **Bash Script** - Direct command-line approach to push changes

## Option 1: GitHub Actions Workflow

### Initial Setup

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add a new repository secret:
   - Name: `REPLIT_REPO_URL`
   - Value: Your Replit repository URL (e.g., `https://github.com/aifreedomtrust/aetherion.git`)

### How It Works

- The workflow runs automatically every 6 hours
- It pulls changes from Replit, merges them, and pushes to GitHub
- Conflicts are automatically resolved in favor of the Replit version

### Manual Trigger

To trigger manually:
1. Go to your GitHub repository
2. Click on "Actions"
3. Select "Auto-Sync to GitHub" workflow
4. Click "Run workflow"

## Option 2: JavaScript Trigger Script

### Setup

1. Create a GitHub Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Create a token with "workflow" permissions
   
2. Add the token to your Replit secrets:
   - In Replit, go to "Secrets" in the left sidebar
   - Add a new secret:
     - Key: `GITHUB_TOKEN`
     - Value: Your GitHub personal access token

3. Edit the script configuration:
   - Open `scripts/trigger-github-sync.js`
   - Update the `GITHUB_USERNAME` and `REPO_NAME` values

### Usage

Run the script from the Replit shell:

```
node scripts/trigger-github-sync.js
```

## Option 3: Bash Script

### Setup

1. Edit the script configuration:
   - Open `scripts/git-sync.sh`
   - Update the `GITHUB_REPO` value with your GitHub repository URL

2. Make the script executable:
   ```
   chmod +x scripts/git-sync.sh
   ```

### Usage

Run the script from the Replit shell:

```
./scripts/git-sync.sh
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Check that your GitHub token hasn't expired
2. Ensure the token has the correct permissions
3. Verify the repository URL is correct

### Merge Conflicts

While the automated tools try to resolve conflicts, complex conflicts may require manual intervention:

1. Clone both repositories locally
2. Merge changes manually
3. Push the resolved changes to both repositories

### Network Issues

If you see "CHANNEL_CLOSED" errors or connection timeouts:

1. Try on a more stable network connection
2. Reduce the size of changes being pushed
3. Wait a few minutes and try again

## Additional Notes

- The GitHub Actions workflow is the most reliable method as it runs in the cloud
- Direct git commands from Replit may sometimes fail due to connection or memory limitations
- Consider breaking larger changes into smaller, more frequent commits

For further assistance, contact the Aetherion development team.