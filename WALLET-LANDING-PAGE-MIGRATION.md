# Wallet App Landing Page Migration Plan

This document outlines the steps needed to replace the current Harmony template landing page with the wallet app's landing page at atc.aifreedomtrust.com.

## Current Setup

- The Aetherion application is deployed to atc.aifreedomtrust.com
- It's accessible via two paths: `/dapp` and `/wallet`
- The server-redirect.js file handles serving the application at these paths
- The current landing page is defined in LandingPage.tsx

## Migration Steps

### 1. Backup Current Landing Page

```bash
# Create a backup of the current landing page
cp client/src/pages/LandingPage.tsx client/src/pages/LandingPage.tsx.backup
```

### 2. Create New Landing Page Based on Wallet App

Replace the content of `client/src/pages/LandingPage.tsx` with the wallet app's landing page design. The new landing page should:

- Maintain the same component structure and imports
- Update the UI to match the wallet app's design
- Keep the same routing structure
- Ensure all functionality works with the existing application

### 3. Update Related Components

Identify and update any components that are directly related to the landing page:

- Navigation components
- Header/footer components
- Any shared UI elements

### 4. Test Locally

```bash
# Build and test the application locally
npm run build
node server-redirect.js
```

Visit http://localhost:3000/dapp and http://localhost:3000/wallet to ensure both paths work correctly with the new landing page.

### 5. Deploy to Production

Follow the existing deployment process:

```bash
# Build the application
npm run build

# Package the application
tar -czf deploy-package.tar.gz dist server-redirect.js package.json

# Upload to server
scp deploy-package.tar.gz user@atc.aifreedomtrust.com:~/

# SSH into server and deploy
ssh user@atc.aifreedomtrust.com
cd ~/aetherion
tar -xzf ../deploy-package.tar.gz
npm install --production
sudo systemctl restart aetherion
```

### 6. Verify Deployment

Visit the following URLs to confirm the new landing page is working:
- https://atc.aifreedomtrust.com/dapp
- https://atc.aifreedomtrust.com/wallet

## Implementation Details

### Key Components to Update

1. **Landing Page UI**:
   - Hero section with wallet-focused messaging
   - Feature highlights for the wallet functionality
   - Call-to-action buttons for wallet creation/access

2. **Navigation**:
   - Ensure navigation links point to the correct wallet-related pages
   - Update any menu items to reflect wallet-centric navigation

3. **Branding**:
   - Update any branding elements to match the wallet app's branding
   - Ensure consistent color scheme and design language

4. **Functionality**:
   - Maintain or enhance any interactive elements from the wallet app
   - Ensure all buttons and links work correctly

## Rollback Plan

If issues are encountered with the new landing page:

1. Restore the backup landing page:
   ```bash
   cp client/src/pages/LandingPage.tsx.backup client/src/pages/LandingPage.tsx
   ```

2. Rebuild and redeploy following the same deployment steps.

## Additional Considerations

- Update any SEO metadata to reflect the wallet-focused content
- Ensure responsive design works on all device sizes
- Update any analytics tracking to capture new user interactions
- Consider A/B testing the new landing page against the old one to measure engagement