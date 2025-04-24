# Deploying the Clean Branch to ATC.aifreedomtrust.com

This guide explains how to deploy the `clean_fixes_20250410_163230` branch to your ATC.aifreedomtrust.com website.

## Option 1: Using the Modified Deployment Script (Recommended)

We've created a modified version of your deployment script that specifically allows you to choose which branch to deploy.

### Step 1: Run the Modified Script

1. Open your terminal
2. Navigate to your project directory
3. Run the modified deployment script:

```bash
node deploy-to-aifreedomtrust-modified.js
```

4. When prompted, choose the branch to deploy:
   - Just press Enter to use the default (`clean_fixes_20250410_163230`)
   - Or type `main` if you want to deploy the main branch instead

5. Enter your SSH credentials when prompted

### Step 2: Verify the Deployment

1. Visit https://atc.aifreedomtrust.com/wallet to see the main site
2. Visit https://atc.aifreedomtrust.com/wallet/codestar to see the new CodeStar page (previously Codester)

## Option 2: Manual Deployment

If you prefer to manually deploy:

1. Checkout the clean branch locally:
   ```bash
   git checkout clean_fixes_20250410_163230
   ```

2. Build the application:
   ```bash
   npm install
   npm run build
   ```

3. Upload the build files to your server:
   ```bash
   scp -r dist/* user@atc.aifreedomtrust.com:~/aetherion/
   ```

4. Restart your server service:
   ```bash
   ssh user@atc.aifreedomtrust.com "sudo systemctl restart aetherion"
   ```

## Differences in the Clean Branch

The `clean_fixes_20250410_163230` branch includes these key changes:

1. Renamed "Codester" to "CodeStar" throughout the codebase
2. Added a new `/codestar` route in the client application
3. Updated server-proxy.js to support the new route

## Reverting to Main Branch

If you need to revert to the main branch:

1. Run the modified deployment script again
2. When prompted for the branch, enter `main`
3. Complete the deployment process

## Troubleshooting

If you encounter issues:

1. Check the server logs:
   ```bash
   ssh user@atc.aifreedomtrust.com "sudo journalctl -u aetherion -f"
   ```

2. Ensure the service is running:
   ```bash
   ssh user@atc.aifreedomtrust.com "sudo systemctl status aetherion"
   ```

3. Restart the service if needed:
   ```bash
   ssh user@atc.aifreedomtrust.com "sudo systemctl restart aetherion"
   ```