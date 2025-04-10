/**
 * Aetherion Wallet Deployment Verification Tool
 * 
 * This script verifies the Aetherion Wallet deployment on atc.aifreedomtrust.com/dapp
 * by checking the health endpoint and testing various application features.
 * 
 * Usage:
 * node verify-deployment.js
 */

import fetch from 'node-fetch';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Promisify exec
const exec = promisify(execCallback);

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Configuration
const DEFAULT_DOMAIN = 'atc.aifreedomtrust.com';
const DEFAULT_PATH = '/dapp';

/**
 * Print banner
 */
function printBanner() {
  console.log(`${colors.blue}==============================================${colors.reset}`);
  console.log(`${colors.blue}    AETHERION WALLET DEPLOYMENT VERIFICATION  ${colors.reset}`);
  console.log(`${colors.blue}==============================================${colors.reset}`);
  console.log('');
}

/**
 * Parse arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    domain: DEFAULT_DOMAIN,
    path: DEFAULT_PATH,
    protocol: 'https',
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--domain' && args[i + 1]) {
      options.domain = args[i + 1];
      i++;
    } else if (args[i] === '--path' && args[i + 1]) {
      options.path = args[i + 1];
      i++;
    } else if (args[i] === '--http') {
      options.protocol = 'http';
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
    }
  }

  return options;
}

/**
 * Check health endpoint
 */
async function checkHealth(options) {
  const url = `${options.protocol}://${options.domain}${options.path}/health`;
  console.log(`${colors.cyan}Checking health endpoint: ${url}${colors.reset}`);
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✓ Health check successful!${colors.reset}`);
      console.log(`Status: ${data.status}`);
      console.log(`Timestamp: ${data.timestamp}`);
      console.log(`Version: ${data.version}`);
      console.log(`Environment: ${data.environment}`);
      console.log(`Deploy Target: ${data.deployTarget}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Health check failed with status ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Health check failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Check connectivity
 */
async function checkConnectivity(options) {
  console.log(`${colors.cyan}Checking connectivity to ${options.domain}...${colors.reset}`);
  
  try {
    const { stdout, stderr } = await exec(`ping -c 3 ${options.domain}`);
    if (options.verbose) {
      console.log(stdout);
    }
    console.log(`${colors.green}✓ Server is reachable${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Server is not reachable: ${error.message}${colors.reset}`);
    if (options.verbose && error.stdout) {
      console.log(error.stdout);
    }
    return false;
  }
}

/**
 * Check homepage
 */
async function checkHomepage(options) {
  const url = `${options.protocol}://${options.domain}${options.path}`;
  console.log(`${colors.cyan}Checking homepage: ${url}${colors.reset}`);
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const html = await response.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Unknown';
      
      console.log(`${colors.green}✓ Homepage loaded successfully${colors.reset}`);
      console.log(`Title: ${title}`);
      
      // Check for key app elements
      const hasReactRoot = html.includes('id="root"');
      const hasAppJs = html.includes('src="/assets/index-');
      const hasCss = html.includes('href="/assets/index-');
      
      if (hasReactRoot && hasAppJs && hasCss) {
        console.log(`${colors.green}✓ Homepage contains required application elements${colors.reset}`);
        return true;
      } else {
        console.log(`${colors.yellow}⚠ Homepage may be missing some application elements${colors.reset}`);
        return true; // Still return true as the page loaded
      }
    } else {
      console.log(`${colors.red}✗ Homepage check failed with status ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Homepage check failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Check server headers
 */
async function checkHeaders(options) {
  const url = `${options.protocol}://${options.domain}${options.path}`;
  console.log(`${colors.cyan}Checking HTTP headers: ${url}${colors.reset}`);
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      console.log(`${colors.green}✓ Server responded with ${response.status} ${response.statusText}${colors.reset}`);
      
      // Log headers
      if (options.verbose) {
        console.log('Headers:');
        response.headers.forEach((value, name) => {
          console.log(`  ${name}: ${value}`);
        });
      }
      
      // Check for security headers
      const securityHeaders = [
        'strict-transport-security',
        'x-content-type-options',
        'x-frame-options'
      ];
      
      const missingHeaders = securityHeaders.filter(header => !response.headers.has(header));
      
      if (missingHeaders.length === 0) {
        console.log(`${colors.green}✓ All recommended security headers are present${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Missing recommended security headers: ${missingHeaders.join(', ')}${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}✗ Headers check failed with status ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Headers check failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  printBanner();
  
  // Parse command line arguments
  const options = parseArgs();
  console.log(`Verifying deployment at: ${options.protocol}://${options.domain}${options.path}`);
  console.log('');
  
  // Run checks
  const checks = [
    { name: 'Connectivity', fn: checkConnectivity },
    { name: 'Health Endpoint', fn: checkHealth },
    { name: 'Homepage', fn: checkHomepage },
    { name: 'HTTP Headers', fn: checkHeaders }
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const check of checks) {
    console.log(`${colors.blue}[${check.name}]${colors.reset}`);
    const success = await check.fn(options);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Add spacing between checks
  }
  
  // Final summary
  console.log(`${colors.blue}==============================================${colors.reset}`);
  console.log(`${colors.blue}    VERIFICATION SUMMARY                     ${colors.reset}`);
  console.log(`${colors.blue}==============================================${colors.reset}`);
  console.log('');
  
  console.log(`Total checks: ${checks.length}`);
  console.log(`${colors.green}Successful: ${successCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);
  
  if (failCount === 0) {
    console.log('');
    console.log(`${colors.green}✓ Deployment verification PASSED! The application is deployed correctly.${colors.reset}`);
    process.exit(0);
  } else {
    console.log('');
    console.log(`${colors.red}✗ Deployment verification FAILED! Please check the logs above for details.${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});