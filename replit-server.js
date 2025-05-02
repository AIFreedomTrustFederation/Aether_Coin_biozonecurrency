/**
 * Specialized Express server for Replit webview integration
 * This server is designed to work specifically with Replit's webview
 * by serving content directly on the expected port and addressing
 * common Replit-specific connectivity issues.
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Enable CORS for all origins
app.use(cors({ origin: '*' }));

// Body parser middleware
app.use(express.json());

// Connect the WebSocket server directly to the HTTP server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', function connection(ws) {
  console.log('WebSocket client connected');
  
  ws.on('message', function incoming(message) {
    console.log('Received message:', message.toString());
    ws.send(JSON.stringify({ type: 'echo', message: message.toString() }));
  });
  
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket Server' }));
});

// Import our API modules from the unified api-modules.js
import { registerApiModules } from './api-modules.js';

// Register our API modules instead of redefining them
(async () => {
  try {
    await registerApiModules(app);
    console.log('✓ API modules registered successfully');
  } catch (error) {
    console.error('Error registering API modules:', error);
  }
})();

// Create a simple landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// Serve static files from client directory (for testing)
app.use(express.static(path.join(__dirname, 'client')));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Replit-optimized server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/brands`);
});