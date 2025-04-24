# Migration to Main Branch Guide

## Overview

This guide outlines the steps to migrate the CodeStar functionality (formerly Codester) from the `clean_fixes_20250410_163230` branch to the `main` branch, and to configure the website deployment to use the main branch instead of the clean branch.

## Why This Migration?

We've decided to simplify our branch strategy by:
1. Using the `main` branch as the single source of truth for our codebase
2. Configuring our GitHub Actions workflows to deploy directly from the main branch
3. Eliminating the complexity of managing multiple deployment branches

## Files Ready for Migration

We've prepared the following files that need to be migrated to the main branch:

1. `client/src/pages/CodeStarPage.tsx` - The CodeStar IDE page component
2. `client/src/features/code-editor/components/CodeEditor.tsx` - The code editor component
3. `client/src/App.tsx` - Updated with the CodeStar route
4. `server-proxy.js` - Updated with support for the CodeStar endpoint
5. `.github/workflows/deploy-main-to-cpanel.yml` - New workflow to deploy from main branch
6. `.github/README-MAIN-DEPLOYMENT.md` - Documentation for the new deployment approach

## Migration Options

### Option 1: Using the Automated Script (Recommended)

We've created a script to help automate the migration process:

```bash
# Make sure the script is executable
chmod +x scripts/migrate-to-main.sh

# Run the script
./scripts/migrate-to-main.sh
```

This script will:
- Check out the main branch
- Copy the necessary files from the clean_fixes branch
- Return you to your original branch
- Provide instructions for committing the changes

### Option 2: Manual Migration

If you prefer to do the migration manually:

1. Checkout the main branch: `git checkout main`
2. Create the necessary directories:
   ```bash
   mkdir -p client/src/pages/
   mkdir -p client/src/features/code-editor/components/
   mkdir -p .github/workflows/
   ```
3. Copy the files listed above from the clean_fixes branch to the main branch
4. Review the changes to ensure everything has been properly migrated
5. Commit the changes: `git commit -m "feat: Migrate CodeStar from clean_fixes to main branch"`
6. Push to GitHub: `git push origin main`

## After Migration

After the migration is completed:

1. **GitHub Actions**: The new workflow `deploy-main-to-cpanel.yml` will be automatically available in GitHub Actions and will trigger on pushes to the main branch.

2. **Clean Branch**: You can keep the clean branch for reference, but no further development should be done on it. Consider archiving it once you're confident in the main branch deployment.

3. **Webhooks**: If you have any webhooks configured for automatic deployment from the clean branch, update them to trigger from the main branch instead.

## Testing the Deployment

Once the migration is complete, you should manually trigger a deployment from the main branch to verify everything works correctly:

1. Go to your GitHub repository
2. Navigate to Actions > Workflows > "Deploy Main Branch to CPanel"
3. Click "Run workflow"
4. Select "production" from the environment dropdown
5. Click "Run workflow"

Monitor the workflow run to ensure it completes successfully.

## Troubleshooting

If you encounter issues during the migration:

- **File Conflicts**: If there are conflicts between files in main and clean_fixes, manually review and resolve them
- **Build Errors**: If the build fails after migration, check the GitHub Actions logs for details
- **Missing Dependencies**: Ensure all necessary packages are installed in the main branch
- **Route Issues**: Verify that all routes are correctly configured in the main branch

## Questions or Issues?

If you have any questions or issues with the migration process, please contact the development team.

Remember, the goal is to simplify our workflow by consolidating to a single main branch, which will make future development and deployments more straightforward.