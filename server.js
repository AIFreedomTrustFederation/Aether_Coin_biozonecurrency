/**
 * Combined Aetherion Server (Enhanced)
 * Serves both the Aetherion Wallet v1.0.0 and Brand Showcase applications
 * Uses a modular API approach with routes-simple.js
 */

import express from 'express';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import pg from 'pg';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = process.env.PORT || 5000; 
const SHOWCASE_VITE_PORT = 5173;
const WALLET_VITE_PORT = 5174;
const SHOWCASE_TARGET_URL = `http://localhost:${SHOWCASE_VITE_PORT}`;
const WALLET_TARGET_URL = `http://localhost:${WALLET_VITE_PORT}`;

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors());

// Serve static files from 'public' directory and client/public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/public')));
app.use('/wallet', express.static(path.join(__dirname, 'aetherion-wallet-v1.0.0', 'client/src/assets')));

console.log(`Starting Aetherion Server`);
console.log(`Main server on port ${PORT} proxying to multiple Vite instances`);
console.log(`- Brand Showcase Vite on port ${SHOWCASE_VITE_PORT}`);
console.log(`- Aetherion Wallet Vite on port ${WALLET_VITE_PORT}`);

// Create WebSocket server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', function connection(ws) {
  console.log('Client connected to WebSocket');
  
  ws.on('message', function incoming(message) {
    console.log('Received message:', message.toString());
    
    // Simple WebSocket echo server for now
    if (message.toString() === 'subscribe') {
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Scroll Keeper WebSocket Server'
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Add database status endpoint
app.get('/api/db/status', async (req, res) => {
  const dbStatus = {
    connected: false,
    message: '',
    timestamp: new Date().toISOString()
  };
  
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      dbStatus.message = 'DATABASE_URL environment variable not set';
      return res.json(dbStatus);
    }
    
    // Simple query to test the connection
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000
    });
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW() as time');
      dbStatus.connected = true;
      dbStatus.message = `Connected successfully. Server time: ${result.rows[0].time}`;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    dbStatus.message = `Connection error: ${err.message}`;
  }
  
  res.json(dbStatus);
});

// Import our API modules from the unified api-modules.js
import { registerApiModules } from './api-modules.js';

// Register our API modules
(async () => {
  try {
    await registerApiModules(app);
  } catch (error) {
    console.error('Error registering API modules:', error);
  }
})();

// Serve static HTML landing page for /test path
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'codestar-landing.html'));
});

// Serve our enhanced landing page
app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Serve our app showcase page
app.get('/showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'app-showcase.html'));
});

// Serve our brand ecosystem showcase page
app.get('/brands-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/brand-showcase.html'));
});

// Additional route specifically for the Aetherion quantum-secure iframe integration
app.get('/brand-ecosystem-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/brand-showcase.html'));
});

// Special route for feedback tool testing - simplified page that loads quickly
app.get('/feedback-check', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/feedback-check.html'));
});

// Standalone brand showcase HTML page (no React dependencies, loads directly)
app.get('/standalone-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'standalone-brand-showcase.html'));
});

// Absolute minimal test page - for basic connectivity testing
app.get('/pure-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'pure-test.html'));
});

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Start the Showcase Vite server
const showcaseViteProcess = spawn('npx', ['vite', '--host', '--port', SHOWCASE_VITE_PORT], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname)
});

// Start the Wallet Vite server
const walletViteProcess = spawn('npx', ['vite', 'serve', '--host', '--port', WALLET_VITE_PORT], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, 'aetherion-wallet-v1.0.0'),
  env: {
    ...process.env,
    PORT: WALLET_VITE_PORT
  }
});

// Create proxy middleware for the Brand Showcase Vite server
const showcaseViteProxy = createProxyMiddleware({
  target: SHOWCASE_TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'error'
});

// Create proxy middleware for the Wallet Vite server
const walletViteProxy = createProxyMiddleware({
  target: WALLET_TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'error',
  pathRewrite: {
    '^/wallet': '/'  // Remove /wallet prefix when forwarding to the wallet Vite server
  }
});

// Define which paths should go to the API vs. the frontend
app.use(['/@vite/client', '/@vite/hmr', '/vite-hmr', '/__vite_ping'], (req, res, next) => {
  // Direct HMR requests to the appropriate Vite server based on the path
  if (req.path.startsWith('/wallet')) {
    walletViteProxy(req, res, next);
  } else {
    showcaseViteProxy(req, res, next);
  }
});

// Redirect root URL to the brand showcase
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to access the wallet
app.get('/wallet', (req, res, next) => {
  // Pass to Wallet Vite to serve the full Aetherion Wallet
  walletViteProxy(req, res, next);
});

// Route for brand showcase
app.get('/brands', (req, res, next) => {
  // Pass to Showcase Vite
  showcaseViteProxy(req, res, next);
});

// All other frontend routes go to the appropriate Vite server
app.use('/', (req, res, next) => {
  // Don't proxy API requests
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Route to Wallet or Showcase based on path
  if (req.path.startsWith('/wallet')) {
    walletViteProxy(req, res, next);
  } else {
    showcaseViteProxy(req, res, next);
  }
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  showcaseViteProcess.kill();
  walletViteProcess.kill();
  process.exit();
});

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Aetherion integrated server running on port ${PORT}`);
  console.log(`✓ AETHERION WALLET V1.0.0 available at http://localhost:${PORT}/wallet`);
  console.log(`✓ Root URL redirects to Aetherion Wallet at http://localhost:${PORT}/`);
  console.log(`✓ Test page available at http://localhost:${PORT}/test`);
  console.log(`✓ Simple test page available at http://localhost:${PORT}/test.html`);
  console.log(`✓ App showcase available at http://localhost:${PORT}/showcase`);
  console.log(`✓ Brand ecosystem showcase available at http://localhost:${PORT}/brands-showcase`); 
  console.log(`✓ Standalone brand showcase available at http://localhost:${PORT}/standalone-showcase`);
  console.log(`✓ Pure test page available at http://localhost:${PORT}/pure-test`);
  console.log(`✓ Feedback check page available at http://localhost:${PORT}/feedback-check`);
  console.log(`✓ WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`✓ Brand Showcase Vite server running on port ${SHOWCASE_VITE_PORT}`);
  console.log(`✓ Aetherion Wallet Vite server running on port ${WALLET_VITE_PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
    console.log(`✓ AETHERION WALLET V1.0.0 on Replit: ${replitUrl}/wallet`);
    console.log(`✓ Root URL redirects to Wallet: ${replitUrl}/`);
    console.log(`✓ Test HTML page on Replit: ${replitUrl}/test.html`);
    console.log(`✓ Brand ecosystem showcase on Replit: ${replitUrl}/brands-showcase`);
    console.log(`✓ Standalone brand showcase on Replit: ${replitUrl}/standalone-showcase`);
    console.log(`✓ Feedback check page on Replit: ${replitUrl}/feedback-check`);
    console.log(`✓ API health endpoint: ${replitUrl}/api/health`);
  }
});