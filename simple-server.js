/**
 * Ultra-simplified Server for Aetherion Development
 * 
 * This server is optimized for use in a separate workflow to allow
 * development without interfering with the main server processes.
 * 
 * Features:
 * - Simple proxy from port 3000 to Vite's port 5173
 * - Minimal error handling and logging
 * - Clean separation from main server process
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

// Basic setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000; // Use a different port to avoid conflicts
const VITE_PORT = 5173;
const VITE_URL = `http://localhost:${VITE_PORT}`;

console.log('Starting development server for Aetherion');
console.log('This server is independent from the main process');

// Add a diagnostic page
app.get('/dev-status', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Aetherion Dev Server Status</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          h1 { color: #3050C0; }
          .status { padding: 15px; background: #e8f4fc; border-radius: 4px; margin: 20px 0; }
          .success { color: #2c7;  }
          pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Aetherion Development Server</h1>
        <div class="status">
          <p><strong>Status:</strong> <span class="success">Running</span></p>
          <p><strong>Dev Server Port:</strong> ${PORT}</p>
          <p><strong>Vite Port:</strong> ${VITE_PORT}</p>
          <p><strong>Server Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/">Go to Application</a></li>
          <li><a href="/test">Run Connectivity Tests</a></li>
        </ul>
        
        <h2>Development Notes</h2>
        <p>This server is running in a separate workflow to avoid conflicts with the main application server.
        Changes made here will need to be synced with the main repository periodically.</p>
      </body>
    </html>
  `);
});

// Serve our diagnostic test page from the root folder
app.get('/test', (req, res) => {
  try {
    const testPage = path.join(__dirname, 'test.html');
    if (fs.existsSync(testPage)) {
      res.sendFile(testPage);
    } else {
      res.send(`Test page not found. Please create test.html in the root directory.`);
    }
  } catch (err) {
    console.error('Error serving test page:', err);
    res.status(500).send('Error loading test page');
  }
});

// Start Vite in development mode
const viteProcess = spawn('npx', ['vite', '--port', VITE_PORT, '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

// Set up proxy middleware - simplified for reliability
const proxy = createProxyMiddleware({
  target: VITE_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Dev Server Error</h1>
      <p>Could not connect to Vite server at ${VITE_URL}</p>
      <p>Error: ${err.message}</p>
      <p><a href="/dev-status">Check dev server status</a></p>
    `);
  }
});

// Use the proxy for all requests except our status pages
app.use((req, res, next) => {
  if (req.path === '/dev-status' || req.path === '/test') {
    return next();
  }
  return proxy(req, res, next);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Development server running on http://localhost:${PORT}`);
  console.log(`✓ Status page available at http://localhost:${PORT}/dev-status`);
  console.log(`✓ Test page available at http://localhost:${PORT}/test`);
  console.log(`✓ Proxying to Vite at ${VITE_URL}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down development server...');
  viteProcess.kill();
  process.exit();
});