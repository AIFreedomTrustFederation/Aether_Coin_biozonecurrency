/**
 * Ultra-simplified Server for Aetherion
 * Minimizes complexity to ensure stability on Replit
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';

// Basic setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5000;
const VITE_PORT = 5173;
const VITE_URL = `http://localhost:${VITE_PORT}`;

console.log('Starting ultra-simplified Aetherion server');

// Start Vite in development mode
const viteProcess = spawn('npx', ['vite', '--port', VITE_PORT, '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

// Set up proxy middleware
const proxy = createProxyMiddleware({
  target: VITE_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'silent'
});

// Use the proxy for all requests
app.use('/', proxy);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Proxying to Vite at ${VITE_URL}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  viteProcess.kill();
  process.exit();
});