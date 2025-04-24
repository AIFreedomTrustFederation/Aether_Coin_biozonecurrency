# Main Branch Deployment Strategy

## Overview

This document explains the updated deployment strategy that uses the `main` branch as the primary branch for both development and deployment to the production website at ATC.aifreedomtrust.com.

## Why Move to Main Branch?

1. **Simplification**: By consolidating all work to the main branch, we reduce complexity in branch management
2. **Single Source of Truth**: Main branch becomes the definitive version of the codebase
3. **Streamlined Deployments**: CI/CD workflow is simpler with a single branch to deploy from
4. **Easier Collaboration**: All team members work on the same branch

## Key Files

1. `.github/workflows/deploy-main-to-cpanel.yml` - The GitHub Actions workflow that deploys from main to production
2. `client/src/pages/CodeStarPage.tsx` - The CodeStar IDE page (renamed from Codester)
3. `client/src/features/code-editor/components/CodeEditor.tsx` - The code editor component used by CodeStarPage
4. `client/src/App.tsx` - Contains the route for the CodeStar page
5. `server-proxy.js` - Contains server configuration with the `/codestar` route

## Deployment Process

The deployment process now works as follows:

1. Developers push code to the `main` branch
2. The GitHub Action workflow `deploy-main-to-cpanel.yml` is triggered automatically
3. The workflow builds the application and deploys it to the production website

This workflow can also be manually triggered from the GitHub Actions tab if needed.

## Local Development

For local development:

1. Clone the repository
2. Checkout the main branch
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Codebase Changes

As part of the transition, we've made the following changes:

1. Renamed "Codester" to "CodeStar" throughout the codebase
2. Updated all related components and routes
3. Created a new deployment workflow for the main branch

## Future Considerations

The clean branch strategy has been deprecated in favor of using feature branches that merge directly to main. For future development:

1. Create feature branches from main
2. Develop and test features in isolation
3. Create pull requests to merge back to main
4. After review, merge to main for automatic deployment

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for error messages
2. Verify that all required secrets are set in the repository settings
3. Test the build process locally to ensure it works before pushing
4. Use the staging environment option to test deployments before production