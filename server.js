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

// Add a simple API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Add a mock LAO API endpoint
app.get('/api/laos', (req, res) => {
  res.json({
    message: 'LAO API endpoint working',
    laos: [
      {
        id: 1,
        name: 'Aetherion Core LAO',
        entityId: 'WY-2025-001',
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        description: 'Core LAO for Aetherion governance',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Add a mock Insurance API endpoint
app.get('/api/insurance/risk-pools', (req, res) => {
  res.json({
    message: 'Insurance Risk Pools API endpoint working',
    riskPools: [
      {
        id: 1,
        name: 'Asset Protection Pool',
        policyType: 'asset_protection',
        balance: 1000000,
        minCoverageAmount: 10000,
        maxCoverageAmount: 5000000,
        createdAt: new Date().toISOString()
      }
    ]
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

// Serve AI Freedom Trust static site files first (more specific route)
app.use('/aifreedomtrust', express.static(path.join(CLIENT_DIR, 'public', 'aifreedomtrust')));

// Then serve general static files from client/public directory
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

// Handle subdomain detection for production environment
app.use((req, res, next) => {
  const host = req.get('host');
  // Check if we're running in production and receiving a request from the ATC subdomain
  if (host && host.includes('atc.aifreedomtrust.com')) {
    console.log(`Detected subdomain access: ${host}`);
    // Redirect to our ATC portal route
    return res.redirect('/atc-aifreedomtrust');
  }
  next();
});

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
  // '/aifreedomtrust', // Now handled by static file middleware
  '/achievements',
  '/aethercore-browser',
  '/terms-of-service',
  '/privacy-policy'
];

// Handle SPA routes
app.get(CLIENT_ROUTES, (req, res) => {
  console.log(`SPA route handling for: ${req.path}`);
  viteProxyMiddleware(req, res);
});

// Simple middleware to handle API 404s properly
app.use('/api/*', (req, res, next) => {
  const fullPath = req.originalUrl;
  
  // Check if this is an API route we've already defined
  const isExplicitApiRoute = 
    fullPath === '/api/test' || 
    fullPath === '/api/laos' || 
    fullPath === '/api/insurance/risk-pools';
  
  if (isExplicitApiRoute) {
    return next();
  }
  
  // If we reach here, it's an API route that doesn't exist
  console.log(`API route not found: ${fullPath}`);
  
  // Return proper JSON error instead of HTML
  return res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${fullPath} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Proxy any remaining API requests to Vite dev server
// This comes after our explicit API routes and 404 handler
app.use('/api', (req, res, next) => {
  console.log(`Proxying API request: ${req.url}`);
  viteProxyMiddleware(req, res, next);
});

// The aifreedomtrust route is now handled by the static middleware above

// Domain handling for atc.aifreedomtrust.com - handle both direct route and subdomain access
app.get(['/atc-aifreedomtrust', '/atc'], (req, res) => {
  // Log access for debugging
  console.log(`ATC Portal accessed via: ${req.path} - Host: ${req.get('host')}`);
  
  // Set special headers to identify this is from our quantum portal
  res.setHeader('X-Quantum-Portal', 'true');
  res.setHeader('X-Aetherion-Domain', 'atc.aifreedomtrust.com');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Freedom Trust - ATC Portal</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .security-badge {
          background-color: #10b981;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          margin: 0 auto;
        }
        .security-badge svg {
          margin-right: 5px;
        }
        main {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          main {
            grid-template-columns: 1fr 1fr;
          }
        }
        .service-card {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .service-list {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .service-list ul {
          padding-left: 20px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.8rem;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          margin-top: 10px;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .button-outline {
          display: inline-block;
          background-color: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          margin-top: 10px;
          transition: background-color 0.2s, color 0.2s;
        }
        .button-outline:hover {
          background-color: #3b82f6;
          color: white;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>AI Freedom Trust - ATC Portal</h1>
        <p>Welcome to the AI Freedom Trust ATC Portal</p>
        <div class="security-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Quantum-Secure Connection
        </div>
      </header>
      
      <div class="service-list">
        <h2>ATC Services</h2>
        <ul>
          <li>Aetherion Wallet Access</li>
          <li>Fractal Reserve Banking</li>
          <li>Quantum-Secure Communications</li>
          <li>AIcoin Mining Dashboard</li>
          <li>Decentralized Identity Management</li>
        </ul>
      </div>
      
      <main>
        <div class="service-card">
          <h3>Wallet Access</h3>
          <p>Access your Aetherion quantum-resistant wallet with fractal sharding security.</p>
          <p>Manage your digital assets with advanced security measures that protect against both classical and quantum computing attacks.</p>
          <a href="/wallet" class="button">Launch Wallet</a>
        </div>
        
        <div class="service-card">
          <h3>DAPP Portal</h3>
          <p>Access decentralized applications secured by the FractalCoin network.</p>
          <p>Connect to a growing ecosystem of decentralized apps with quantum-resistant security built-in.</p>
          <a href="/dapp" class="button">Open DAPP Portal</a>
        </div>
        
        <div class="service-card">
          <h3>Fractal Reserve Banking</h3>
          <p>Experience a new paradigm in digital asset banking with our fractal reserve system.</p>
          <p>Participate in a system designed for equitable returns regardless of when you entered.</p>
          <a href="/aicon" class="button-outline">Learn More</a>
        </div>
        
        <div class="service-card">
          <h3>AIcoin Mining</h3>
          <p>Mine AIcoin through our revolutionary "Death & Resurrection" protocol.</p>
          <p>Contribute computing resources and earn rewards through our mathematically balanced system.</p>
          <a href="/aicon" class="button-outline">Start Mining</a>
        </div>
      </main>
      
      <div class="footer">
        <p>ATC Portal v1.0.0 | Powered by FractalCoin Network</p>
        <p>Featuring quantum-resistant security protocols and hybrid encryption</p>
        <p><a href="/">Return to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

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