/**
 * Minimal server for AI Freedom Trust Brand Showcase
 * This server is stripped of all quantum security and complex dependencies
 */
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000; // Use a different port to avoid conflicts

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Freedom Trust - Minimal Server</title>
        <style>
          body {
            font-family: sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .link {
            display: block;
            margin: 10px 0;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
            text-decoration: none;
            color: #333;
          }
          .link:hover {
            background-color: #e0e0e0;
          }
        </style>
      </head>
      <body>
        <h1>AI Freedom Trust - Minimal Server</h1>
        <p>This is a minimal server for testing the brand showcase without complex dependencies.</p>
        <a class="link" href="/brand-showcase">View Brand Showcase</a>
        <a class="link" href="/test">Simple Test Page</a>
      </body>
    </html>
  `);
});

// Brand showcase route
app.get('/brand-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'standalone-brand-showcase.html'));
});

// Simple test route
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'pure-test.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Minimal server running on port ${PORT}`);
  console.log(`✓ Root page: http://localhost:${PORT}/`);
  console.log(`✓ Brand showcase: http://localhost:${PORT}/brand-showcase`);
  console.log(`✓ Test page: http://localhost:${PORT}/test`);
  
  // Display Replit-specific URL information if applicable
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
  }
});