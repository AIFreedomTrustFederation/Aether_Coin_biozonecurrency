# Migration Plan: Moving Changes to Main Branch

## Overview

This document outlines the specific files that need to be migrated from the `clean_fixes_20250410_163230` branch to the `main` branch, along with important considerations to ensure a smooth transition.

## Files to Migrate

The following files need to be migrated to the `main` branch:

1. **CodeStar Files**
   - `client/src/pages/CodeStarPage.tsx` - The CodeStar IDE page component
   - `client/src/features/code-editor/components/CodeEditor.tsx` - The code editor component

2. **ScrollKeeper Files**
   - `client/src/pages/ScrollKeeperPage.tsx` - The ScrollKeeper dashboard launcher page
   - `client/src/components/ScrollKeeperHighlight.tsx` - Component for the landing page integration

3. **Integration and Routing Files**
   - `client/src/App.tsx` - Updated with both CodeStar and ScrollKeeper routes
   - `server-proxy.js` - Updated with support for both the CodeStar and ScrollKeeper endpoints

4. **Deployment Files**
   - `.github/workflows/deploy-main-to-cpanel.yml` - New workflow to deploy from main branch
   - `.github/README-MAIN-DEPLOYMENT.md` - Documentation for the new deployment approach

## Step-by-Step Migration Instructions

1. **Checkout the main branch**
   ```bash
   git checkout main
   ```

2. **Create necessary directories (if they don't exist)**
   ```bash
   mkdir -p client/src/pages/
   mkdir -p client/src/components/
   mkdir -p client/src/features/code-editor/components/
   mkdir -p .github/workflows/
   ```

3. **Copy files from the clean_fixes branch**
   (Use one of these methods)
   
   a. Using the original migration script (recommended):
   ```bash
   # Make sure the script is executable
   chmod +x scripts/migrate-to-main.sh
   # Run the script
   ./scripts/migrate-to-main.sh
   ```
   
   b. OR manually copy specific files:
   ```bash
   # Checkout the clean_fixes branch to get the files
   git checkout clean_fixes_20250410_163230
   
   # Copy the files to a temporary location
   mkdir -p /tmp/migration
   cp client/src/pages/CodeStarPage.tsx /tmp/migration/
   cp client/src/pages/ScrollKeeperPage.tsx /tmp/migration/
   cp client/src/components/ScrollKeeperHighlight.tsx /tmp/migration/
   cp client/src/features/code-editor/components/CodeEditor.tsx /tmp/migration/
   cp client/src/App.tsx /tmp/migration/
   cp server-proxy.js /tmp/migration/
   cp .github/workflows/deploy-main-to-cpanel.yml /tmp/migration/ 2>/dev/null || true
   cp .github/README-MAIN-DEPLOYMENT.md /tmp/migration/ 2>/dev/null || true
   
   # Switch back to main branch
   git checkout main
   
   # Copy files to their destinations
   cp /tmp/migration/CodeStarPage.tsx client/src/pages/
   cp /tmp/migration/ScrollKeeperPage.tsx client/src/pages/
   cp /tmp/migration/ScrollKeeperHighlight.tsx client/src/components/
   cp /tmp/migration/CodeEditor.tsx client/src/features/code-editor/components/
   cp /tmp/migration/App.tsx client/src/
   cp /tmp/migration/server-proxy.js ./
   cp /tmp/migration/deploy-main-to-cpanel.yml .github/workflows/ 2>/dev/null || true
   cp /tmp/migration/README-MAIN-DEPLOYMENT.md .github/ 2>/dev/null || true
   
   # Clean up
   rm -rf /tmp/migration
   ```

4. **Review the changes**
   - Ensure all files have been correctly copied
   - Verify that the App.tsx has both the CodeStar and ScrollKeeper routes
   - Check that the server-proxy.js includes both the '/codestar' and '/scroll-keeper' paths
   - Ensure all references to "Codester" have been replaced with "CodeStar" throughout the codebase

5. **Commit the changes**
   ```bash
   git add .
   git commit -m "feat: Migrate CodeStar and ScrollKeeper from clean_fixes to main branch"
   ```

6. **Push to GitHub**
   ```bash
   git push origin main
   ```

## Deployment Configuration

After migrating the files, make sure to:

1. **Configure the GitHub Actions workflow**
   - Review the `.github/workflows/deploy-main-to-cpanel.yml` file to ensure it has the correct credentials and settings
   - Check that it's configured to deploy to ATC.aifreedomtrust.com

2. **Test the deployment**
   - Manually trigger a deployment from the main branch in GitHub Actions
   - Select "production" from the environment dropdown
   - Verify the deployment succeeds and the website updates correctly

## Validation Checklist

After deployment, verify:

- [ ] Homepage displays the ScrollKeeper and CodeStar highlights
- [ ] Clicking on "Access Dashboard" on ScrollKeeper card navigates to the ScrollKeeper page
- [ ] Clicking on "Open CodeStar IDE" on CodeStar card navigates to the CodeStar page
- [ ] Both pages have working "Return to Homepage" buttons
- [ ] The ScrollKeeper page has the correct URL for launching the external dashboard
- [ ] No references to "Codester" remain in the UI or code

## Troubleshooting

If issues occur during migration:

- **File Conflicts**: Manually resolve conflicts by examining the differences between versions
- **Missing Dependencies**: Ensure all necessary packages are installed on the main branch
- **Routing Issues**: Verify that server-proxy.js has all the required client routes
- **Deployment Failures**: Check deployment logs in GitHub Actions for specific errors

## Additional Notes

- The migration consolidates all changes on the main branch, eliminating the need to maintain separate branches
- The clean_fixes branch can be kept for reference but should no longer be used for development
- Future updates should be made directly to the main branch to maintain a single source of truth