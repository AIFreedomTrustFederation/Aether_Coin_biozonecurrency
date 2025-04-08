#!/usr/bin/env node

/**
 * Aetherion Wallet Dependency Upgrade Script
 * =========================================
 * 
 * This script automates the process of upgrading deprecated Node.js dependencies to their
 * recommended alternatives. It parses npm warning messages and performs the necessary
 * package upgrades.
 * 
 * The script will:
 * 1. Identify deprecated packages from npm warnings
 * 2. Install recommended alternatives
 * 3. Remove deprecated packages if possible
 * 4. Update relevant import statements in code
 * 
 * Usage:
 * $ node upgrade-dependencies.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Simple logging utility
const log = {
  info: (msg) => console.log(`${colors.blue}INFO:${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}SUCCESS:${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}WARNING:${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}ERROR:${colors.reset} ${msg}`),
  task: (msg) => console.log(`${colors.cyan}TASK:${colors.reset} ${msg}`),
};

// Known deprecated packages and their replacements
const knownDeprecations = {
  'sourcemap-codec': '@jridgewell/sourcemap-codec',
  'rimraf@3.0.2': 'rimraf@4',
  'rollup-plugin-inject': '@rollup/plugin-inject',
  '@paulmillr/qr': 'qr',
  'glob@7.2.3': 'glob@9',
  'glob@8.1.0': 'glob@9',
};

// Package import remappings - how to update import statements
const importRemappings = {
  'sourcemap-codec': '@jridgewell/sourcemap-codec',
  'rollup-plugin-inject': '@rollup/plugin-inject',
  '@paulmillr/qr': 'qr',
};

/**
 * Find all files in a directory recursively
 */
function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.git')) {
      fileList = findFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract npm warnings from npm output
 */
function extractNpmWarnings() {
  try {
    log.task('Checking for deprecated packages...');
    const output = execSync('npm list --depth=0', { encoding: 'utf8' });
    
    // Extract warnings about deprecated packages
    const deprecatedWarnings = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('npm WARN deprecated')) {
        deprecatedWarnings.push(line.trim());
      }
    }
    
    return deprecatedWarnings;
  } catch (error) {
    // npm list often returns non-zero exit codes for various reasons
    // We're just interested in the stdout which contains the warnings
    const output = error.stdout.toString();
    
    // Extract warnings about deprecated packages
    const deprecatedWarnings = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('npm WARN deprecated')) {
        deprecatedWarnings.push(line.trim());
      }
    }
    
    return deprecatedWarnings;
  }
}

/**
 * Parse npm warnings to extract deprecated packages and recommendations
 */
function parseNpmWarnings(warnings) {
  const deprecatedPackages = [];
  
  warnings.forEach(warning => {
    // Example: "npm WARN deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead"
    const match = warning.match(/npm WARN deprecated ([^@]+@[^:]+):/);
    
    if (match && match[1]) {
      const packageWithVersion = match[1].trim();
      const packageName = packageWithVersion.split('@')[0];
      
      // Extract recommendation
      const recommendationMatch = warning.match(/Please use ([^ ]+) instead/);
      const recommendation = recommendationMatch ? recommendationMatch[1] : null;
      
      deprecatedPackages.push({
        packageWithVersion,
        packageName,
        recommendation
      });
    }
  });
  
  return deprecatedPackages;
}

/**
 * Upgrade deprecated packages to recommended alternatives
 */
async function upgradeDeprecatedPackages() {
  try {
    log.task('Looking for deprecated packages in the project...');
    
    // First, try to get warnings from npm output
    let warnings = extractNpmWarnings();
    let deprecatedPackages = parseNpmWarnings(warnings);
    
    // If we couldn't get any warnings from npm output, use the known deprecations
    if (deprecatedPackages.length === 0) {
      log.info('No deprecated packages found in npm list output. Using known deprecations list...');
      
      deprecatedPackages = Object.entries(knownDeprecations).map(([packageWithVersion, recommendation]) => {
        const packageName = packageWithVersion.split('@')[0];
        return {
          packageWithVersion,
          packageName,
          recommendation
        };
      });
    }
    
    if (deprecatedPackages.length === 0) {
      log.success('No deprecated packages found!');
      return;
    }
    
    log.info(`Found ${deprecatedPackages.length} deprecated packages:`);
    
    deprecatedPackages.forEach(pkg => {
      if (pkg.recommendation) {
        log.warn(`${pkg.packageWithVersion} -> ${pkg.recommendation}`);
      } else {
        log.warn(`${pkg.packageWithVersion} (no recommendation available)`);
      }
    });
    
    // Confirm before proceeding
    const shouldContinue = await new Promise(resolve => {
      rl.question('\nDo you want to upgrade these packages? (y/n) ', answer => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (!shouldContinue) {
      log.info('Upgrade cancelled.');
      return;
    }
    
    // Install recommended alternatives
    const packagesToInstall = deprecatedPackages
      .filter(pkg => pkg.recommendation)
      .map(pkg => pkg.recommendation);
    
    if (packagesToInstall.length > 0) {
      log.task(`Installing ${packagesToInstall.length} recommended alternatives...`);
      
      try {
        execSync(`npm install ${packagesToInstall.join(' ')}`, { stdio: 'inherit' });
        log.success('Successfully installed recommended packages!');
      } catch (error) {
        log.error(`Failed to install packages: ${error.message}`);
      }
    }
    
    // Update import statements in code
    await updateImportStatements();
    
    // Try to remove deprecated packages
    const packagesToRemove = deprecatedPackages.map(pkg => pkg.packageName);
    
    if (packagesToRemove.length > 0) {
      log.task(`Attempting to remove ${packagesToRemove.length} deprecated packages...`);
      
      try {
        execSync(`npm uninstall ${packagesToRemove.join(' ')}`, { stdio: 'inherit' });
        log.success('Successfully removed deprecated packages!');
      } catch (error) {
        log.warn(`Could not remove all deprecated packages: ${error.message}`);
        log.warn('Some packages might still be required by dependencies. This is normal.');
      }
    }
    
    log.success('Dependency upgrade process completed!');
    log.info('You may need to restart your application for changes to take effect.');
    
  } catch (error) {
    log.error(`An error occurred: ${error.message}`);
  } finally {
    rl.close();
  }
}

/**
 * Update import statements in code to use the new packages
 */
async function updateImportStatements() {
  log.task('Scanning project files to update import statements...');
  
  const files = findFiles('.');
  log.info(`Found ${files.length} files to scan.`);
  
  let updatedFiles = 0;
  
  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileUpdated = false;
    
    // Update import statements
    for (const [oldPackage, newPackage] of Object.entries(importRemappings)) {
      const importRegex = new RegExp(`from\\s+['"]${oldPackage}(?:/([^'"]+))?['"]`, 'g');
      
      content = content.replace(importRegex, (match, subPath) => {
        fileUpdated = true;
        if (subPath) {
          return `from "${newPackage}/${subPath}"`;
        } else {
          return `from "${newPackage}"`;
        }
      });
      
      // Also check require statements
      const requireRegex = new RegExp(`require\\s*\\(\\s*['"]${oldPackage}(?:/([^'"]+))?['"]\\s*\\)`, 'g');
      
      content = content.replace(requireRegex, (match, subPath) => {
        fileUpdated = true;
        if (subPath) {
          return `require("${newPackage}/${subPath}")`;
        } else {
          return `require("${newPackage}")`;
        }
      });
    }
    
    if (fileUpdated && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      log.success(`Updated imports in: ${filePath}`);
      updatedFiles++;
    }
  }
  
  log.info(`Updated import statements in ${updatedFiles} files.`);
}

// Main execution
upgradeDeprecatedPackages();