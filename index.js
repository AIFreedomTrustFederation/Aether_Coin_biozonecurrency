/**
 * Main entry point for the Aetherion Ecosystem
 * 
 * This file determines which server to run based on environment
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Use port 5000 for Replit workflow compatibility
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'client/public')));

// Basic route with embedded HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aetherion Ecosystem</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .container {
          max-width: 1000px;
          padding: 2rem;
          text-align: center;
        }
        h1 {
          font-size: 3rem;
          background: linear-gradient(45deg, #818cf8, #a5b4fc);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #94a3b8;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .card {
          background: rgba(30, 41, 59, 0.8);
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 800px;
        }
        .status-badge {
          display: inline-block;
          background-color: #10b981;
          color: white;
          font-size: 0.9rem;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          margin-left: 0.5rem;
          vertical-align: middle;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #94a3b8;
        }
        .info-value {
          color: #e2e8f0;
          font-weight: bold;
        }
        .button-row {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }
        .button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #6366f1, #4f46e5);
          color: white;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Aetherion Ecosystem</h1>
        <div class="subtitle">Quantum-Resistant Blockchain Platform</div>
        
        <div class="card">
          <h2>Server Status <span class="status-badge">Online</span></h2>
          
          <div class="info-row">
            <span class="info-label">Server Port:</span>
            <span class="info-value">${PORT}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Node Version:</span>
            <span class="info-value">${process.version}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Current Time:</span>
            <span class="info-value">${new Date().toLocaleString()}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Environment:</span>
            <span class="info-value">${process.env.NODE_ENV || 'development'}</span>
          </div>
          
          <div class="button-row">
            <a href="/status" class="button">View System Status</a>
            <a href="/api/health" class="button">API Health Check</a>
          </div>
        </div>
        
        <p style="color: #94a3b8; margin-top: 2rem;">
          &copy; 2025 AI Freedom Trust | Aetherion Quantum Ecosystem
        </p>
      </div>
      
      <script>
        // Simple script to update the current time every second
        setInterval(() => {
          const timeElement = document.querySelector('.info-row:nth-child(3) .info-value');
          if (timeElement) {
            timeElement.textContent = new Date().toLocaleString();
          }
        }, 1000);
      </script>
    </body>
    </html>
  `);
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Status page route
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/status.html'));
});

// Default routing for other paths
app.get('*', (req, res) => {
  res.redirect('/');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aetherion Ecosystem server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`Replit URL: ${replitUrl}`);
  }
});