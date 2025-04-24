/**
 * Port proxy for Scroll Keeper
 * 
 * This creates a simple proxy that forwards requests from port 5000 to our actual server port.
 * This ensures compatibility with Replit's Web View and other workflows.
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Create a proxy server on port 5000 that forwards to our actual server port
const PORT = process.env.PROXY_PORT || 5000;
const TARGET_PORT = process.env.TARGET_PORT || 3000;

const app = express();

// Configure proxy
app.use('/', createProxyMiddleware({
  target: `http://localhost:${TARGET_PORT}`,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxy
  logLevel: 'debug'
}));

// Start proxy server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Proxy server running on port ${PORT}`);
  console.log(`✓ Forwarding to http://localhost:${TARGET_PORT}`);
});