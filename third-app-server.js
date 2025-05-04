/**
 * Simple Express Server for the Third Application
 * 
 * This server serves the Aetherion Wallet files as a static site
 * without starting a Vite dev server to avoid port conflicts.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5175;

console.log(`Starting third app Express server on port ${PORT}`);

// Serve static files
app.use(express.static(path.join(__dirname, 'aetherion-wallet-v1.0.0')));

// Serve client assets
app.use(express.static(path.join(__dirname, 'aetherion-wallet-v1.0.0', 'client')));

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online',
    service: 'third-app-server',
    timestamp: new Date().toISOString()
  });
});

// All routes should go to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'aetherion-wallet-v1.0.0', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Third app server running on port ${PORT}`);
  console.log(`✓ Access at http://localhost:${PORT}`);
});