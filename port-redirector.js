/**
 * Simple HTTP redirect server for Scroll Keeper
 * Redirects requests to the main application server
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const REPLIT_PORT = 5173; // The port Replit's tools might be looking for
const TARGET_PORT = 5000; // The port where our application is actually running

// Create proxy options
const proxyOptions = {
  target: `http://localhost:${TARGET_PORT}`,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to http://localhost:${TARGET_PORT}`);
  }
};

// Proxy all requests
app.use('/', createProxyMiddleware(proxyOptions));

// Start the server
app.listen(REPLIT_PORT, '0.0.0.0', () => {
  console.log(`✓ Redirector running on port ${REPLIT_PORT}`);
  console.log(`✓ Forwarding all requests to http://localhost:${TARGET_PORT}`);
});