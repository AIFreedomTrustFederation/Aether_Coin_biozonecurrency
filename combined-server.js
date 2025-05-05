/**
 * Combined Aetherion Server
 * Serves both the Aetherion Wallet v1.0.0 and Brand Showcase applications
 * as well as a third application if needed
 * 
 * Enhanced with comprehensive error handling and fallback mechanisms
 */

import express from 'express';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import pg from 'pg';

// Import error handling utilities
import { 
  errorHandlerMiddleware, 
  asyncHandler, 
  setupGlobalErrorHandlers,
  safeFileOperation,
  formatErrorResponse
} from './error-handler.js';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import centralized configuration
import config from './config.js';

// Server configuration for each application
const MAIN_PORT = process.env.PORT || config.mainServer.port;
const BRAND_SHOWCASE_PORT = config.brandShowcase.port;
const WALLET_PORT = config.aetherionWallet.port;
const THIRD_APP_PORT = config.thirdApp.port; // For a third application
const WALLET_VITE_PORT = config.aetherionWallet.vitePort; // Vite port for wallet application

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
const wss = new WebSocketServer({ server: httpServer, path: config.websocket.path });

// Store all active connections with their subscriptions
const clients = new Map();

// Function to broadcast to all clients with a specific subscription
function broadcast(type, data, subscription = null) {
  const payload = JSON.stringify({
    type,
    timestamp: new Date().toISOString(),
    data
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // If no subscription specified, or client has this subscription
      if (!subscription || (clients.has(client) && clients.get(client).includes(subscription))) {
        client.send(payload);
      }
    }
  });
}

// System stats broadcast interval (every 30 seconds)
const STATS_INTERVAL = 30000;
let statsInterval = null;

// Helper function to get system stats
function getSystemStats() {
  const memoryUsage = process.memoryUsage();
  const formatMemoryUsage = {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
  };
  
  return {
    memory: formatMemoryUsage,
    uptime: process.uptime(),
    cpu: os.loadavg(),
    timestamp: new Date().toISOString()
  };
}

// Check database connectivity
async function checkDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      return { connected: false, message: 'DATABASE_URL not set' };
    }
    
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000
    });
    
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      return { connected: true, message: 'Database connection successful' };
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    return { connected: false, message: err.message };
  }
}

// WebSocket server connection handler
wss.on('connection', function connection(ws, req) {
  console.log(`Client connected to WebSocket from ${req.socket.remoteAddress}`);
  
  // Initialize client subscriptions
  clients.set(ws, []);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    timestamp: new Date().toISOString(),
    message: 'Connected to Aetherion Ecosystem WebSocket Server',
    availableSubscriptions: ['system', 'database', 'services', 'notifications']
  }));
  
  // Start the stats interval if this is the first client
  if (wss.clients.size === 1) {
    console.log('Starting system stats broadcast interval');
    statsInterval = setInterval(async () => {
      const stats = getSystemStats();
      const dbStatus = await checkDatabase();
      
      // Broadcast system stats to subscribers
      broadcast('system-stats', stats, 'system');
      
      // Broadcast database status to subscribers
      broadcast('database-status', dbStatus, 'database');
    }, STATS_INTERVAL);
  }
  
  // Handle incoming messages
  ws.on('message', async function incoming(message) {
    try {
      const msg = JSON.parse(message.toString());
      console.log('Received WebSocket message:', msg.type || 'unknown type');
      
      switch(msg.type) {
        case 'subscribe':
          if (msg.channels && Array.isArray(msg.channels)) {
            const validChannels = ['system', 'database', 'services', 'notifications'];
            const subscriptions = msg.channels.filter(ch => validChannels.includes(ch));
            clients.set(ws, subscriptions);
            ws.send(JSON.stringify({
              type: 'subscription-update',
              timestamp: new Date().toISOString(),
              subscriptions
            }));
            
            // Immediately send initial data for new subscriptions
            if (subscriptions.includes('system')) {
              ws.send(JSON.stringify({
                type: 'system-stats',
                timestamp: new Date().toISOString(),
                data: getSystemStats()
              }));
            }
            
            if (subscriptions.includes('database')) {
              const dbStatus = await checkDatabase();
              ws.send(JSON.stringify({
                type: 'database-status',
                timestamp: new Date().toISOString(),
                data: dbStatus
              }));
            }
          }
          break;
          
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;
          
        case 'get-services-status':
          // Respond with status of all internal services
          ws.send(JSON.stringify({
            type: 'services-status',
            timestamp: new Date().toISOString(),
            data: {
              brandShowcase: { status: 'running', port: BRAND_SHOWCASE_PORT },
              aetherionWallet: { status: 'running', port: WALLET_PORT },
              thirdApp: { status: 'running', port: THIRD_APP_PORT }
            }
          }));
          break;
          
        default:
          console.log(`Unknown WebSocket message type: ${msg.type || 'undefined'}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        timestamp: new Date().toISOString(),
        message: 'Invalid message format. Expected JSON with type field.'
      }));
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    clients.delete(ws);
    
    // Stop the stats interval if no clients are connected
    if (wss.clients.size === 0 && statsInterval) {
      console.log('Stopping system stats broadcast interval');
      clearInterval(statsInterval);
      statsInterval = null;
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket client error:', error);
    clients.delete(ws);
  });
});

// Import os module at the top level
import os from 'os';

// Add an enhanced health check endpoint with detailed system metrics
app.get(config.api.health, (req, res) => {
  // Get memory usage in a more readable format
  const formatMemoryUsage = (memoryUsage) => {
    return {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      rawValues: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal, 
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      }
    };
  };
  
  // Calculate uptime in a readable format
  const uptime = process.uptime();
  const uptimeFormatted = {
    days: Math.floor(uptime / (24 * 60 * 60)),
    hours: Math.floor((uptime % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((uptime % (60 * 60)) / 60),
    seconds: Math.floor(uptime % 60),
    totalSeconds: uptime
  };
  
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch,
      cpuCores: os.cpus().length,
      memoryUsage: formatMemoryUsage(process.memoryUsage()),
      uptime: uptimeFormatted,
      osUptime: os.uptime(),
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
    },
    services: {
      main: 'running',
      brandShowcase: 'running',
      wallet: 'running',
      thirdApp: 'running'
    }
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

// START ALL PROCESSES ASYNCHRONOUSLY with error handling

// Import safeSpawn from error-handler.js
import { safeSpawn } from './error-handler.js';

// 1. Start the Brand Showcase Vite server
console.log(`Starting Brand Showcase Vite server on port ${BRAND_SHOWCASE_PORT}`);
const { process: brandShowcaseProcess, error: brandShowcaseError } = safeSpawn('npx', ['vite', '--host', '--port', BRAND_SHOWCASE_PORT], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname)
});

if (brandShowcaseError) {
  console.error(`Failed to start Brand Showcase server: ${brandShowcaseError.message}`);
} else {
  console.log(`✓ Brand Showcase server process started with PID: ${brandShowcaseProcess.pid}`);
}

// 2. Start the dedicated Aetherion Wallet server (using the existing aetherion-server.js)
console.log(`Starting Aetherion Wallet server on port ${WALLET_PORT}`);
const { process: walletProcess, error: walletError } = safeSpawn('node', ['aetherion-server.js'], {
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

if (walletError) {
  console.error(`Failed to start Aetherion Wallet server: ${walletError.message}`);
} else {
  console.log(`✓ Aetherion Wallet server process started with PID: ${walletProcess.pid}`);
}

// 3. Start a third application using our separate server file
console.log(`Starting third app on port ${THIRD_APP_PORT} (Simple Express Server)`);
const { process: thirdAppProcess, error: thirdAppError } = safeSpawn('node', ['third-app-server.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: THIRD_APP_PORT
  }
});

if (thirdAppError) {
  console.error(`Failed to start Third App server: ${thirdAppError.message}`);
} else {
  console.log(`✓ Third App server process started with PID: ${thirdAppProcess.pid}`);
}

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

// Main landing page with enhanced error handling
app.get('/', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'index.html');
    
    // Check if file exists first to provide better error handling
    if (!fs.existsSync(indexPath)) {
      console.error(`Landing page file not found: ${indexPath}`);
      return res.status(500).json({
        error: 'Landing page not available',
        message: 'The main landing page file could not be found.'
      });
    }
    
    res.sendFile(indexPath);
  } catch (error) {
    console.error('Error serving landing page:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to serve the landing page due to a server error.'
    });
  }
});

// Aetherion Wallet route - enhanced with better handling
app.use(config.aetherionWallet.basePath, (req, res, next) => {
  console.log(`Wallet request received: ${req.method} ${req.originalUrl}`);
  // Forward all wallet requests to the dedicated wallet server
  walletProxy(req, res, next);
});

// Brand Showcase route - handle all methods and all paths under /brands
app.use(config.brandShowcase.basePath, (req, res, next) => {
  console.log(`Brand Showcase request received: ${req.method} ${req.originalUrl}`);
  brandShowcaseProxy(req, res, next);
});

// Third application route (placeholder for future)
app.use(config.thirdApp.basePath, (req, res, next) => {
  console.log(`Third App request received: ${req.method} ${req.originalUrl}`);
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
app.get(config.api.status, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/status-check.html'));
});

// WebSocket test client
app.get('/ws-client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/websocket-client.html'));
});

// General routing for all applications
app.use('/', (req, res, next) => {
  // Don't proxy API requests from the main server
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Route to the appropriate application based on path
  if (req.path.startsWith(config.aetherionWallet.basePath) || 
      req.path.startsWith('/quantum-security') || 
      req.path.startsWith('/fractal-explorer') || 
      req.path.startsWith('/multi-wallet') || 
      req.path.startsWith('/aethercoin') || 
      req.path.startsWith('/blockchain')) {
    // Forward any wallet-related paths to the wallet server
    console.log(`Forwarding wallet-related request: ${req.method} ${req.path}`);
    walletProxy(req, res, next);
  } else if (req.path.startsWith(config.thirdApp.basePath)) {
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

// Add API 404 handler
app.use('/api/*', (req, res, next) => {
  const notFoundError = new Error(`Route not found: ${req.originalUrl}`);
  notFoundError.statusCode = 404;
  notFoundError.code = 'ROUTE_NOT_FOUND';
  
  // Format and send JSON error response for API routes
  const errorResponse = formatErrorResponse({
    message: notFoundError.message,
    statusCode: notFoundError.statusCode,
    code: notFoundError.code
  });
  
  res.status(404).json(errorResponse);
});

// Add general error handling middleware for all routes
app.use(errorHandlerMiddleware);

// Set up global error handlers
setupGlobalErrorHandlers();

// START THE MAIN EXPRESS SERVER
// Attempt to listen on the primary port, and if that fails, try alternative ports
const startServer = (port = MAIN_PORT, retries = 3) => {
  httpServer.listen(port, '0.0.0.0')
    .on('listening', () => {
      // Successfully started server
      const actualPort = port;
      console.log(`✓ ${config.mainServer.name} running on port ${actualPort}`);
      console.log(`✓ ${config.brandShowcase.name} available at http://localhost:${actualPort}${config.brandShowcase.basePath}`);
      console.log(`✓ ${config.aetherionWallet.name} available at http://localhost:${actualPort}${config.aetherionWallet.basePath}`);
      console.log(`✓ ${config.thirdApp.name} available at http://localhost:${actualPort}${config.thirdApp.basePath}`);
      console.log(`✓ Combined landing page at http://localhost:${actualPort}${config.mainServer.basePath}`);
      console.log(`✓ Status check page at http://localhost:${actualPort}${config.api.status}`);
      console.log(`✓ ${config.websocket.name} available at ws://localhost:${actualPort}${config.websocket.path}`);
      
      // Display Replit-specific URL information
      const replitSlug = process.env.REPL_SLUG;
      const replitOwner = process.env.REPL_OWNER;
      if (replitSlug && replitOwner) {
        const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
        console.log(`\n✓ REPLIT URL: ${replitUrl}`);
        console.log(`✓ ${config.brandShowcase.name} on Replit: ${replitUrl}${config.brandShowcase.basePath}`);
        console.log(`✓ ${config.aetherionWallet.name} on Replit: ${replitUrl}${config.aetherionWallet.basePath}`);
        console.log(`✓ ${config.thirdApp.name} on Replit: ${replitUrl}${config.thirdApp.basePath}`);
        console.log(`✓ Status check page on Replit: ${replitUrl}${config.api.status}`);
        console.log(`✓ API health endpoint: ${replitUrl}${config.api.health}`);
      }
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use, trying another port...`);
        
        if (retries > 0) {
          // Try next port
          httpServer.close();
          startServer(port + 1, retries - 1);
        } else {
          console.error('Could not find an available port after several attempts');
          process.exit(1);
        }
      } else {
        console.error('Error starting server:', err);
        process.exit(1);
      }
    });
};

startServer();