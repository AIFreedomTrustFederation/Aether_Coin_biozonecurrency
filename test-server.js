import express from 'express';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Serve a simple HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Server</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f4f8;
        }
        .container {
          text-align: center;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: white;
        }
        h1 {
          color: #4f46e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Test Server</h1>
        <p>This is a simple test server to verify Replit connectivity.</p>
        <p>Server is running on port: ${PORT}</p>
        <p>Current time: ${new Date().toISOString()}</p>
        <p>Process ID: ${process.pid}</p>
      </div>
    </body>
    </html>
  `);
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`Replit URL: ${replitUrl}`);
  }
});