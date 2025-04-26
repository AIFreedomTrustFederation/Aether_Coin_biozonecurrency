/**
 * Simple Express server for Aether_Coin CodeStar Platform
 * This server is focused on delivering static content and basic API endpoints
 * without the complexity of proxying to a Vite development server.
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer } from 'ws';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = process.env.PORT || 3000; 

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

console.log(`Starting Simple Aether_Coin Server on port ${PORT}`);

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
        message: 'Connected to Aether_Coin CodeStar WebSocket Server'
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

// Add API health check endpoint
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

// Simple API endpoint for Aether_Coin status
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Aether_Coin CodeStar API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Handle SPA routes - serve index.html for client-side routing
const CLIENT_ROUTES = [
  '/',
  '/code-mood-meter',
  '/productivity',
  '/scroll-keeper',
  '/codestar',
  '/about'
];

app.get(CLIENT_ROUTES, (req, res) => {
  console.log(`SPA route handling for: ${req.path}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Aether_Coin server running on port ${PORT}`);
  console.log(`✓ Server URL: http://localhost:${PORT}`);
  console.log(`✓ Test page: http://localhost:${PORT}/test.html`);
  console.log(`✓ API health: http://localhost:${PORT}/api/health`);
  console.log(`✓ WebSocket: ws://localhost:${PORT}/ws`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
    console.log(`✓ REPLIT TEST PAGE: ${replitUrl}/test.html`);
    console.log(`✓ REPLIT API HEALTH: ${replitUrl}/api/health`);
  } else {
    console.log('\n⚠ Not running in a Replit environment, or missing environment variables.');
  }
});