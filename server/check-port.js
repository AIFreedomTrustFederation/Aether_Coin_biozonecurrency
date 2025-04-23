/**
 * Simple port checker for Replit environment
 */

import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Replit port check: Server is working!');
});

server.listen(5000, '0.0.0.0', () => {
  console.log('Port check server running at http://0.0.0.0:5000/');
});