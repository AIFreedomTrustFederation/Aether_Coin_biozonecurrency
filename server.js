/**
 * Simple HTTP redirect server for Aetherion wallet application
 * Redirects port 5000 (expected by Replit) to port 5173 (used by Vite)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port to listen on (Replit expected port)
const PORT = 5000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set redirect headers
  const redirectUrl = `http://${req.headers.host.replace(/:[0-9]+/, ':5173')}${req.url}`;
  
  // Redirect to Vite server
  res.writeHead(302, {
    'Location': redirectUrl
  });
  
  res.end(`Redirecting to Vite server at ${redirectUrl}`);
});

// Listen on port 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Aetherion redirect server is running on port ${PORT}`);
  console.log(`Forwarding all traffic to Vite server on port 5173`);
  
  // Create a "ready" file that Replit can detect to know the server is up
  fs.writeFileSync(path.join(__dirname, '.port-ready'), 'Server is ready');
});