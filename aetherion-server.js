/**
 * Aetherion Wallet Server v1.0.0
 * 
 * This server is dedicated to serving the full Aetherion Wallet application
 * and not just the CodeStar Platform component.
 */

import express from 'express';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = process.env.PORT || 5000;
const VITE_PORT = 5176; // Changed to avoid conflicts with other servers
const TARGET_URL = `http://localhost:${VITE_PORT}`;

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors());

// Log requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

console.log('Starting Aetherion Wallet v1.0.0 Server');
console.log(`Main server on port ${PORT} proxying to Vite on port ${VITE_PORT}`);

// Start the Vite server in the aetherion-wallet-v1.0.0 directory
const viteProcess = spawn('npx', ['vite', '--host'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, 'aetherion-wallet-v1.0.0')
});

// Create proxy middleware for the Vite dev server
const viteProxy = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'error'
});

// Define which paths should go to Vite HMR
app.use(['/@vite/client', '/@vite/hmr', '/vite-hmr', '/__vite_ping'], (req, res, next) => {
  viteProxy(req, res, next);
});

// All routes should go to the Aetherion Wallet app
app.use('/', viteProxy);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteProcess.kill();
  process.exit();
});

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Aetherion Wallet v1.0.0 running on port ${PORT}`);
  console.log(`✓ Vite dev server running on port ${VITE_PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
  }
});