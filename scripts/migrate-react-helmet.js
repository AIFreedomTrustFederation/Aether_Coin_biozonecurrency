#!/usr/bin/env node

/**
 * React Helmet to React Helmet Async Migration Script
 * ===================================================
 * 
 * This script automates the process of upgrading from react-helmet to
 * react-helmet-async to fix React 18 lifecycle warnings.
 * 
 * The script will:
 * 1. Install react-helmet-async package
 * 2. Update imports in all files from 'react-helmet' to 'react-helmet-async'
 * 3. Add HelmetProvider in the main App component
 * 
 * Usage:
 * $ node migrate-react-helmet.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const config = {
  rootDir: process.cwd(),
  clientSrcDir: 'client/src',
  appFile: 'App.tsx', // Or App.jsx
  backupExtension: '.bak',
  dryRun: false,
};

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

/**
 * Find all files in a directory recursively
 */
function findFiles(dir, fileList = []) {
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
 * Back up a file before modifying it
 */
function backupFile(filePath) {
  const backupPath = `${filePath}${config.backupExtension}`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    log.info(`Created backup: ${backupPath}`);
  }
}

/**
 * Update imports from 'react-helmet' to 'react-helmet-async'
 */
function updateImports(filePath) {
  try {
    backupFile(filePath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace import statements
    const updatedContent = content.replace(
      /import\s+(?:{[^}]*}\s+from\s+)?['"]react-helmet['"]/g,
      (match) => match.replace('react-helmet', 'react-helmet-async')
    );
    
    if (updatedContent !== originalContent) {
      if (!config.dryRun) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
      }
      log.success(`Updated imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    log.error(`Failed to update imports in ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Add HelmetProvider to App component
 */
function addHelmetProvider(appFilePath) {
  try {
    backupFile(appFilePath);
    
    let content = fs.readFileSync(appFilePath, 'utf8');
    const originalContent = content;
    
    // Check if HelmetProvider is already imported
    if (!content.includes('HelmetProvider')) {
      // Add HelmetProvider import
      content = content.replace(
        /import\s+(?:{[^}]*}\s+from\s+)?['"]react-helmet-async['"]/,
        (match) => {
          if (match.includes('{')) {
            return match.replace(/{([^}]*)}/g, (_, imports) => {
              return `{ HelmetProvider, ${imports} }`;
            });
          } else {
            return `import { HelmetProvider } from 'react-helmet-async';\n${match}`;
          }
        }
      );
      
      // If no react-helmet-async import was found, add it
      if (content === originalContent) {
        const importInsertPosition = content.search(/import [^;]*;(\s*\n\s*import [^;]*;)*/) + 
          content.match(/import [^;]*;(\s*\n\s*import [^;]*;)*/)[0].length;
        
        content = content.substring(0, importInsertPosition) + 
                 "\nimport { HelmetProvider } from 'react-helmet-async';" +
                 content.substring(importInsertPosition);
      }
    }
    
    // Add HelmetProvider component
    // This is a simplified approach - for complex apps, manual adjustment might be needed
    if (!content.includes('<HelmetProvider>')) {
      // Look for common patterns in React app root components
      const patterns = [
        // Pattern: return ( <Component> ... </Component> );
        {
          regex: /(return\s*\(\s*)(<[A-Z][a-zA-Z]*.*?>)/g,
          replacement: '$1<HelmetProvider>\n      $2'
        },
        // Pattern: </ComponentBeforeApp>
        {
          regex: /(<\/[A-Z][a-zA-Z]*>)(\s*\n\s*<\/[A-Z][a-zA-Z]*>)(\s*\n\s*<\/[A-Z][a-zA-Z]*>)(\s*\n\s*<\/[A-Z][a-zA-Z]*>)/g,
          replacement: '$1\n      </HelmetProvider>$2$3$4'
        }
      ];
      
      let modified = false;
      
      for (const pattern of patterns) {
        const newContent = content.replace(pattern.regex, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          break;
        }
      }
      
      if (!modified) {
        log.warn(`Could not automatically add HelmetProvider in ${appFilePath}.`);
        log.warn('You will need to manually add the HelmetProvider component.');
      }
    }
    
    if (content !== originalContent) {
      if (!config.dryRun) {
        fs.writeFileSync(appFilePath, content, 'utf8');
      }
      log.success(`Updated App component in: ${appFilePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    log.error(`Failed to update App component in ${appFilePath}: ${error.message}`);
    return false;
  }
}

/**
 * Install react-helmet-async package
 */
function installHelmetAsync() {
  try {
    log.task('Installing react-helmet-async package...');
    
    if (!config.dryRun) {
      execSync('npm install react-helmet-async', { stdio: 'inherit' });
    } else {
      log.info('[DRY RUN] Would execute: npm install react-helmet-async');
    }
    
    log.success('Installed react-helmet-async package.');
    return true;
  } catch (error) {
    log.error(`Failed to install react-helmet-async: ${error.message}`);
    return false;
  }
}

/**
 * Main migration function
 */
function migrateReactHelmet() {
  log.info('Starting migration from react-helmet to react-helmet-async...');
  log.info(`Working directory: ${config.rootDir}`);
  
  const clientDir = path.join(config.rootDir, config.clientSrcDir);
  
  if (!fs.existsSync(clientDir)) {
    log.error(`Client source directory not found: ${clientDir}`);
    log.info('Please run this script from your project root or update the clientSrcDir in the script config.');
    return false;
  }
  
  // Step 1: Install react-helmet-async
  const packageInstalled = installHelmetAsync();
  if (!packageInstalled) return false;
  
  // Step 2: Find all JS/TS files
  log.task('Scanning for files to update...');
  const files = findFiles(clientDir);
  log.info(`Found ${files.length} files to scan.`);
  
  // Step 3: Update imports in all files
  log.task('Updating imports from react-helmet to react-helmet-async...');
  let updatedFiles = 0;
  
  files.forEach(file => {
    if (updateImports(file)) {
      updatedFiles++;
    }
  });
  
  log.success(`Updated imports in ${updatedFiles} files.`);
  
  // Step 4: Add HelmetProvider to App component
  log.task('Adding HelmetProvider to App component...');
  const appFilePath = path.join(clientDir, config.appFile);
  
  if (fs.existsSync(appFilePath)) {
    addHelmetProvider(appFilePath);
  } else {
    log.warn(`App file not found: ${appFilePath}`);
    log.warn('You will need to manually add the HelmetProvider component.');
  }
  
  log.success('Migration completed!');
  log.info('Note: You may need to manually adjust the HelmetProvider placement in complex applications.');
  log.info('Recommended next steps:');
  log.info('1. Check your App component to ensure HelmetProvider is correctly placed');
  log.info('2. Run your application and verify no warnings appear in the console');
  log.info('3. Once everything works correctly, you can remove the backup (.bak) files');
  
  return true;
}

// Start the migration with confirmation
rl.question(`This will migrate your project from react-helmet to react-helmet-async. Proceed? (y/n) `, (answer) => {
  if (answer.toLowerCase() === 'y') {
    migrateReactHelmet();
  } else {
    log.info('Migration cancelled.');
  }
  rl.close();
});