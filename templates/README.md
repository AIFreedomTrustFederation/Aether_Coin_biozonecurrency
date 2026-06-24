# Wallet Landing Page Templates

This directory contains templates for the wallet landing page migration.

## Files

- `wallet-landing-page.tsx`: Template for the new wallet-focused landing page

## Usage

To apply the wallet landing page template:

1. Create a backup of the current landing page:
   ```bash
   node scripts/migrate-landing-page.js backup
   ```

2. Apply the wallet landing page template:
   ```bash
   node scripts/migrate-landing-page.js apply
   ```

3. If you need to restore the original landing page:
   ```bash
   node scripts/migrate-landing-page.js restore
   ```

## Customization

You can customize the wallet landing page template by editing `templates/wallet-landing-page.tsx` before applying it.

## Manual Migration

If you prefer to manually migrate the landing page:

1. Create a backup of the current landing page:
   ```bash
   cp client/src/pages/LandingPage.tsx client/src/pages/LandingPage.tsx.backup
   ```

2. Copy the content from `templates/wallet-landing-page.tsx` to `client/src/pages/LandingPage.tsx`

3. Make any necessary adjustments to match your specific requirements

4. Test the changes locally before deploying to production

## Testing

After applying the template, test the application locally:

```bash
npm run build
node server-redirect.js
```

Visit http://localhost:3000/dapp and http://localhost:3000/wallet to ensure both paths work correctly with the new landing page.