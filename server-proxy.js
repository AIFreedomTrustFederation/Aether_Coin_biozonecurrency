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
const TARGET_URL = 'http://localhost:5173';

console.log(`Starting Aetherion Proxy Service`);
console.log(`Proxying port ${PORT} to ${TARGET_URL}`);

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
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

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`All requests will be proxied to ${TARGET_URL}`);
  console.log(`Whitepaper content served directly from ${path.join(__dirname, 'client/public/whitepaper')}`);
});