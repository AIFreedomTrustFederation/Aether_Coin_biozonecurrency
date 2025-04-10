# GitHub Synchronization Troubleshooting

This guide will help you resolve common issues with GitHub synchronization for the Aetherion project.

## Common Issues

### Merge Conflicts

If you see a "merge conflict" error in the GitHub interface, it means there are conflicting changes between your Replit project and the GitHub repository.

To resolve this:

1. Run `./github-sync.sh` which will attempt to resolve conflicts automatically
2. If that doesn't work, you may need to abort any ongoing rebases:
   ```
   git rebase --abort
   ```

### Incorrect Repository Configuration

If the sync process is trying to communicate with the wrong repository:

1. Run the setup script to reconfigure your GitHub settings:
   ```
   ./setup-github-sync.sh
   ```
2. Follow the prompts to enter your GitHub username, repository name, and GitHub token

### GitHub Token Issues

If you see authentication errors:

1. Make sure your GitHub token has the "workflow" permission
2. Run the setup script to update your token:
   ```
   ./setup-github-sync.sh
   ```

### GitHub Actions Configuration

For the GitHub side of the sync process:

1. Ensure you have the `.github/workflows/auto-sync.yml` file in your repository
2. Add a repository secret called `REPLIT_GIT_URL` with the URL to your Replit Git repository
   - You can find this by clicking on the "Git" button in the Replit interface

## Manual Synchronization

If automatic synchronization isn't working, you can manually sync your changes:

1. Clone your GitHub repository locally
2. Add your Replit repository as a remote:
   ```
   git remote add replit <your-replit-git-url>
   ```
3. Fetch changes from Replit:
   ```
   git fetch replit
   ```
4. Merge the changes (this may require resolving conflicts):
   ```
   git merge replit/main
   ```
5. Push the merged changes back to GitHub:
   ```
   git push origin main
   ```

## ES Modules Configuration

Recent changes to the Aetherion project have moved to using ES Modules, which requires:

1. Making sure `"type": "module"` is set in your package.json
2. Using `import` instead of `require` in JavaScript files
3. Using `.js` file extensions in import statements

If you're having issues with ES Modules, check:
- The sync-to-github.js file uses import syntax
- The trigger-github-sync.js file uses import syntax
- Both have the correct repository information