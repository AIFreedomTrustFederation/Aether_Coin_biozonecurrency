/**
 * Local Development Starter for AI Freedom Trust Brand Showcase
 * This script starts both the API server and React frontend concurrently
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting AI Freedom Trust Brand Showcase in local development mode');

// Start the API server
const apiServer = spawn('node', ['server-local.js'], {
  stdio: 'inherit',
  shell: true
});

// Start the React frontend
const clientDir = path.join(__dirname, 'client');
const reactApp = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: clientDir
});

console.log(`
✨ Development servers started:
   - API Server: http://localhost:5000
   - React App:  http://localhost:5173
   
   Press Ctrl+C to stop both servers
`);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  apiServer.kill();
  reactApp.kill();
  process.exit();
});