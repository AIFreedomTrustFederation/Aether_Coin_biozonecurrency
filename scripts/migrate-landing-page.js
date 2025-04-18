/**
 * Landing Page Migration Script
 * 
 * This script helps with migrating the landing page from the Harmony template
 * to the wallet app's landing page.
 * 
 * Usage:
 * node scripts/migrate-landing-page.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const rootDir = path.join(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const pagesDir = path.join(clientDir, 'src', 'pages');
const landingPagePath = path.join(pagesDir, 'LandingPage.tsx');
const backupPath = path.join(pagesDir, 'LandingPage.tsx.backup');

// Create backup of current landing page
function backupLandingPage() {
  try {
    if (fs.existsSync(landingPagePath)) {
      console.log('Creating backup of current landing page...');
      fs.copyFileSync(landingPagePath, backupPath);
      console.log(`Backup created at ${backupPath}`);
      return true;
    } else {
      console.error('Landing page not found at', landingPagePath);
      return false;
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
}

// Restore landing page from backup
function restoreLandingPage() {
  try {
    if (fs.existsSync(backupPath)) {
      console.log('Restoring landing page from backup...');
      fs.copyFileSync(backupPath, landingPagePath);
      console.log('Landing page restored successfully');
      return true;
    } else {
      console.error('Backup not found at', backupPath);
      return false;
    }
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
}

// Check if wallet app landing page template exists
function checkWalletTemplate() {
  const walletTemplatePath = path.join(rootDir, 'templates', 'wallet-landing-page.tsx');
  return fs.existsSync(walletTemplatePath) ? walletTemplatePath : null;
}

// Apply wallet app landing page template
function applyWalletTemplate() {
  const templatePath = checkWalletTemplate();
  
  if (!templatePath) {
    console.error('Wallet landing page template not found');
    console.log('Please create a template at templates/wallet-landing-page.tsx');
    return false;
  }
  
  try {
    console.log('Applying wallet landing page template...');
    fs.copyFileSync(templatePath, landingPagePath);
    console.log('Wallet landing page template applied successfully');
    return true;
  } catch (error) {
    console.error('Error applying template:', error);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'backup':
      backupLandingPage();
      break;
    
    case 'restore':
      restoreLandingPage();
      break;
    
    case 'apply':
      if (backupLandingPage()) {
        applyWalletTemplate();
      }
      break;
    
    default:
      console.log('Landing Page Migration Script');
      console.log('----------------------------');
      console.log('Commands:');
      console.log('  backup - Create a backup of the current landing page');
      console.log('  restore - Restore the landing page from backup');
      console.log('  apply - Apply the wallet app landing page template');
      console.log('\nUsage: node scripts/migrate-landing-page.js [command]');
  }
}

main().catch(console.error);