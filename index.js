/**
 * Main entry point for the Aether_Coin CodeStar Platform
 * This file determines which server to run based on environment
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
app.use(express.static(path.join(__dirname)));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Aether_Coin CodeStar Platform',
    timestamp: new Date().toISOString()
  });
});

// Simple API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', 
    server: 'Aether_Coin CodeStar API',
    api_version: '1.0.0',
    features: {
      productivity: true,
      codeMoodMeter: true,
      scrollKeeper: true
    },
    timestamp: new Date().toISOString()
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Aether_Coin CodeStar Platform running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`REPLIT URL: ${replitUrl}`);
  }
});