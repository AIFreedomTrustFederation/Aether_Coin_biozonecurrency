/**
 * Simple Express server for Replit environment
 * This serves the static HTML files and proxies API requests
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

// Get directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create app
const app = express();
// Use PORT from environment or default to 5000 for platform independence
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    message: 'Simple server is running',
    version: '1.0.0'
  });
});

// Start the server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`✅ Simple server running at http://localhost:${port}`);
});