/**
 * Startup script for the Aether_Coin React application
 * 
 * This script:
 * 1. Starts the Vite development server (in development mode)
 * 2. Starts our proxy server that ensures proper routing
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Starting Aether_Coin React application...');

// Start Vite dev server (in development mode)
const viteServer = spawn('npx', ['vite'], {
  stdio: 'pipe',
  shell: true,
  cwd: __dirname
});

// Start our proxy server
const proxyServer = spawn('node', ['aether-react-server.js'], {
  stdio: 'pipe',
  shell: true,
  cwd: __dirname
});

// Handle output from the Vite server
viteServer.stdout.on('data', (data) => {
  console.log(`[Vite] ${data.toString().trim()}`);
});

viteServer.stderr.on('data', (data) => {
  console.error(`[Vite Error] ${data.toString().trim()}`);
});

// Handle output from the proxy server
proxyServer.stdout.on('data', (data) => {
  console.log(`[Proxy] ${data.toString().trim()}`);
});

proxyServer.stderr.on('data', (data) => {
  console.error(`[Proxy Error] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteServer.kill();
  proxyServer.kill();
  process.exit(0);
});

// Log startup message
console.log('🚀 Starting development servers...');
console.log('📝 The application will be available at:');
console.log('   - http://localhost:5000');