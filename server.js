/**
 * Simplified Aetherion Server Implementation
 * 
 * Express server that proxies requests to Vite dev server
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

// Enable CORS
app.use(cors());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

console.log(`Starting Simplified Aetherion Server`);
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
        message: 'Connected to Scroll Keeper WebSocket Server'
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

// Simple API endpoint for Scroll Keeper status
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Scroll Keeper API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Import our API routes
import { registerRoutes } from './routes-simple.js';

// Register our API routes
(async () => {
  try {
    await registerRoutes(app);
    console.log('✓ API routes registered successfully');
  } catch (error) {
    console.error('Error registering API routes:', error);
  }
})();

// Serve static HTML landing page only for /test path
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'codestar-landing.html'));
});

// Add app route to redirect to the SPA
app.get('/app', (req, res) => {
  console.log('Redirecting to SPA from /app route');
  res.redirect('/');
});

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Start the Vite server in a separate process
const startViteServer = () => {
  // Create a custom Vite config for Replit compatibility
  const tempConfigPath = path.join(__dirname, 'temp-vite.config.js');
  
  // Get the Replit domain from environment variables if available
  const replitDomain = process.env.REPL_SLUG 
    ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : null;
    
  console.log('Detected Replit domain:', replitDomain || 'Not detected');
  
  // Write a temporary server configuration for Vite
  const tempConfig = `
  import { defineConfig } from "vite";
  import { fileURLToPath } from "url";
  import path from "path";
  import react from "@vitejs/plugin-react";
  import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
  import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  export default defineConfig({
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    server: {
      port: ${VITE_PORT},
      host: '0.0.0.0',
      strictPort: true,
      hmr: {
        // Enable HMR with Replit compatibility
        clientPort: ${PORT},
        host: 'localhost',
        protocol: 'ws',
        timeout: 120000,
        overlay: true,
      },
      watch: {
        usePolling: true,
        interval: 1000,
      },
      // Disable open browser
      open: false
    },
    optimizeDeps: {
      force: true
    },
    // Improve base path handling for Replit
    base: '/',
  });
  `;
  
  fs.writeFileSync(tempConfigPath, tempConfig);
  
  // Start Vite with our custom config
  const viteProcess = spawn('npx', ['vite', '--config', tempConfigPath], {
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('error', (error) => {
    console.error(`Failed to start Vite server: ${error.message}`);
  });
  
  // Clean up temp config on exit
  process.on('exit', () => {
    try {
      fs.unlinkSync(tempConfigPath);
    } catch (err) {
      // Ignore error
    }
  });

  return viteProcess;
};

// Define path patterns that should be proxied to Vite
const VITE_PATHS = [
  // All module-related patterns
  '/src/',
  '/@',
  '/@fs/',
  '/@id/',
  '/@vite/',
  '/.vite/',
  '/node_modules/',
  '@fs/',
  '/assets/',
  // Vite's HMR-related patterns
  '/__hmr',
  'vite-hmr',
  'vite-ws',
  '__vite_ping',
  // File extensions for assets and modules
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
  '.gif',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.map',
  '.module.'
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

// Set up proxy options
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'info',
  secure: false,
  xfwd: true,
  autoRewrite: true,
  followRedirects: true,
  pathRewrite: {
    '^/@vite/hmr': '/@vite/hmr',
    '^/@vite/client': '/@vite/client'
  },
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
      <p><a href="/">Try Landing Page</a> | <a href="/brands">Try Brand Showcase</a> | <a href="/code-mood-meter">Try Code Mood Meter</a></p>
    `);
  }
};

// Create proxy middleware
const viteProxyMiddleware = createProxyMiddleware(proxyOptions);

// Proxy special WebSocket connections
app.use(['/@vite/client', '/@vite/hmr', '/vite-hmr', '/__vite_ping'], (req, res, next) => {
  console.log(`[WebSocket] Handling special Vite connection: ${req.url}`);
  viteProxyMiddleware(req, res, next);
});

// Define React SPA routes
const CLIENT_ROUTES = [
  '/',
  '/dashboard',
  '/tokenomics',
  '/aicon',
  '/wallet',
  '/dapp',
  '/about',
  '/domains',
  '/achievements',
  '/terms-of-service',
  '/privacy-policy',
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
  '/productivity',
  '/brands',
  '/brands/:slug'
];

// Handle Brands page separately to ensure it works
app.get('/brands', (req, res) => {
  console.log(`Brand showcase routing for: ${req.path}`);
  viteProxyMiddleware(req, res);
});

// Handle root route to ensure LandingPage component is loaded
app.get('/', (req, res) => {
  console.log(`Root route handling - loading LandingPage component`);
  viteProxyMiddleware(req, res);
});

// Handle SPA routes
app.get(CLIENT_ROUTES, (req, res) => {
  console.log(`SPA route handling for: ${req.path}`);
  viteProxyMiddleware(req, res);
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
  
  console.log(`Fallback handling for: ${path}`);
  // For SPA navigation, proxy to Vite
  viteProxyMiddleware(req, res, next);
});

// Start Vite server
const viteProcess = startViteServer();

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteProcess.kill();
  process.exit();
});

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Aetherion integrated server running on port ${PORT}`);
  console.log(`✓ Test page available at http://localhost:${PORT}/test`);
  console.log(`✓ Landing page available at http://localhost:${PORT}/`);
  console.log(`✓ WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`✓ Vite dev server running on port ${VITE_PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
    console.log(`✓ Landing page on Replit: ${replitUrl}/`);
    console.log(`✓ API health endpoint: ${replitUrl}/api/health`);
    
    // Write a file to help the webview find our app
    try {
      const webviewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/">
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
    <p>If you are not redirected automatically, <a href="/" style="color: #41e0fd;">click here</a>.</p>
  </div>
  <script>
    window.location.href = '/';
  </script>
</body>
</html>
      `;
      fs.writeFileSync(path.join(__dirname, 'index.html'), webviewHtml);
      console.log('✓ Created webview helper file at /index.html');
    } catch (err) {
      console.error('Failed to create webview helper file:', err);
    }
  } else {
    console.log('\n⚠ Not running in a Replit environment, or missing environment variables.');
  }
});