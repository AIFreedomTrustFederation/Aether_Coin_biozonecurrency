/**
 * Modified Aetherion Server for Replit Webview Compatibility
 * 
 * This version combines the original proxy functionality with improved 
 * Replit webview integration. It maintains the existing features while
 * fixing connectivity issues with Replit's webview system.
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

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = process.env.PORT || 5000; 
const VITE_PORT = 5173;
const TARGET_URL = `http://localhost:${VITE_PORT}`;

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Add verbose request logging for debugging
app.use((req, res, next) => {
  // Skip logging for asset requests to reduce noise
  if (!req.path.includes('.js') && !req.path.includes('.css') && !req.path.includes('.ico')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
  }
  next();
});

// Enable CORS with specific headers for Replit
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve static files from 'public' directory - high priority
app.use(express.static(path.join(__dirname, 'public')));

console.log(`Starting Enhanced Aetherion Server`);
console.log(`Main server on port ${PORT} proxying to Vite on port ${VITE_PORT}`);

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
        message: 'Connected to Aether_Coin CodeStar WebSocket Server'
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Add a simple health check endpoint with enhanced CORS support
app.get('/health', (req, res) => {
  // Add CORS headers for the health check endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
  
  // Log health check request - helps with debugging
  console.log(`Health check requested from ${req.ip} - Status: OK`);
});

// Add API health check endpoint (explicitly mounted at /api/health)
app.get('/api/health', (req, res) => {
  // Add CORS headers for the API health check endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  res.json({
    status: 'ok',
    api_version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    features: {
      productivity: true,
      codeMoodMeter: true,
      webSocket: true
    }
  });
  
  console.log(`API health check requested from ${req.ip} - Status: OK`);
});

// Simple API endpoint for status
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Aether_Coin CodeStar API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve a simple HTML page for direct testing
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Add app route to redirect to the SPA
app.get('/app', (req, res) => {
  console.log('Redirecting to SPA from /app route');
  res.redirect('/');
});

// Start the Vite server in a separate process
const startViteServer = () => {
  console.log('Starting Vite development server...');
  
  // Start Vite with our custom config
  const viteProcess = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('error', (error) => {
    console.error(`Failed to start Vite server: ${error.message}`);
  });
  
  return viteProcess;
};

// Define path patterns that should be proxied to Vite
const VITE_PATHS = [
  // Asset patterns that should be proxied to Vite
  '/src/',
  '/@',
  '/@fs/',
  '/@id/',
  '/@vite/',
  '/.vite/',
  '/node_modules/',
  '@fs/',
  '/assets/',
  '/__hmr',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.css',
  '.json',
  '.svg',
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif'
];

// Function to check if a path should be proxied to Vite
const shouldProxyToVite = (path) => {
  // Always proxy Hot Module Replacement (HMR) requests
  if (path.includes('vite-hmr') || path.includes('__vite_ping') || path.includes('vite-ws')) {
    return true;
  }
  
  return VITE_PATHS.some(pattern => 
    path.includes(pattern) || path.endsWith(pattern));
};

// Set up proxy options with enhanced support for Replit
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'info',
  secure: false,
  xfwd: true,
  autoRewrite: true,
  followRedirects: true,
  headers: {
    // Add headers to help with Replit environment
    'Connection': 'keep-alive',
    'X-Forwarded-Host': process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : undefined,
    'X-Forwarded-Proto': 'https'
  },
  onProxyReq: (proxyReq, req, res) => {
    if (!req.url.match(/\.(js|css|png|jpg|svg|ico|woff|woff2|ttf)$/)) {
      console.log(`[PROXY] ${req.method} ${req.url} -> ${TARGET_URL}`);
    }
    
    // Add origin header for CORS
    proxyReq.setHeader('Origin', TARGET_URL);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Proxy Error</h1>
      <p>Could not connect to Vite server at ${TARGET_URL}</p>
      <p>Error: ${err.message}</p>
      <p><a href="/test">Check server status</a></p>
      <p><a href="/">Try Home Page</a> | <a href="/code-mood-meter">Try Code Mood Meter</a></p>
    `);
  }
};

// Create proxy middleware
const viteProxyMiddleware = createProxyMiddleware(proxyOptions);

// Proxy special WebSocket connections
app.use(['/@vite/client', '/@vite/hmr', '/vite-hmr', '/__vite_ping'], (req, res, next) => {
  viteProxyMiddleware(req, res, next);
});

// Define React SPA routes
const CLIENT_ROUTES = [
  '/',
  '/tokenomics',
  '/aicon',
  '/wallet',
  '/dapp',
  '/about',
  '/domains',
  '/achievements',
  '/api',
  '/aethercore-trust',
  '/aethercore-browser',
  '/node-marketplace',
  '/dns-manager',
  '/codestar',
  '/scroll-keeper',
  '/enumerator',
  '/bot-simulation',
  '/aifreedomtrust',
  '/code-mood-meter',
  '/productivity'
];

// Handle SPA routes
app.get(CLIENT_ROUTES, (req, res, next) => {
  // Special case for the root route
  if (req.path === '/') {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  
  console.log(`SPA route handling for: ${req.path}`);
  next();
});

// Add a middleware to check all other requests
app.use('*', (req, res, next) => {
  const path = req.originalUrl;
  
  // Explicitly handle API requests
  if (path.startsWith('/api/')) {
    // If we reached here, there's no explicit handler for this API route
    console.log(`API endpoint not found: ${path}`);
    return res.status(404).json({
      error: 'API endpoint not found',
      path: path
    });
  }
  
  // Check if the request is for a Vite module or asset
  if (shouldProxyToVite(path)) {
    console.log(`Proxying Vite resource: ${path}`);
    return viteProxyMiddleware(req, res, next);
  }
  
  // Fallback to serving the index.html for SPA navigation
  console.log(`Fallback handling for: ${path}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Vite server
const viteProcess = startViteServer();

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteProcess.kill();
  process.exit();
});

// Ensure the public directory exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

// Create a basic index.html in the public directory if it doesn't exist
const indexPath = path.join(__dirname, 'public', 'index.html');
if (!fs.existsSync(indexPath)) {
  const basicHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether_Coin CodeStar Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #041e3c, #0b3561);
      color: white;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      background: rgba(15, 35, 75, 0.8);
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    h1 {
      font-size: 2.4rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #41e0fd, #9b83fc);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .btn {
      display: inline-block;
      background: linear-gradient(90deg, #41e0fd, #9b83fc);
      color: #fff;
      padding: 12px 24px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      margin: 15px 0;
      border: none;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    .api-status {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      text-align: left;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Aether_Coin CodeStar Platform</h1>
    <p>Welcome to the CodeStar development environment. This simplified interface provides access to testing tools and API endpoints.</p>
    
    <a href="/test" class="btn">Open Test Page</a>
    
    <div class="api-status">
      <h3>API Status</h3>
      <div id="status-output">Click the button below to check API status</div>
      <button id="check-api" class="btn">Check API Status</button>
    </div>
  </div>

  <script>
    document.getElementById('check-api').addEventListener('click', async () => {
      const output = document.getElementById('status-output');
      output.textContent = 'Checking API status...';
      
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        output.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        output.textContent = 'Error: ' + error.message;
      }
    });
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(indexPath, basicHtml);
  console.log('Created basic index.html in public directory');
}

// Also create a root-level index.html for direct hosting compatibility
fs.writeFileSync(path.join(__dirname, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/test">
  <title>Aether_Coin CodeStar Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #041e3c, #0b3561);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .loader {
      border: 5px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      border-top: 5px solid #41e0fd;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div>
    <div class="loader"></div>
    <h2>Redirecting to Aether_Coin CodeStar Platform...</h2>
    <p>If you are not redirected automatically, <a href="/test" style="color: #41e0fd;">click here</a>.</p>
  </div>
  <script>
    window.location.href = '/test';
  </script>
</body>
</html>
`);
console.log('Created root-level redirect index.html');

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Aether_Coin CodeStar server running on port ${PORT}`);
  console.log(`✓ Test page available at http://localhost:${PORT}/test`);
  console.log(`✓ WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`✓ Vite dev server running on port ${VITE_PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n=== REPLIT ENVIRONMENT DETECTED ===`);
    console.log(`✓ REPLIT URL: ${replitUrl}`);
    console.log(`✓ REPLIT TEST PAGE: ${replitUrl}/test`);
    console.log(`✓ REPLIT API HEALTH: ${replitUrl}/api/health`);
  } else {
    console.log('\n⚠ Not running in a Replit environment, or missing environment variables.');
  }
});