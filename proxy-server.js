/**
 * Proxy Server for Scroll Keeper
 * 
 * This creates a simple Express server that proxies requests to our main server.
 * It ensures that Replit's Web View can access our application.
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

// Create Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Create proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxy
  pathRewrite: {
    '^/api': '/api', // Keep API path as is
    '^/ws': '/ws'    // Keep WebSocket path as is
  },
  logLevel: 'debug'
});

// Use proxy for API and WebSocket routes
app.use('/api', apiProxy);
app.use('/ws', apiProxy);

// Serve static files from main server
app.use('/', apiProxy);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Proxy server running on port ${PORT}`);
  console.log(`✓ Forwarding requests to http://localhost:5000`);
});