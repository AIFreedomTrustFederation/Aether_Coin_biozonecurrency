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

import { execFileSync } from 'child_process';

// Patterns that might indicate API keys
const API_KEY_PATTERNS = [
  /(['"`])?(sk|pk|rk)-[A-Za-z0-9]{20,}(['"`])?/i,
  /(api[_-]?key|apikey|api[_-]?secret|access[_-]?token|auth[_-]?token|private[_-]?key|secret)\s*[:=]\s*(['"`])[^'"`\s]{8,}(['"`])/i,
  /(['"`])?[A-Za-z0-9_-]{20,}\.?[A-Za-z0-9_-]{20,}\.?[A-Za-z0-9_-]{20,}(['"`])?/,
  /(['"`])?[A-Za-z0-9]{32,}(['"`])?/,
  /BRAINTRUST_API_KEY\s*=\s*(['"`])[^'"`\s]{8,}(['"`])/i,
  /MISTRAL_API_KEY\s*=\s*(['"`])[^'"`\s]{8,}(['"`])/i,
];

// The pre-commit hook checks staged changes; QA checks every tracked index entry.
function getStagedFiles(scanTracked = false) {
  try {
    const gitArgs = scanTracked
      ? ['ls-files', '--cached', '-z']
      : ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'];
    const output = execFileSync('git', gitArgs, { encoding: 'utf8' });
    return output.split('\0').filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    process.exit(1);
  }
}

// Check if a file should be ignored
function shouldIgnoreFile(filePath) {
  const parts = filePath.split('/');
  return parts.some(part => ['.git', 'node_modules', 'dist', 'build'].includes(part)) ||
    ['package-lock.json', 'yarn.lock', '.env.example'].includes(parts.at(-1)) ||
    filePath === 'scripts/pre-commit-hook.js';
}

// Check a file for API keys
function checkFileForApiKeys(filePath) {
  try {
    // Read the exact bytes in the Git index, not potentially different working-tree bytes.
    const content = execFileSync('git', ['show', `:${filePath}`], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    const lines = content.split('\n');
    let foundApiKey = false;
    
    lines.forEach((line, index) => {
      API_KEY_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          console.error(`\x1b[31mPossible API key found in ${filePath}:${index + 1}\x1b[0m`);
          // Never print the matching line: it may contain a live credential.
          console.error(`\x1b[33mPattern ${API_KEY_PATTERNS.indexOf(pattern) + 1} matched.\x1b[0m`);
          foundApiKey = true;
        }
      });
    });
    
    return foundApiKey;
  } catch (error) {
    console.error(`Error checking staged file ${JSON.stringify(filePath)}:`, error.message);
    throw error;
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--tracked')) {
    console.error('Usage: node scripts/pre-commit-hook.js [--tracked]');
    process.exit(2);
  }
  const scanTracked = args[0] === '--tracked';
  const stagedFiles = getStagedFiles(scanTracked);
  let foundApiKeys = false;
  
  let scanFailed = false;
  for (const file of stagedFiles) {
    if (shouldIgnoreFile(file)) continue;
    try {
      if (checkFileForApiKeys(file)) foundApiKeys = true;
    } catch {
      scanFailed = true;
    }
  }

  if (scanFailed) {
    console.error('COMMIT BLOCKED: One or more staged files could not be inspected.');
    process.exit(1);
  }
  
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
  
  console.log(`\x1b[32mNo API keys detected in ${scanTracked ? 'tracked' : 'staged'} index files.\x1b[0m`);
  process.exit(0);
}

main();
