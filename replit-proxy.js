/**
 * Simple Proxy Server for Replit Web View Compatibility
 * 
 * This lightweight server only proxies requests from port 3000 (Replit web view)
 * to port 5000 (our application server).
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Create Express app
const app = express();
const LISTEN_PORT = 3000;
const TARGET_PORT = 5000;

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[PROXY] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/proxy-health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Replit proxy server is running',
    proxyingFrom: LISTEN_PORT,
    proxyingTo: TARGET_PORT
  });
});

// Create proxy middleware with simple configuration
const proxy = createProxyMiddleware({
  target: `http://localhost:${TARGET_PORT}`,
  changeOrigin: true,
  ws: true,
  logLevel: 'silent',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] Forwarding request: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY] Error: ${err.message}`);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end(`Proxy Error: Unable to connect to the application server on port ${TARGET_PORT}`);
  }
});

// Apply proxy to all routes
app.use('/', proxy);

// Start the server
app.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`✓ Replit proxy server running on port ${LISTEN_PORT}`);
  console.log(`✓ Forwarding all requests to http://localhost:${TARGET_PORT}`);
});