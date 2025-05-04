/**
 * Simple HTTP server for AI Freedom Trust Brand Showcase
 * This standalone server avoids any advanced middleware or proxying that might interfere with the feedback tool
 */
const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve our simplified brand ecosystem showcase
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/feedback-check.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Simple showcase server running on port ${PORT}`);
  console.log(`✓ Brand ecosystem overview available at http://localhost:${PORT}/`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
  }
});