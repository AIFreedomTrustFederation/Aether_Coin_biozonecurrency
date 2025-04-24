/**
 * Scroll Keeper Custom Run Script
 * 
 * This script starts both the main server on port 3000 and a proxy on port 5000.
 * It's designed to work around port conflicts in the Replit environment.
 */

// Import the server directly instead of spawning processes
import './server.js';

// After importing the server, wait a moment then start the proxy
setTimeout(() => {
  console.log('Starting proxy server...');
  import('./port-proxy.js');
}, 3000);