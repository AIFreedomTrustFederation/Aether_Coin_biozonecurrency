/**
 * Simple HTTP redirect server for Aetherion wallet application
 * Redirects port 5000 (expected by Replit) to port 5173 (used by Vite)
 */

import http from 'http';

const PORT = 5000;
const TARGET_URL = 'http://localhost:5173';

console.log(`Starting Aetherion Redirector Service`);
console.log(`Redirecting port ${PORT} to ${TARGET_URL}`);

// Create a simple HTTP server that redirects all requests to the Vite server
const server = http.createServer((req, res) => {
  const targetURL = `${TARGET_URL}${req.url}`;
  console.log(`Redirecting request from ${req.url} to ${targetURL}`);
  
  res.writeHead(302, {
    'Location': targetURL,
  });
  res.end();
});

server.listen(PORT, () => {
  console.log(`Redirect server running on port ${PORT}`);
  console.log(`All requests will be redirected to ${TARGET_URL}`);
});