/**
 * Third Application Server
 * A simple Express server for the third application
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import config
import config from './config.js';

const app = express();
const PORT = process.env.PORT || config.thirdApp.port;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: config.thirdApp.name,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - Simple UI for the third application
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.thirdApp.name}</title>
      <style>
        :root {
          --primary: #1a1c3a;
          --primary-light: #2d307b;
          --secondary: #7857c5;
          --accent: #4e30c5;
          --light: #f8f9fa;
          --dark: #121224;
          --text: #e6e6fa;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: var(--primary);
          color: var(--text);
          margin: 0;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }
        
        h1 {
          background: linear-gradient(45deg, var(--secondary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          margin-bottom: 2rem;
          font-size: 2.5rem;
        }
        
        .card {
          background-color: var(--dark);
          border-radius: 0.5rem;
          padding: 2rem;
          max-width: 800px;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        
        .links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .link {
          background-color: var(--secondary);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.25rem;
          transition: background-color 0.3s ease;
        }
        
        .link:hover {
          background-color: var(--accent);
        }
        
        .footer {
          margin-top: 3rem;
          font-size: 0.9rem;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${config.thirdApp.name}</h1>
        <p>This is a simple Express server for the third application in the Aetherion Ecosystem.</p>
        <p>This server is running on port ${PORT} and is accessible through the main proxy server.</p>
        
        <div class="links">
          <a href="${config.mainServer.basePath}" class="link">Main Landing Page</a>
          <a href="${config.brandShowcase.basePath}" class="link">Brand Showcase</a>
          <a href="${config.aetherionWallet.basePath}" class="link">Aetherion Wallet</a>
          <a href="/api/health" class="link">API Health</a>
        </div>
      </div>
      
      <div class="footer">
        Aetherion Ecosystem | &copy; 2025 AI Freedom Trust
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Starting third app Express server on port ${PORT}`);
  console.log(`✓ Third app server running on port ${PORT}`);
  console.log(`✓ Access at http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down third app server...');
  process.exit();
});