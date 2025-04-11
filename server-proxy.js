/**
 * Express server proxy for Aetherion wallet application
 * This listens on port 5000 (Replit) and proxies to port 5173 (Vite)
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const TARGET_URL = 'http://0.0.0.0:5173'; // Using 0.0.0.0 to match Vite's binding

console.log(`Starting Aetherion Proxy Service`);
console.log(`Proxying port ${PORT} to ${TARGET_URL}`);

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

// Serve the whitepaper files directly for debugging
app.use('/whitepaper', express.static(path.join(__dirname, 'client/public/whitepaper')));

// Setup proxy options with better debugging
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
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

// Proxy all other requests to Vite server
app.use('/', createProxyMiddleware(proxyOptions));

// Start the server - bind to 0.0.0.0 for Replit
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`All requests will be proxied to ${TARGET_URL}`);
  console.log(`Whitepaper content served directly from ${path.join(__dirname, 'client/public/whitepaper')}`);
});