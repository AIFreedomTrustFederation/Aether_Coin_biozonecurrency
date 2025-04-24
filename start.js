/**
 * Scroll Keeper Startup Script
 * 
 * This script starts both the main server and the port proxy to ensure
 * compatibility with Replit workflows.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start main server
const mainServer = spawn('node', [join(__dirname, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Wait a short time to ensure the main server has started
setTimeout(() => {
  // Start proxy server
  const proxyServer = spawn('node', [join(__dirname, 'port-proxy.js')], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Handle proxy server exit
  proxyServer.on('close', (code) => {
    console.log(`Proxy server exited with code ${code}`);
    // If proxy exits, kill main server too
    mainServer.kill();
    process.exit(code);
  });
}, 2000);

// Handle main server exit
mainServer.on('close', (code) => {
  console.log(`Main server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  mainServer.kill();
  process.exit(0);
});