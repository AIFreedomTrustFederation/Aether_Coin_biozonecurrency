import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Replit typically expects apps to run on port 3000 by default
const PORT = process.env.PORT || 3000;

// Serve static files from client/public
app.use(express.static(path.join(__dirname, 'client/public')));

// Basic HTML response for the root
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
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          margin: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #a5b4fc;
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        p {
          color: #94a3b8;
          font-size: 1.2rem;
          margin-bottom: 20px;
        }
        .card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .status {
          display: inline-block;
          background-color: #10b981;
          color: white;
          font-size: 0.8rem;
          padding: 5px 10px;
          border-radius: 20px;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Aetherion Ecosystem</h1>
        <p>Quantum-Resistant Blockchain Platform</p>
        
        <div class="card">
          <h2>Server Status <span class="status">Online</span></h2>
          <p>This is a simplified server for demonstration purposes. The main Aetherion Ecosystem services are currently being configured.</p>
          <p>Server running on port: ${PORT}</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`Replit URL: ${replitUrl}`);
  }
});