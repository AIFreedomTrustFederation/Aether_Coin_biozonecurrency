#!/usr/bin/env node
/**
 * Pre-commit hook to prevent committing files with API keys
 * 
 * To install:
 * 1. Make this file executable: chmod +x scripts/pre-commit-hook.js
 * 2. Create a symlink: ln -s ../../scripts/pre-commit-hook.js .git/hooks/pre-commit
 * 
 * For Windows:
 * 1. Create a file .git/hooks/pre-commit.bat with:
 *    @echo off
 *    node scripts/pre-commit-hook.js %*
 *    if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patterns that might indicate API keys
const API_KEY_PATTERNS = [
  /(['"`])?(sk|pk|api|key|token|secret)-[A-Za-z0-9]{10,}(['"`])?/i,
  /(['"`])?[A-Za-z0-9_-]{20,}\.?[A-Za-z0-9_-]{20,}\.?[A-Za-z0-9_-]{20,}(['"`])?/,
  /(['"`])?[A-Za-z0-9]{32,}(['"`])?/,
  /BRAINTRUST_API_KEY\s*=\s*(['"`])[^'"`\s]{8,}(['"`])/i,
  /MISTRAL_API_KEY\s*=\s*(['"`])[^'"`\s]{8,}(['"`])/i,
];

// Files to ignore (already committed or not sensitive)
const IGNORED_FILES = [
  '.git',
  'node_modules',
  'package-lock.json',
  'yarn.lock',
  'dist',
  'build',
  '.env.example',
  'pre-commit-hook.js',
];

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM').toString();
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    process.exit(1);
  }
}

// Check if a file should be ignored
function shouldIgnoreFile(filePath) {
  return IGNORED_FILES.some(ignored => filePath.includes(ignored));
}

// Check a file for API keys
function checkFileForApiKeys(filePath) {
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let foundApiKey = false;
    
    lines.forEach((line, index) => {
      API_KEY_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          console.error(`\x1b[31mPossible API key found in ${filePath}:${index + 1}\x1b[0m`);
          console.error(`\x1b[33m${line}\x1b[0m`);
          foundApiKey = true;
        }
      });
    });
    
    return foundApiKey;
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  const stagedFiles = getStagedFiles();
  let foundApiKeys = false;
  
  stagedFiles.forEach(file => {
    if (!shouldIgnoreFile(file) && checkFileForApiKeys(file)) {
      foundApiKeys = true;
    }
  });
  
  if (foundApiKeys) {
    console.error('\x1b[31m');
    console.error('===============================================');
    console.error('🚨 COMMIT BLOCKED: Possible API keys detected 🚨');
    console.error('===============================================');
    console.error('\x1b[0m');
    console.error('Please remove API keys from the files listed above and try again.');
    console.error('If these are not actual API keys, you can bypass this check with:');
    console.error('  git commit --no-verify');
    console.error('\x1b[33mBut please be VERY careful when bypassing this check!\x1b[0m');
    process.exit(1);
  }
  
  console.log('\x1b[32mNo API keys detected in staged files. Proceeding with commit.\x1b[0m');
  process.exit(0);
}

main();