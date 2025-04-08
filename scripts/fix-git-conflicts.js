#!/usr/bin/env node

/**
 * Git Conflict Resolution Script
 * ==============================
 * 
 * This script automates the process of resolving Git merge conflicts.
 * It can be used in VS Code or any other environment where Git is installed.
 * 
 * The script will:
 * 1. Check for unmerged files and merge conflicts
 * 2. Provide options to resolve conflicts automatically or abort the merge
 * 3. Complete the merge process
 * 
 * Usage:
 * $ node fix-git-conflicts.js
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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
  conflict: (msg) => console.log(`${colors.magenta}CONFLICT:${colors.reset} ${msg}`),
};

/**
 * Executes a Git command and returns the output
 */
function execGit(command) {
  try {
    return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
  } catch (error) {
    log.error(`Git command failed: git ${command}`);
    log.error(error.stderr || error.message);
    return null;
  }
}

/**
 * Checks if there's an ongoing merge
 */
function isInMerge() {
  try {
    const gitDir = execGit('rev-parse --git-dir');
    return fs.existsSync(path.join(gitDir, 'MERGE_HEAD'));
  } catch (error) {
    return false;
  }
}

/**
 * Checks if there's an ongoing rebase
 */
function isInRebase() {
  try {
    const gitDir = execGit('rev-parse --git-dir');
    return fs.existsSync(path.join(gitDir, 'rebase-merge')) || 
           fs.existsSync(path.join(gitDir, 'rebase-apply'));
  } catch (error) {
    return false;
  }
}

/**
 * Gets the list of files with conflicts
 */
function getConflictedFiles() {
  const output = execGit('diff --name-only --diff-filter=U');
  return output ? output.split('\n').filter(file => file.trim() !== '') : [];
}

/**
 * Gets all unmerged files (both with and without conflicts)
 */
function getUnmergedFiles() {
  const output = execGit('ls-files --unmerged');
  const files = new Set();
  
  if (output) {
    output.split('\n').forEach(line => {
      if (line.trim() !== '') {
        // Format: <mode> <object> <stage> <file>
        const parts = line.split(/\s+/);
        if (parts.length >= 4) {
          // The file path might contain spaces, so rejoin everything after the stage
          const file = parts.slice(3).join(' ');
          files.add(file);
        }
      }
    });
  }
  
  return Array.from(files);
}

/**
 * Check and show unmerged files with detail
 */
function checkUnmergedFiles() {
  const status = execGit('status --short');
  
  if (!status) {
    log.error('Failed to get Git status.');
    return false;
  }
  
  const unmergedPattern = /^(DD|AU|UD|UA|DU|AA|UU)\s+(.+)$/;
  const unmergedFiles = [];
  
  status.split('\n').forEach(line => {
    const match = line.match(unmergedPattern);
    if (match) {
      const [, state, file] = match;
      unmergedFiles.push({ file, state });
    }
  });
  
  if (unmergedFiles.length === 0) {
    log.info('No unmerged files found.');
    return false;
  }
  
  log.task(`Found ${unmergedFiles.length} unmerged files:`);
  
  unmergedFiles.forEach(({ file, state }) => {
    let stateDesc;
    
    switch (state) {
      case 'DD': stateDesc = 'both deleted'; break;
      case 'AU': stateDesc = 'added by us, modified by them'; break;
      case 'UD': stateDesc = 'modified by us, deleted by them'; break;
      case 'UA': stateDesc = 'modified by us, added by them'; break;
      case 'DU': stateDesc = 'deleted by us, modified by them'; break;
      case 'AA': stateDesc = 'added by both'; break;
      case 'UU': stateDesc = 'modified by both'; break;
      default: stateDesc = 'unknown state';
    }
    
    log.conflict(`${file} (${stateDesc})`);
  });
  
  return unmergedFiles;
}

/**
 * Fixes conflicts in a file by accepting one version
 */
function fixConflict(file, strategy) {
  try {
    log.task(`Resolving conflicts in ${file} using ${strategy} strategy...`);
    
    if (strategy === 'ours' || strategy === 'theirs') {
      execGit(`checkout --${strategy} -- "${file}"`);
      return true;
    }
    
    return false;
  } catch (error) {
    log.error(`Failed to resolve conflicts in ${file}: ${error.message}`);
    return false;
  }
}

/**
 * Completes the merge or rebase
 */
function completeMergeOrRebase() {
  try {
    if (isInMerge()) {
      log.task('Completing merge...');
      execGit('add .');
      execGit('commit --no-edit');
      log.success('Merge completed successfully!');
      return true;
    } else if (isInRebase()) {
      log.task('Continuing rebase...');
      execGit('add .');
      execGit('rebase --continue');
      log.success('Rebase step completed successfully!');
      return true;
    }
    
    log.warn('No active merge or rebase process found.');
    return false;
  } catch (error) {
    log.error(`Failed to complete merge/rebase: ${error.message}`);
    return false;
  }
}

/**
 * Aborts the current merge or rebase
 */
function abortMergeOrRebase() {
  try {
    if (isInMerge()) {
      log.task('Aborting merge...');
      execGit('merge --abort');
      log.success('Merge aborted successfully!');
      return true;
    } else if (isInRebase()) {
      log.task('Aborting rebase...');
      execGit('rebase --abort');
      log.success('Rebase aborted successfully!');
      return true;
    }
    
    log.warn('No active merge or rebase process found.');
    return false;
  } catch (error) {
    log.error(`Failed to abort merge/rebase: ${error.message}`);
    return false;
  }
}

/**
 * Shows the conflict markers in a file
 */
function showConflict(file) {
  try {
    if (!fs.existsSync(file)) {
      log.error(`File not found: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    let inConflict = false;
    let conflictLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('<<<<<<< ')) {
        inConflict = true;
        conflictLines = [`${colors.yellow}Line ${i+1}:${colors.reset} ${line}`];
      } else if (inConflict) {
        if (line.startsWith('=======')) {
          conflictLines.push(`${colors.yellow}Line ${i+1}:${colors.reset} ${line}`);
        } else if (line.startsWith('>>>>>>> ')) {
          inConflict = false;
          conflictLines.push(`${colors.yellow}Line ${i+1}:${colors.reset} ${line}`);
          
          // Display this conflict block
          console.log(colors.magenta + '='.repeat(80) + colors.reset);
          console.log(`Conflict in ${colors.cyan}${file}${colors.reset}:`);
          console.log(conflictLines.join('\n'));
          console.log(colors.magenta + '='.repeat(80) + colors.reset);
        } else {
          conflictLines.push(`${colors.reset}Line ${i+1}: ${line}`);
        }
      }
    }
  } catch (error) {
    log.error(`Failed to show conflicts in ${file}: ${error.message}`);
  }
}

/**
 * Main function to handle Git conflicts
 */
async function handleGitConflicts() {
  log.info('Git Conflict Resolution Tool');
  log.info('===========================');
  
  // Check if there's a merge or rebase in progress
  if (!isInMerge() && !isInRebase()) {
    log.error('No merge or rebase in progress. This tool is designed to help resolve merge conflicts.');
    process.exit(1);
  }
  
  // Check for unmerged files
  const unmergedFiles = checkUnmergedFiles();
  
  if (!unmergedFiles || unmergedFiles.length === 0) {
    log.info('No conflicts found. You can continue with the merge or rebase.');
    
    rl.question('Do you want to complete the merge/rebase now? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        completeMergeOrRebase();
      }
      rl.close();
    });
    
    return;
  }
  
  // Show main menu
  function showMainMenu() {
    console.log('\n=== Git Conflict Resolution Menu ===');
    console.log('1. Show details of a specific conflicted file');
    console.log('2. Resolve all conflicts by accepting our version (--ours)');
    console.log('3. Resolve all conflicts by accepting their version (--theirs)');
    console.log('4. Resolve conflicts file by file');
    console.log('5. Complete merge/rebase (after resolving conflicts)');
    console.log('6. Abort merge/rebase');
    console.log('7. Exit');
    
    rl.question('Select an option (1-7): ', (answer) => {
      switch (answer) {
        case '1':
          showFileMenu();
          break;
        case '2':
          resolveAllConflicts('ours');
          break;
        case '3':
          resolveAllConflicts('theirs');
          break;
        case '4':
          resolveFileByFile();
          break;
        case '5':
          completeMergeOrRebase();
          rl.close();
          break;
        case '6':
          abortMergeOrRebase();
          rl.close();
          break;
        case '7':
          log.info('Exiting...');
          rl.close();
          break;
        default:
          log.warn('Invalid option. Please try again.');
          showMainMenu();
      }
    });
  }
  
  // Show file selection menu
  function showFileMenu() {
    console.log('\n=== Select a file to view conflicts ===');
    
    unmergedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.file}`);
    });
    
    console.log(`${unmergedFiles.length + 1}. Back to main menu`);
    
    rl.question(`Select a file (1-${unmergedFiles.length + 1}): `, (answer) => {
      const index = parseInt(answer) - 1;
      
      if (index >= 0 && index < unmergedFiles.length) {
        showConflict(unmergedFiles[index].file);
        showFileMenu();
      } else if (index === unmergedFiles.length) {
        showMainMenu();
      } else {
        log.warn('Invalid option. Please try again.');
        showFileMenu();
      }
    });
  }
  
  // Resolve all conflicts using the same strategy
  function resolveAllConflicts(strategy) {
    log.task(`Resolving all conflicts using ${strategy} strategy...`);
    
    let resolved = 0;
    
    unmergedFiles.forEach(file => {
      if (fixConflict(file.file, strategy)) {
        resolved++;
      }
    });
    
    if (resolved > 0) {
      log.success(`Resolved ${resolved} files.`);
      execGit('add .');
      log.info('All resolved files have been staged.');
    }
    
    rl.question('Do you want to complete the merge/rebase now? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        completeMergeOrRebase();
        rl.close();
      } else {
        showMainMenu();
      }
    });
  }
  
  // Resolve conflicts file by file
  function resolveFileByFile(index = 0) {
    if (index >= unmergedFiles.length) {
      log.success('All files processed.');
      
      rl.question('Do you want to complete the merge/rebase now? (y/n) ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          completeMergeOrRebase();
          rl.close();
        } else {
          showMainMenu();
        }
      });
      
      return;
    }
    
    const file = unmergedFiles[index];
    
    showConflict(file.file);
    
    console.log('\n=== Resolve conflict options ===');
    console.log('1. Accept our version (--ours)');
    console.log('2. Accept their version (--theirs)');
    console.log('3. Skip this file (resolve manually later)');
    console.log('4. Back to main menu');
    
    rl.question('Select an option (1-4): ', (answer) => {
      let proceed = true;
      
      switch (answer) {
        case '1':
          fixConflict(file.file, 'ours');
          execGit(`add "${file.file}"`);
          break;
        case '2':
          fixConflict(file.file, 'theirs');
          execGit(`add "${file.file}"`);
          break;
        case '3':
          log.info(`Skipped ${file.file}. You'll need to resolve this manually.`);
          break;
        case '4':
          proceed = false;
          showMainMenu();
          break;
        default:
          log.warn('Invalid option. Please try again.');
          resolveFileByFile(index);
          return;
      }
      
      if (proceed) {
        resolveFileByFile(index + 1);
      }
    });
  }
  
  // Start the main menu
  showMainMenu();
}

// Start the script
handleGitConflicts();