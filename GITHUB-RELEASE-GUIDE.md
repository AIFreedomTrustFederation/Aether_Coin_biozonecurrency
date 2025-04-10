# GitHub Release Guide for Aetherion Wallet

This guide explains how to create GitHub releases for Aetherion Wallet using the provided tools.

## Overview

The release process consists of these steps:

1. Create a deployment package
2. Prepare release notes
3. Create a GitHub release with the package as an asset

## Prerequisites

- GitHub account with access to the repository
- GitHub personal access token with repo permissions
- Environment variable `GITHUB_TOKEN` set with your token

## Option 1: Automatic Release with Sync Script

The `sync-to-github.sh` script automates the entire process of committing changes, pushing to GitHub, and creating a release.

```bash
# To create a release with auto-incremented version
./sync-to-github.sh

# To create a release with a specific version
./sync-to-github.sh --tag=1.2.3

# To push changes without creating a release
./sync-to-github.sh --no-release
```

## Option 2: Manual Release Process

### Step 1: Create a Deployment Package

```bash
# Create a deployment package
./create-deployment-package.sh --version=1.0.0

# Create a tarball for GitHub upload
./package-for-github-release.sh
```

This will create:
- A directory `aetherion-wallet-v1.0.0` with all required files
- A tarball `aetherion-wallet-v1.0.0.tar.gz` for uploading to GitHub

### Step 2: Prepare Release Notes

Create a file named `RELEASE-NOTES-v1.0.0.md` with release notes in Markdown format.

### Step 3: Create GitHub Release

```bash
# Create a GitHub release with the package
./github-release.sh
```

## Option 3: Direct API Release

The `github-release.sh` script provides a direct way to create a GitHub release using the GitHub API.

```bash
# Make sure GITHUB_TOKEN is set
export GITHUB_TOKEN=your_token_here

# Run the release script
./github-release.sh
```

This will:
1. Create a release on GitHub using the provided release notes
2. Upload the package as a release asset

## Customizing Release Options

To customize the version or repository for the direct API release:

1. Edit the configuration section in `github-release.sh`:
   ```bash
   # Configuration
   VERSION="v1.0.0"  # Change this to your desired version
   REPO="owner/repo" # Change this to your repository path
   ```

2. Run the script again:
   ```bash
   ./github-release.sh
   ```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Check your GitHub token has the `repo` scope
2. Ensure the token is correctly set in your environment:
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```

### Network Timeouts

If you experience network timeouts:

1. Try using the `github-release.sh` script which uses direct API calls
2. Break down the process into smaller steps if needed

### Release Already Exists

If a release or tag already exists:

1. Delete the existing release and tag from GitHub
2. Or increment the version number in your scripts