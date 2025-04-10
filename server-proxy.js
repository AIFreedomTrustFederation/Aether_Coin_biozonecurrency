/**
 * Express server proxy for Aetherion wallet application
 * This listens on port 5000 (Replit) and proxies to port 5173 (Vite)
 */

import express from 'express';
import httpProxy from 'http-proxy-middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 5000;
const TARGET_URL = 'http://localhost:5173';

console.log(`Starting Aetherion Proxy Service`);
console.log(`Proxying port ${PORT} to ${TARGET_URL}`);

// Setup proxy
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug'
};

// Proxy all requests to Vite server
app.use('/', createProxyMiddleware(proxyOptions));

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`All requests will be proxied to ${TARGET_URL}`);
});