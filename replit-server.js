/**
 * Specialized Express server for Replit webview integration
 * This server is designed to work specifically with Replit's webview
 * by serving content directly on the expected port and addressing
 * common Replit-specific connectivity issues.
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

// Get Replit-specific ports from environment
const PORT = process.env.PORT || 3000; 

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Add verbose request logging for debugging
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log request details
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Completed ${res.statusCode} in ${duration}ms`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Enable CORS with specific headers for Replit
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve static files from 'public' directory - high priority
app.use(express.static(path.join(__dirname, 'public')));

// Create a basic index.html if it doesn't exist
const indexPath = path.join(__dirname, 'public', 'index.html');
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

// Create a basic index.html if it doesn't exist
if (!fs.existsSync(indexPath)) {
  const basicHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether_Coin CodeStar Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #041e3c, #0b3561);
      color: white;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      background: rgba(15, 35, 75, 0.8);
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    h1 {
      font-size: 2.4rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #41e0fd, #9b83fc);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .btn {
      display: inline-block;
      background: linear-gradient(90deg, #41e0fd, #9b83fc);
      color: #fff;
      padding: 12px 24px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      margin: 15px 0;
      border: none;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    .api-status {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      text-align: left;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Aether_Coin CodeStar Platform</h1>
    <p>Welcome to the CodeStar development environment. This simplified interface provides access to testing tools and API endpoints.</p>
    
    <a href="/test" class="btn">Open Test Page</a>
    
    <div class="api-status">
      <h3>API Status</h3>
      <div id="status-output">Click the button below to check API status</div>
      <button id="check-api" class="btn">Check API Status</button>
    </div>
  </div>

  <script>
    document.getElementById('check-api').addEventListener('click', async () => {
      const output = document.getElementById('status-output');
      output.textContent = 'Checking API status...';
      
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        output.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        output.textContent = 'Error: ' + error.message;
      }
    });
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(indexPath, basicHtml);
  console.log('Created basic index.html for Replit webview');
}

// Create WebSocket server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', function connection(ws) {
  console.log('Client connected to WebSocket');
  
  ws.on('message', function incoming(message) {
    console.log('Received message:', message.toString());
    
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

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Add API health check endpoint
app.get('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
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
});

// Simple API endpoint for status
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Aether_Coin CodeStar API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve test.html
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Add root path fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== REPLIT-OPTIMIZED SERVER ===`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Access URL: http://localhost:${PORT}`);
  console.log(`✓ Test page: http://localhost:${PORT}/test`);
  console.log(`✓ API health: http://localhost:${PORT}/api/health`);
  console.log(`✓ WebSocket: ws://localhost:${PORT}/ws`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n=== REPLIT ENVIRONMENT DETECTED ===`);
    console.log(`✓ REPLIT URL: ${replitUrl}`);
    console.log(`✓ REPLIT TEST PAGE: ${replitUrl}/test`);
    console.log(`✓ REPLIT API HEALTH: ${replitUrl}/api/health`);
  }
});