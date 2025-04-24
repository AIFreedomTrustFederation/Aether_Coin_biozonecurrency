/**
 * Combined Startup Script for Aetherion Application
 * 
 * This script runs:
 * 1. The Vite development server (client)
 * 2. The server-proxy.js (to route traffic from 5000 to 5173)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Aetherion Development Servers');

// Start Vite dev server
const viteProcess = spawn('npx', ['vite'], {
  stdio: 'pipe',
  shell: true,
  cwd: __dirname
});

console.log('📦 Started Vite development server');

// Set up output handling for Vite
viteProcess.stdout.on('data', (data) => {
  console.log(`[VITE] ${data.toString().trim()}`);
});

viteProcess.stderr.on('data', (data) => {
  console.error(`[VITE ERROR] ${data.toString().trim()}`);
});

// Give Vite a moment to start before launching the proxy
setTimeout(() => {
  console.log('🔄 Starting server proxy...');
  
  // Start the server proxy
  const proxyProcess = spawn('node', ['server-proxy.js'], {
    stdio: 'pipe',
    shell: true,
    cwd: __dirname
  });
  
  // Set up output handling for the proxy
  proxyProcess.stdout.on('data', (data) => {
    console.log(`[PROXY] ${data.toString().trim()}`);
  });
  
  proxyProcess.stderr.on('data', (data) => {
    console.error(`[PROXY ERROR] ${data.toString().trim()}`);
  });
  
  // Handle if the proxy crashes
  proxyProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`[PROXY] Process exited with code ${code}`);
    }
  });
  
  console.log('✅ Development environment setup complete');
  console.log('📝 The application will be available at:');
  console.log('   - http://localhost:5000 (via proxy)');
  console.log('   - http://localhost:5173 (direct Vite)');
  
}, 2000); // Wait 2 seconds before starting the proxy

// Handle if Vite crashes
viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`[VITE] Process exited with code ${code}`);
  }
});

// Properly handle termination
process.on('SIGINT', () => {
  console.log('📥 Shutting down all processes...');
  viteProcess.kill();
  process.exit(0);
});