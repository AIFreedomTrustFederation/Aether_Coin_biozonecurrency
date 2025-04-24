# Deploying the Clean Branch to ATC.aifreedomtrust.com

Follow these instructions to update your website to use the `clean_fixes_20250410_163230` branch instead of the main branch.

## Option 1: Direct Deployment from the Clean Branch

If your deployment platform allows direct deployment from a specific branch:

1. Access your deployment platform (cPanel, GitHub Pages, Vercel, etc.)
2. Navigate to the deployment settings
3. Change the source branch from `main` to `clean_fixes_20250410_163230`
4. Save the settings and trigger a new deployment

## Option 2: Manual Deployment via FTP/SFTP

If you're using FTP/SFTP to upload files to your hosting provider:

1. In your local environment, checkout the clean branch:
   ```bash
   git checkout clean_fixes_20250410_163230
   ```

2. Pull the latest changes (including our CodeStar component):
   ```bash
   git pull origin clean_fixes_20250410_163230
   ```

3. Build the project (if required):
   ```bash
   npm run build
   ```

4. Upload the built files to your web server using FTP/SFTP

## Option 3: Using the Deploy Script

If you're using the `deploy-to-aifreedomtrust.js` or `deploy-to-domain.js` script:

1. Open the script and find the branch selection setting
2. Change from `main` to `clean_fixes_20250410_163230`
3. Run the script:
   ```bash
   node deploy-to-aifreedomtrust.js
   ```

## Option 4: Updated GitHub Actions Workflow

If you're using GitHub Actions for deployment:

1. Update your workflow YAML file to use the clean branch:

   ```yaml
   # In .github/workflows/deploy.yml
   on:
     push:
       branches:
         - clean_fixes_20250410_163230  # Change from main to this branch
   ```

2. Commit and push this change to trigger the deployment

## Verifying the Deployment

After deployment, verify that your website shows the CodeStar page:

1. Visit `https://atc.aifreedomtrust.com/codestar`
2. Make sure the CodeStar IDE Interface page loads correctly
3. Check for any console errors or visual issues

## Reverting (If Needed)

If you encounter issues with the deployment, you can revert to the main branch using the same process but changing back to the `main` branch.

## Notes

- Remember to test the deployment in a staging environment first if possible
- Always backup your production environment before major changes
- If the website uses a build process, make sure all dependencies are properly installed