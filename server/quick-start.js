/**
 * Quick Start Server
 * 
 * This file creates a minimal Express server that starts quickly,
 * then spawns the full application server in the background.
 * This is used to get around Replit's 20-second timeout for workflow startup.
 */

import express from 'express';
import { spawn } from 'child_process';
import path from 'path';

// Create a minimal express app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve a simple status page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Freedom Trust Framework - Initializing</title>
        <meta http-equiv="refresh" content="5">
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000;
            color: #eee;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
          }
          h1 { color: #aefaef; }
          .loading {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 80px;
          }
          .loading div {
            position: absolute;
            border: 4px solid #aefaef;
            opacity: 1;
            border-radius: 50%;
            animation: loading 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          }
          .loading div:nth-child(2) {
            animation-delay: -0.5s;
          }
          @keyframes loading {
            0% {
              top: 36px;
              left: 36px;
              width: 0;
              height: 0;
              opacity: 0;
            }
            4.9% {
              top: 36px;
              left: 36px;
              width: 0;
              height: 0;
              opacity: 0;
            }
            5% {
              top: 36px;
              left: 36px;
              width: 0;
              height: 0;
              opacity: 1;
            }
            100% {
              top: 0px;
              left: 0px;
              width: 72px;
              height: 72px;
              opacity: 0;
            }
          }
          .status {
            margin-top: 2rem;
            padding: 1rem;
            background: #111;
            border-radius: 8px;
          }
          .status p {
            margin: 0.5rem 0;
          }
          .check {
            color: #4eff8f;
          }
          .pending {
            color: #ffcb6b;
          }
        </style>
      </head>
      <body>
        <h1>AI Freedom Trust Framework</h1>
        <p>The system is initializing. This page will refresh automatically.</p>
        
        <div class="loading"><div></div><div></div></div>
        
        <div class="status">
          <p class="check">✓ Quick start server ready</p>
          <p class="pending">→ Initializing main application server</p>
          <p class="pending">→ Preparing Scroll Keeper functionality</p>
        </div>
      </body>
    </html>
  `);
});

// API routes to indicate status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'initializing',
    message: 'Application server is starting up...',
    ready: false
  });
});

// Start the quick server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Quick start server running on port ${PORT}`);
  
  // Start the main server in the background
  setTimeout(() => {
    console.log('Starting main application server...');
    
    // Spawn the main server as a separate process using a different approach
    // First, compile the TypeScript file with our custom config
    const tsc = spawn('npx', ['tsc', '-p', './server/tsconfig-build.json'], {
      stdio: 'inherit'
    });
    
    tsc.on('exit', () => {
      console.log('TypeScript compiled, starting main server...');
      
      // Then run the compiled JavaScript
      const mainServer = spawn('node', ['./server/dist/server/index.js'], {
        stdio: 'inherit',
        env: { ...process.env, QUICK_START: 'true' }
      });
      
      mainServer.on('error', (err) => {
        console.error('Failed to start main server:', err);
      });
    });
  }, 2000); // Wait 2 seconds before starting the main server
});