/**
 * Express server for Aetherion wallet application
 * Serves the Vite development server on port 5000
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const TARGET_URL = 'http://0.0.0.0:5173'; // Using 0.0.0.0 to match Vite's binding
const CLIENT_DIR = path.join(__dirname, 'client');

console.log(`Starting Aetherion Proxy Service (Biozone Harmony Boost Integration)`);
console.log(`Proxying port ${PORT} to ${TARGET_URL}`);

// Kill any existing process on port 5173
function killExistingProcess(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, (error) => {
      if (error) {
        console.log(`No process found on port ${port} or failed to kill: ${error.message}`);
      } else {
        console.log(`Killed process on port ${port}`);
      }
      resolve();
    });
  });
}

// Start Vite server
async function startViteServer() {
  console.log('Starting Vite development server...');
  await killExistingProcess(5173);
  
  // Start Vite in the client directory
  const viteProcess = exec('cd client && npx vite --host 0.0.0.0', (error) => {
    if (error) {
      console.error(`Vite server error: ${error.message}`);
      process.exit(1);
    }
  });
  
  // Forward Vite's stdout/stderr to our console
  viteProcess.stdout.on('data', (data) => console.log(data.toString().trim()));
  viteProcess.stderr.on('data', (data) => console.error(data.toString().trim()));
  
  // Ensure Vite is killed when this process exits
  process.on('exit', () => {
    viteProcess.kill();
  });
  
  // Give Vite a moment to start up
  return new Promise(resolve => setTimeout(resolve, 3000));
}

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Add a simple index page for debugging
app.get('/debug-info', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Aetherion Server Debug Info</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Aetherion Server Debug Info</h1>
        <p>This page provides debugging information for the Aetherion server proxy.</p>
        
        <h2>Environment</h2>
        <pre>${JSON.stringify({
          NODE_ENV: process.env.NODE_ENV || 'development',
          PORT: PORT,
          TARGET_URL: TARGET_URL,
          REPLIT_DB_URL: process.env.REPLIT_DB_URL ? 'Set' : 'Not Set',
          DEPLOYMENT_PATH: process.env.DEPLOYMENT_PATH || '/dapp'
        }, null, 2)}</pre>
        
        <h2>Server Info</h2>
        <pre>${JSON.stringify({
          uptime: process.uptime(),
          date: new Date().toISOString(),
          memoryUsage: process.memoryUsage(),
        }, null, 2)}</pre>
        
        <h2>Links</h2>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/health">Health Check</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Serve static files from client/public directory directly
app.use(express.static(path.join(CLIENT_DIR, 'public')));

// Setup proxy options with better debugging
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/api/': '/api/'  // rewrite path
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${TARGET_URL}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response for ${req.url} with status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`Proxy error: ${err.message}`);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end(`Proxy error: ${err.message}`);
  }
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

// Set up proxy middleware that can be reused
const viteProxyMiddleware = createProxyMiddleware(proxyOptions);

// Proxy all static assets and source files to Vite dev server
app.use((req, res, next) => {
  const path = req.originalUrl;
  
  if (shouldProxyToVite(path)) {
    console.log(`Proxying to Vite: ${path}`);
    return viteProxyMiddleware(req, res, next);
  }
  
  next();
});

// Serve the root path through the Vite dev server
app.get('/', (req, res) => {
  console.log('Serving root path through Vite proxy');
  viteProxyMiddleware(req, res);
});

// Define React SPA routes based on biozone-harmony-boost App.tsx
const CLIENT_ROUTES = [
  '/tokenomics',
  '/aicon',
  '/wallet',
  '/dapp',
  '/terms-of-service',
  '/privacy-policy',
  '/api'
];

// Handle SPA routes
app.get(CLIENT_ROUTES, (req, res) => {
  console.log(`SPA route handling for: ${req.path}`);
  viteProxyMiddleware(req, res);
});

// Proxy API requests
app.use('/api', viteProxyMiddleware);

// Add a fallback route for any other paths
app.use('*', (req, res) => {
  const path = req.originalUrl;
  
  // Check if the request is for a Vite module or asset
  if (shouldProxyToVite(path)) {
    console.log(`Proxying Vite resource: ${path}`);
    return viteProxyMiddleware(req, res);
  }
  
  console.log(`Fallback handling for: ${path}`);
  // For SPA navigation, proxy to Vite which will serve the correct index.html
  viteProxyMiddleware(req, res);
});

// Start everything
async function startServer() {
  try {
    // First start Vite
    await startViteServer();
    
    // Then start our Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Proxy server running on port ${PORT}`);
      console.log(`All requests will be proxied to ${TARGET_URL}`);
      console.log(`Static assets served from ${path.join(CLIENT_DIR, 'public')}`);
      console.log(`SPA routes configured: ${CLIENT_ROUTES.join(', ')}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startServer();