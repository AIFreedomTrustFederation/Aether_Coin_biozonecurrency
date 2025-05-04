/**
 * Simplified Server for AI Freedom Trust Brand Showcase
 * This standalone server avoids the quantum security and fractalcoin systems
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = 3000;
const app = express();

// Enable CORS
app.use(cors({
  origin: '*'
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/public')));

// Log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// API health endpoint without quantum security
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    environment: 'simplified',
    timestamp: new Date().toISOString()
  });
});

// Simple brands endpoint
app.get('/api/brands', (req, res) => {
  res.json({
    brands: [
      {
        name: "Aether Coin",
        subdomain: "atc",
        description: "Quantum-resistant utility token"
      },
      {
        name: "FractalCoin",
        subdomain: "fractalcoin",
        description: "Fractal-based economic scaling"
      },
      {
        name: "Biozoe",
        subdomain: "biozoe",
        description: "Temporal life & eternal spirit"
      },
      {
        name: "AI Freedom Trust",
        subdomain: "ai",
        description: "AI for freedom & truth"
      }
    ]
  });
});

// Serve test HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/test.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Simplified server running at http://localhost:${PORT}`);
  console.log(`✓ Test page available at http://localhost:${PORT}/`);
  console.log(`✓ Brands API available at http://localhost:${PORT}/api/brands`);
  
  // Display Replit URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    const replitUrl = `https://${replitSlug}.${replitOwner}.repl.co`;
    console.log(`\n✓ REPLIT URL: ${replitUrl}`);
  }
});