/**
 * Scroll Keeper Server Implementation
 * 
 * Integrated server that handles both API and UI for the Aetherion/Scroll Keeper system
 * Designed for Replit compatibility with proper handling of port forwarding
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const VITE_PORT = 5173;
const TARGET_URL = `http://localhost:${VITE_PORT}`;

// Add CORS middleware for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

console.log(`Starting Aetherion Integrated Server`);
console.log(`Main server on port ${PORT} proxying to Vite on port ${VITE_PORT}`);

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
        message: 'Connected to Scroll Keeper WebSocket Server'
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

// Simple API endpoint for Scroll Keeper status
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Scroll Keeper API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve a simple HTML page for direct testing
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Aetherion Server Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Aetherion Server is Running</h1>
        <p>This test page confirms that the Express server is operational.</p>
        <p>Status: <strong style="color: green;">Online</strong></p>
        <p>Server time: ${new Date().toLocaleString()}</p>
        <p><a href="/">Go to Main Application</a></p>
      </body>
    </html>
  `);
});

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Start the Vite server in a separate process
const startViteServer = () => {
  // Create a custom Vite config for Replit compatibility
  const tempConfigPath = path.join(__dirname, 'temp-vite.config.js');
  
  // Write a temporary server configuration for Vite
  const tempConfig = `
  import { defineConfig } from "vite";
  import { fileURLToPath } from "url";
  import path from "path";
  import react from "@vitejs/plugin-react";
  import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
  import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  export default defineConfig({
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    server: {
      port: ${VITE_PORT},
      host: '0.0.0.0',
      hmr: {
        // Enable HMR with Replit compatibility
        clientPort: ${PORT},
        port: ${VITE_PORT},
        host: 'localhost'
      },
      watch: {
        usePolling: true,
        interval: 1000,
      }
    },
  });
  `;
  
  fs.writeFileSync(tempConfigPath, tempConfig);
  
  // Start Vite with our custom config
  const viteProcess = spawn('npx', ['vite', '--config', tempConfigPath], {
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('error', (error) => {
    console.error(`Failed to start Vite server: ${error.message}`);
  });
  
  // Clean up temp config on exit
  process.on('exit', () => {
    try {
      fs.unlinkSync(tempConfigPath);
    } catch (err) {
      // Ignore error
    }
  });

  return viteProcess;
};

// Set up proxy options
const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    // Log only for non-asset requests to reduce noise
    if (!req.url.match(/\.(js|css|png|jpg|svg|ico|woff|woff2|ttf)$/)) {
      console.log(`Proxying ${req.method} ${req.url} to Vite`);
    }
  },
  onError: (err, req, res) => {
    console.error(`Proxy error: ${err.message}`);
    
    // Provide a helpful error page
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aetherion Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #c00; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>Proxy Error</h1>
          <p>The server encountered an error while connecting to the Vite development server:</p>
          <pre>${err.message}</pre>
          <p>Please check that the Vite server is running properly on port ${VITE_PORT}.</p>
          <p><a href="/test">Check Express Server Status</a></p>
        </body>
      </html>
    `);
  }
};

// Create proxy middleware
const viteProxyMiddleware = createProxyMiddleware(proxyOptions);

// Handle all frontend routes
app.use('/', viteProxyMiddleware);

// Start Vite server
const viteProcess = startViteServer();

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteProcess.kill();
  process.exit();
});

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Aetherion integrated server running on port ${PORT}`);
  console.log(`✓ Test page available at http://localhost:${PORT}/test`);
  console.log(`✓ WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`✓ Vite dev server running on port ${VITE_PORT}`);
});