/**
 * Ultra-Simple Standalone Server for Replit Webview
 * This server does one thing and does it well: serves static content that works with Replit
 */

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration - use Replit's default port
const PORT = 3000;

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Serve static content
app.use(express.static(path.join(__dirname, 'public')));

// Create simple index.html in the root folder
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether_Coin CodeStar Platform</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #041e3c, #0b3561);
      color: white;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 800px;
      padding: 2rem;
      background: rgba(15, 35, 75, 0.8);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #41e0fd, #9b83fc);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      text-align: left;
    }
    .api-check {
      background: rgba(0, 0, 0, 0.3);
      padding: 1rem;
      border-radius: 8px;
      font-family: monospace;
      margin-top: 1.5rem;
      text-align: left;
      min-height: 80px;
    }
    .btn {
      background: linear-gradient(90deg, #41e0fd, #9b83fc);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 0.5rem;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top: 3px solid white;
      animation: spin 1s linear infinite;
      margin-left: 0.5rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .feature {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    .feature:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    .feature h3 {
      color: #9b83fc;
      margin-top: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Aether_Coin CodeStar Platform</h1>
    <p>Welcome to the CodeStar development environment powered by Aether_Coin blockchain technology.</p>
    
    <div class="features">
      <div class="feature">
        <h3>Code Complexity Analysis</h3>
        <p>Visualize and optimize your codebase complexity with AI-powered insights.</p>
      </div>
      <div class="feature">
        <h3>Developer Productivity</h3>
        <p>Track and enhance your development workflow with custom metrics.</p>
      </div>
      <div class="feature">
        <h3>Blockchain Integration</h3>
        <p>Seamlessly connect to the Aether_Coin network for decentralized applications.</p>
      </div>
    </div>
    
    <div class="card">
      <h2>API Connectivity Check</h2>
      <p>Verify that the CodeStar API endpoints are accessible:</p>
      <button id="check-api" class="btn">Check API Status</button>
      <div id="api-status" class="api-check">API status will appear here...</div>
    </div>
  </div>

  <script>
    document.getElementById('check-api').addEventListener('click', async () => {
      const statusDiv = document.getElementById('api-status');
      statusDiv.innerHTML = 'Checking API...<div class="loading"></div>';
      
      try {
        // First try the direct API endpoint
        const response = await fetch('/api/health');
        const data = await response.json();
        
        statusDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        statusDiv.style.color = '#4caf50';
      } catch (error) {
        // If direct API fails, show information about the server
        try {
          statusDiv.innerHTML = 'Fetching server info...';
          
          const info = {
            status: 'online',
            message: 'Server is running but API endpoints may be on a different port',
            server_type: 'Static HTML Server',
            timestamp: new Date().toISOString(),
            guide: 'Try accessing API directly at https://workspace.aifreedomtrust.repl.co/api/health'
          };
          
          statusDiv.innerHTML = '<pre>' + JSON.stringify(info, null, 2) + '</pre>';
          statusDiv.style.color = '#ff9800';
        } catch (secondError) {
          statusDiv.innerHTML = 'Error: ' + error.message;
          statusDiv.style.color = '#f44336';
        }
      }
    });
  </script>
</body>
</html>
`;

// Ensure public directory exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

// Write the HTML file to both locations for maximum compatibility
fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), htmlContent);
fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'simple-webview-server',
    timestamp: new Date().toISOString()
  });
});

// Simple API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', 
    server: 'simple-webview-server',
    api_version: '1.0.0',
    features: {
      productivity: true,
      codeMoodMeter: true
    },
    timestamp: new Date().toISOString()
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple Webview Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`REPLIT URL: ${replitUrl}`);
  }
});