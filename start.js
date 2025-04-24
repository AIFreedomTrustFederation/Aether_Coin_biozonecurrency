/**
 * Scroll Keeper Startup Script
 * 
 * This script starts both the main server and the port redirector to ensure
 * compatibility with Replit workflows.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the main server and redirector
const serverPath = path.join(__dirname, 'server.js');
const redirectorPath = path.join(__dirname, 'port-redirector.js');

console.log('Starting Scroll Keeper services...');

// Start the main server
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error(`Failed to start main server: ${error.message}`);
  process.exit(1);
});

// Give the main server a moment to start
setTimeout(() => {
  // Start the redirector
  const redirectorProcess = spawn('node', [redirectorPath], {
    stdio: 'inherit'
  });
  
  redirectorProcess.on('error', (error) => {
    console.error(`Failed to start redirector: ${error.message}`);
    // Don't exit, as the main server is still running
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down Scroll Keeper services...');
    redirectorProcess.kill();
    serverProcess.kill();
    process.exit();
  });
}, 2000);