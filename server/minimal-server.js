/**
 * Scroll Keeper Platform-Agnostic Server
 * 
 * A universal Express server that provides APIs for the Scroll Keeper functionality.
 * Designed for deployment to any platform including:
 * - FractalCoin nodes
 * - AICoin AetherCore services
 * - Standard hosting environments
 * 
 * This server implements WebSocket for real-time communication
 * and a RESTful API for data operations.
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStorage } from './storage.js';
import scrollKeeperRoutes from './routes/scroll-keeper-routes.js';
import scrollKeeperSearchRoutes from './routes/scroll-keeper-search.js';
import { extendStorageWithScrollKeeper } from './scroll-keeper-storage-extensions.js';

// Convert current file URL to directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a minimal Express server
const app = express();
// Use PORT from environment or default to standard port 5000
// This works on any platform, not tied to any specific hosting provider
const PORT = process.env.PORT || 5000;

// Create HTTP server for Express and WebSockets
const httpServer = createServer(app);

// Initialize storage
const storage = extendStorageWithScrollKeeper(createStorage());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/scrollkeeper', scrollKeeperRoutes);
app.use('/api/scrollkeeper/vector', scrollKeeperSearchRoutes);

// Server status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    message: 'Scroll Keeper minimal server is running',
    version: '1.0.0'
  });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Set up WebSocket server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Scroll Keeper WebSocket Server'
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle different message types
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        case 'subscribe':
          // Handle subscription to updates
          if (data.channel) {
            ws.subscribed = ws.subscribed || [];
            if (!ws.subscribed.includes(data.channel)) {
              ws.subscribed.push(data.channel);
              ws.send(JSON.stringify({
                type: 'subscribed',
                channel: data.channel,
                message: `Subscribed to ${data.channel}`
              }));
            }
          }
          break;
          
        default:
          console.log('Received message:', data);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Broadcast to all connected clients
function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Broadcast to clients subscribed to a specific channel
function broadcastToChannel(channel, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && 
        client.subscribed && 
        client.subscribed.includes(channel)) {
      client.send(JSON.stringify({
        ...message,
        channel
      }));
    }
  });
}

// Start the server - bind to all interfaces (0.0.0.0) for platform-agnostic deployment
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Scroll Keeper minimal server running on port ${PORT}`);
  console.log(`✓ API available at http://0.0.0.0:${PORT}/api`);
  console.log(`✓ WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
});