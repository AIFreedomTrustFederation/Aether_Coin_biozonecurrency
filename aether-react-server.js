/**
 * Aether_Coin React Application Server
 * 
 * This server serves the React application for Aether_Coin and handles API requests.
 * It's designed to work with the client/src directory structure and ensures proper
 * client-side routing for React Router.
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create express app and HTTP server
const app = express();
const server = createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Development-specific middleware
if (process.env.NODE_ENV !== 'production') {
  // Proxy API requests to the Vite dev server
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
  }));

  // Proxy static and all other requests to the Vite dev server
  app.use('*', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
  }));
} else {
  // Production: Serve static files from the dist directory
  app.use(express.static(join(__dirname, 'dist')));

  // Handle API endpoints here
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Always return the main index.html for client-side routing to work properly
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Aether_Coin React server running on port ${PORT}`);
  console.log(`✓ Open http://localhost:${PORT} in your browser`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('✓ Development mode: Proxying to Vite dev server');
  }
});