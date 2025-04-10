/**
 * Aetherion Wallet Deployment Verification Tool
 * 
 * This script verifies the Aetherion Wallet deployment on atc.aifreedomtrust.com/dapp
 * by checking the health endpoint and testing various application features.
 * 
 * Usage:
 * node verify-deployment.js
 */

const https = require('https');
const { URL } = require('url');
require('dotenv').config();

/**
 * Print banner
 */
function printBanner() {
  console.log('===========================================================');
  console.log('   Aetherion Wallet Deployment Verification Tool');
  console.log('===========================================================');
  console.log();
}

/**
 * Parse arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: process.env.VERIFY_URL || 'https://atc.aifreedomtrust.com/dapp',
    timeout: parseInt(process.env.VERIFY_TIMEOUT || '10000', 10),
    verbose: args.includes('--verbose') || args.includes('-v'),
    skipSsl: args.includes('--skip-ssl'),
  };
  
  const urlArg = args.find(arg => arg.startsWith('http'));
  if (urlArg) {
    options.url = urlArg;
  }
  
  return options;
}

/**
 * Check health endpoint
 */
async function checkHealth(options) {
  console.log(`Checking health endpoint at ${options.url}/health`);
  
  try {
    const healthUrl = `${options.url}/health`;
    const response = await makeRequest(healthUrl, options);
    
    if (response.statusCode === 200) {
      console.log('✅ Health endpoint accessible');
      
      try {
        const data = JSON.parse(response.body);
        console.log(`Health status: ${data.status}`);
        
        if (data.status === 'ok') {
          console.log('✅ Application is healthy');
          
          if (data.version) {
            console.log(`Application version: ${data.version}`);
          }
          
          if (data.environment) {
            console.log(`Environment: ${data.environment}`);
          }
          
          if (data.uptime) {
            console.log(`Uptime: ${data.uptime} seconds`);
          }
          
          return true;
        } else {
          console.log('❌ Application reports unhealthy status');
          if (data.message) {
            console.log(`Error message: ${data.message}`);
          }
          return false;
        }
      } catch (error) {
        console.log('❌ Failed to parse health response');
        console.log(`Response: ${response.body}`);
        return false;
      }
    } else {
      console.log(`❌ Health endpoint returned status code ${response.statusCode}`);
      console.log(`Response: ${response.body}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to access health endpoint: ${error.message}`);
    return false;
  }
}

/**
 * Check connectivity
 */
async function checkConnectivity(options) {
  console.log(`\nChecking basic connectivity to ${options.url}`);
  
  try {
    const response = await makeRequest(options.url, options);
    
    if (response.statusCode === 200) {
      console.log('✅ Application is accessible');
      return true;
    } else {
      console.log(`❌ Application returned status code ${response.statusCode}`);
      if (options.verbose) {
        console.log(`Response: ${response.body.substring(0, 500)}...`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to access application: ${error.message}`);
    return false;
  }
}

/**
 * Check homepage
 */
async function checkHomepage(options) {
  console.log(`\nVerifying homepage content at ${options.url}`);
  
  try {
    const response = await makeRequest(options.url, options);
    
    if (response.statusCode === 200) {
      // Check for expected content markers in the response
      const markers = [
        'Aetherion',
        'wallet',
        'blockchain',
        '<div id="root">'
      ];
      
      let allMarkersFound = true;
      markers.forEach(marker => {
        if (response.body.includes(marker)) {
          if (options.verbose) {
            console.log(`✅ Found marker: "${marker}"`);
          }
        } else {
          console.log(`❌ Missing expected content: "${marker}"`);
          allMarkersFound = false;
        }
      });
      
      if (allMarkersFound) {
        console.log('✅ Homepage contains expected content');
        return true;
      } else {
        console.log('❌ Homepage is missing expected content');
        if (options.verbose) {
          console.log(`First 500 chars of response: ${response.body.substring(0, 500)}...`);
        }
        return false;
      }
    } else {
      console.log(`❌ Homepage returned status code ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to access homepage: ${error.message}`);
    return false;
  }
}

/**
 * Check server headers
 */
async function checkHeaders(options) {
  console.log(`\nChecking server security headers at ${options.url}`);
  
  try {
    const response = await makeRequest(options.url, options, true);
    
    if (response.statusCode === 200) {
      const headers = response.headers;
      const securityHeaders = {
        'Strict-Transport-Security': headers['strict-transport-security'],
        'X-Content-Type-Options': headers['x-content-type-options'],
        'X-Frame-Options': headers['x-frame-options'],
        'Content-Security-Policy': headers['content-security-policy'],
        'X-XSS-Protection': headers['x-xss-protection'],
      };
      
      console.log('Server headers:');
      for (const [header, value] of Object.entries(securityHeaders)) {
        if (value) {
          console.log(`✅ ${header}: ${value}`);
        } else {
          console.log(`⚠️ Missing security header: ${header}`);
        }
      }
      
      return true;
    } else {
      console.log(`❌ Server returned status code ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to check headers: ${error.message}`);
    return false;
  }
}

/**
 * Make HTTPS request
 */
function makeRequest(url, options, headersOnly = false) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: options.timeout,
      headers: {
        'User-Agent': 'Aetherion-Deployment-Verification-Tool/1.0',
      },
      rejectUnauthorized: !options.skipSsl,
    };
    
    const req = https.request(reqOptions, (res) => {
      if (headersOnly) {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: '',
        });
        return;
      }
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${options.timeout}ms`));
    });
    
    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  printBanner();
  
  const options = parseArgs();
  console.log(`Target URL: ${options.url}`);
  console.log(`Timeout: ${options.timeout}ms`);
  console.log();
  
  // Run checks
  const results = {};
  
  results.connectivity = await checkConnectivity(options);
  results.health = await checkHealth(options);
  results.homepage = await checkHomepage(options);
  results.headers = await checkHeaders(options);
  
  // Summary
  console.log('\n===========================================================');
  console.log('                   Verification Summary                   ');
  console.log('===========================================================');
  
  for (const [check, passed] of Object.entries(results)) {
    console.log(`${passed ? '✅' : '❌'} ${check.charAt(0).toUpperCase() + check.slice(1)}`);
  }
  
  const allPassed = Object.values(results).every(Boolean);
  
  console.log('\nVerification ' + (allPassed ? '✅ PASSED' : '❌ FAILED'));
  
  if (!allPassed) {
    console.log('\nTroubleshooting tips:');
    console.log('- Check if the server is running');
    console.log('- Verify that the deployment completed successfully');
    console.log('- Check server logs for errors');
    console.log('- Ensure the domain is correctly configured');
    console.log('- Verify that the health endpoint is implemented correctly');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});