# GitHub Sync Troubleshooting Guide

This guide will help you troubleshoot and resolve common issues with GitHub synchronization for Aetherion Wallet.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Permission Problems](#permission-problems)
3. [Merge Conflicts](#merge-conflicts)
4. [Connection Problems](#connection-problems)
5. [Release Creation Failures](#release-creation-failures)

---

## Authentication Issues

### Symptoms

- Error messages containing "authentication failed" or "401 Unauthorized"
- Git push operations failing with credential errors
- GitHub API operations failing

### Solutions

1. **Check your GitHub token**

   Ensure your GitHub token is valid and has the appropriate permissions:
   
   ```bash
   # View token in .env file
   grep GITHUB_TOKEN .env
   
   # If token is invalid or missing, set a new one
   ./setup-github-sync.sh
   ```

2. **Verify token permissions**

   Your token needs at least these permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   
   If using GitHub CLI for releases:
   - `write:packages` (Upload packages to GitHub Package Registry)

3. **Update stored credentials**

   ```bash
   # Check stored credentials
   git config --list | grep credential
   
   # Update credentials
   ./setup-github-sync.sh --token=your_new_token
   ```

## Permission Problems

### Symptoms

- Error messages containing "permission denied" or "403 Forbidden"
- Push operations failing despite valid authentication
- Unable to create releases

### Solutions

1. **Check repository access**

   Ensure you have write access to the repository:
   
   ```bash
   # Test repository access
   curl -H "Authorization: token $(grep GITHUB_TOKEN .env | cut -d '=' -f2)" \
     https://api.github.com/repos/your-username/your-repo
   ```

2. **Verify repository ownership**

   Make sure you're pushing to the correct repository:
   
   ```bash
   # Check remote URL
   git remote -v
   
   # If incorrect, update it
   ./setup-github-sync.sh --repo=correct-owner/correct-repo
   ```

3. **Check branch protection rules**

   Some repositories have branch protection rules that prevent direct pushes:
   
   - Create a pull request instead of pushing directly
   - Ask repository administrator to grant you bypass permissions

## Merge Conflicts

### Symptoms

- Error messages containing "merge conflict" or "cannot be merged"
- Push operations rejected due to conflicting changes
- Release creation failing due to conflicts

### Solutions

1. **Pull latest changes first**

   ```bash
   # Fetch latest changes
   git fetch origin
   
   # Merge or rebase
   git merge origin/main
   # OR
   git rebase origin/main
   ```

2. **Resolve conflicts manually**

   ```bash
   # After a failed merge/rebase, resolve conflicts in each file
   # Add resolved files
   git add path/to/resolved/file
   
   # Continue merge/rebase
   git merge --continue
   # OR
   git rebase --continue
   ```

3. **Use the conflict resolution script**

   ```bash
   # Run the conflict resolution helper
   ./resolve-conflicts.sh
   ```

## Connection Problems

### Symptoms

- Error messages containing "failed to connect" or "timed out"
- Operations hanging or taking extremely long
- Intermittent failures

### Solutions

1. **Check your internet connection**

   ```bash
   # Test GitHub connectivity
   ping github.com
   
   # Check DNS resolution
   nslookup github.com
   ```

2. **Try SSH instead of HTTPS**

   ```bash
   # Set up SSH keys if you haven't
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add key to GitHub (copy output of this command)
   cat ~/.ssh/id_ed25519.pub
   
   # Change remote URL to SSH
   git remote set-url origin git@github.com:your-username/your-repo.git
   ```

3. **Check for proxy or firewall issues**

   - Ensure your firewall allows GitHub connections
   - Configure Git to use a proxy if needed:
     ```bash
     git config --global http.proxy http://proxy-server:port
     ```

## Release Creation Failures

### Symptoms

- Sync script completes, but release isn't created
- GitHub CLI errors during release creation
- Missing release assets

### Solutions

1. **Install GitHub CLI correctly**

   ```bash
   # Check if GitHub CLI is installed
   gh --version
   
   # Authenticate GitHub CLI
   gh auth login
   ```

2. **Check release assets**

   ```bash
   # Verify release package exists
   ls -la aetherion-wallet-*.zip
   
   # If missing, recreate it
   ./sync-to-github.sh --no-release
   # Then manually create release with:
   gh release create v1.0.0 aetherion-wallet-v1.0.0.zip --notes "Release notes"
   ```

3. **Create release manually**

   If automated release creation fails, you can create it manually:
   
   1. Go to your repository on GitHub
   2. Click "Releases" on the right sidebar
   3. Click "Draft a new release"
   4. Enter the tag version (e.g., "v1.0.0")
   5. Upload the release package
   6. Write release notes
   7. Click "Publish release"