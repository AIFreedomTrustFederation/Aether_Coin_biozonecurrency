/**
 * Express server for AI Freedom Trust Framework
 */

import express from 'express';
import { createRouter, setupServer } from './routes';
import { storage } from './storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create and set up router
const router = createRouter(storage);
app.use(router);

// Set up WebSocket server
const { httpServer, wss, logWebSocketServer } = setupServer(app);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running at ws://localhost:${PORT}/ws`);
  console.log(`Log WebSocket server running at ws://localhost:${PORT}/ws/logs`);
});

// Export for testing
export { app, httpServer, wss, logWebSocketServer };