/**
 * Combined Aetherion Server
 * Serves both the Aetherion Wallet v1.0.0 and Brand Showcase applications
 * as well as a third application if needed
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

// Server configuration for each application
const MAIN_PORT = process.env.PORT || 5000;
const BRAND_SHOWCASE_PORT = 5173;
const WALLET_PORT = 5174;
const THIRD_APP_PORT = 5175; // For a third application
const WALLET_VITE_PORT = 5176; // Vite port for wallet application

// Target URLs for proxying
const BRAND_SHOWCASE_URL = `http://localhost:${BRAND_SHOWCASE_PORT}`;
const WALLET_URL = `http://localhost:${WALLET_PORT}`;
const THIRD_APP_URL = `http://localhost:${THIRD_APP_PORT}`;
const WALLET_VITE_URL = `http://localhost:${WALLET_VITE_PORT}`;

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors());

// Serve static files from various directories
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/public')));
app.use('/wallet', express.static(path.join(__dirname, 'aetherion-wallet-v1.0.0', 'client/src/assets')));

console.log(`Starting Combined Aetherion Ecosystem Server`);
console.log(`Main server on port ${MAIN_PORT} proxying to multiple Vite instances`);
console.log(`- Brand Showcase on port ${BRAND_SHOWCASE_PORT}`);
console.log(`- Aetherion Wallet on port ${WALLET_PORT}`);
console.log(`- Third Application on port ${THIRD_APP_PORT}`);

// Create WebSocket server for real-time communication
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', function connection(ws) {
  console.log('Client connected to WebSocket');
  
  ws.on('message', function incoming(message) {
    console.log('Received message:', message.toString());
    
    // Simple WebSocket echo server for now
    if (message.toString() === 'subscribe') {
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Aetherion Ecosystem WebSocket Server'
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

// Import our API modules
import { registerApiModules } from './api-modules.js';

// Register API modules
(async () => {
  try {
    await registerApiModules(app);
  } catch (error) {
    console.error('Error registering API modules:', error);
  }
})();

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// START ALL PROCESSES ASYNCHRONOUSLY

// 1. Start the Brand Showcase Vite server
const brandShowcaseProcess = spawn('npx', ['vite', '--host', '--port', BRAND_SHOWCASE_PORT], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname)
});

// 2. Start the dedicated Aetherion Wallet server (using the existing aetherion-server.js)
const walletProcess = spawn('node', ['aetherion-server.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname),
  env: {
    ...process.env,
    PORT: WALLET_PORT,
    VITE_PORT: WALLET_VITE_PORT,
    NODE_ENV: 'production',
    AETHERION_FULL_SYSTEM: 'true'
  }
});

// 3. Start a third application using our separate server file
console.log(`Starting third app on port ${THIRD_APP_PORT} (Simple Express Server)`);
const thirdAppProcess = spawn('node', ['third-app-server.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: THIRD_APP_PORT
  }
});

// CREATE PROXY MIDDLEWARE FOR EACH APPLICATION

// Brand Showcase proxy
const brandShowcaseProxy = createProxyMiddleware({
  target: BRAND_SHOWCASE_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'error'
});

// Aetherion Wallet proxy - Enhanced configuration with proper headers and path preservation
const walletProxy = createProxyMiddleware({
  target: WALLET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'error',
  pathRewrite: {
    '^/wallet': '/'  // Remove /wallet prefix when forwarding to the wallet server
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add custom headers to help the wallet server identify the request
    proxyReq.setHeader('X-Proxied-By', 'AetherionCombinedServer');
    proxyReq.setHeader('X-Original-Path', req.originalUrl);
    
    // Log proxy requests for debugging
    console.log(`Proxying wallet request: ${req.method} ${req.url} -> ${WALLET_URL}${req.url.replace(/^\/wallet/, '/')}`);
  }
});

// Third application proxy (for future use)
const thirdAppProxy = createProxyMiddleware({
  target: THIRD_APP_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'error',
  pathRewrite: {
    '^/app3': '/'  // Remove /app3 prefix when forwarding
  }
});

// ROUTING CONFIGURATION

// Set up API routes with enhanced monitoring
app.get('/api/health', async (req, res) => {
  // Get status of each individual service
  let walletStatus = 'unknown';
  let brandShowcaseStatus = 'unknown';
  let thirdAppStatus = 'unknown';
  
  try {
    // Check wallet server
    const walletCheck = await fetch(`${WALLET_URL}/api/health`, { 
      method: 'GET',
      headers: { 'X-Status-Check': 'true' }
    }).then(r => r.ok ? 'running' : 'error').catch(() => 'unreachable');
    walletStatus = walletCheck;
    
    // We could do the same for other services if they have health endpoints
    brandShowcaseStatus = 'running'; // Assuming it's running
    thirdAppStatus = 'running';      // Assuming it's running
  } catch (error) {
    console.error('Error checking service status:', error);
  }
  
  res.json({
    status: 'online',
    services: {
      main: 'running',
      brandShowcase: brandShowcaseStatus,
      wallet: walletStatus,
      thirdApp: thirdAppStatus
    },
    serverInfo: {
      node: process.version,
      platform: process.platform,
      memory: process.memoryUsage()
    },
    timestamp: new Date().toISOString()
  });
});

// Handle HMR requests for all applications
app.use(['/@vite/client', '/@vite/hmr', '/vite-hmr', '/__vite_ping'], (req, res, next) => {
  if (req.path.startsWith('/wallet')) {
    walletProxy(req, res, next);
  } else if (req.path.startsWith('/app3')) {
    thirdAppProxy(req, res, next);
  } else {
    brandShowcaseProxy(req, res, next);
  }
});

// Main landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Aetherion Wallet route - enhanced with better handling
app.use('/wallet', (req, res, next) => {
  console.log(`Wallet request received: ${req.method} ${req.originalUrl}`);
  // Forward all wallet requests to the dedicated wallet server
  walletProxy(req, res, next);
});

// Brand Showcase route
app.get('/brands', (req, res, next) => {
  brandShowcaseProxy(req, res, next);
});

// Third application route (placeholder for future)
app.get('/app3', (req, res, next) => {
  thirdAppProxy(req, res, next);
});

// Additional static routes
app.get('/brands-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/brand-showcase.html'));
});

app.get('/brand-ecosystem-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/brand-showcase.html'));
});

app.get('/showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'app-showcase.html'));
});

app.get('/standalone-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'standalone-brand-showcase.html'));
});

// Status check page for monitoring all services
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/status-check.html'));
});

// General routing for all applications
app.use('/', (req, res, next) => {
  // Don't proxy API requests from the main server
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Route to the appropriate application based on path
  if (req.path.startsWith('/wallet') || 
      req.path.startsWith('/quantum-security') || 
      req.path.startsWith('/fractal-explorer') || 
      req.path.startsWith('/multi-wallet') || 
      req.path.startsWith('/aethercoin') || 
      req.path.startsWith('/blockchain')) {
    // Forward any wallet-related paths to the wallet server
    console.log(`Forwarding wallet-related request: ${req.method} ${req.path}`);
    walletProxy(req, res, next);
  } else if (req.path.startsWith('/app3')) {
    thirdAppProxy(req, res, next);
  } else {
    brandShowcaseProxy(req, res, next);
  }
});

// Handle cleanup when the server is shutting down
process.on('SIGINT', () => {
  console.log('Shutting down all servers...');
  brandShowcaseProcess.kill();
  walletProcess.kill();
  thirdAppProcess.kill();
  process.exit();
});

// START THE MAIN EXPRESS SERVER
httpServer.listen(MAIN_PORT, '0.0.0.0', () => {
  console.log(`✓ Aetherion Ecosystem Server running on port ${MAIN_PORT}`);
  console.log(`✓ Brand Showcase available at http://localhost:${MAIN_PORT}/brands`);
  console.log(`✓ Aetherion Wallet available at http://localhost:${MAIN_PORT}/wallet`);
  console.log(`✓ Wallet (Vite) available at http://localhost:${MAIN_PORT}/app3`);
  console.log(`✓ Combined landing page at http://localhost:${MAIN_PORT}/`);
  console.log(`✓ Status check page at http://localhost:${MAIN_PORT}/status`);
  console.log(`✓ WebSocket server available at ws://localhost:${MAIN_PORT}/ws`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
    console.log(`✓ Brand Showcase on Replit: ${replitUrl}/brands`);
    console.log(`✓ Aetherion Wallet on Replit: ${replitUrl}/wallet`);
    console.log(`✓ Wallet (Vite) on Replit: ${replitUrl}/app3`);
    console.log(`✓ Status check page on Replit: ${replitUrl}/status`);
    console.log(`✓ API health endpoint: ${replitUrl}/api/health`);
  }
});