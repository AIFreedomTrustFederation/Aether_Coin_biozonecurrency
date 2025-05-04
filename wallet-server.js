/**
 * Dedicated Aetherion Wallet Server
 * This server is focused solely on serving the Aetherion Wallet application
 * with complete Aetherion functionality instead of just the CodeStar Platform
 */

import express from 'express';
import { createServer } from 'http';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = 5174;

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors());

// Log requests
app.use((req, res, next) => {
  console.log(`Wallet Server Request: ${req.method} ${req.url}`);
  next();
});

// Set up API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Aetherion Wallet Server',
    version: '1.0.0',
    time: new Date().toISOString(),
    features: [
      'Quantum Security',
      'Multi-Wallet Support',
      'Fractal Explorer',
      'Blockchain Dashboard',
      'Brand Showcase'
    ]
  });
});

// Create handlers for various wallet features
app.get('/api/quantum-security/status', (req, res) => {
  res.json({
    quantumResistant: true,
    securityLevel: 'optimal',
    quantumState: 'coherent',
    score: 96,
    nodeCount: 42,
    fractalValidationLevels: {
      phi: 0.98,
      mandelbrot: 0.95
    },
    temporalCoherence: 0.97
  });
});

// Create a brand showcase entry
app.get('/showcase/brands', (req, res) => {
  const brands = [
    { id: 1, name: 'Aetherion', logo: '/public/aetherion-logo.svg', description: 'Quantum-resistant blockchain ecosystem' },
    { id: 2, name: 'FractalCoin', logo: '/public/fractalcoin-logo.svg', description: 'Advanced cryptocurrency with fractal validation technology' },
    { id: 3, name: 'Biozoe', logo: '/public/biozoe-logo.svg', description: 'Temporal life and eternal spirit blockchain platform' },
    { id: 4, name: 'AetherCoin', logo: '/public/aethercoin-logo.svg', description: 'Native currency of the Aetherion ecosystem' },
    { id: 5, name: 'Aether AI', logo: '/public/aether-ai-logo.svg', description: 'Quantum-enhanced artificial intelligence platform' }
  ];
  
  res.json({ brands });
});

// Serve static files from the wallet directory
app.use(express.static(path.join(__dirname, 'aetherion-wallet-v1.0.0')));

// Handler for the root endpoint to show our enhanced version
app.get('/', (req, res) => {
  console.log('Serving Aetherion Full System from wallet-server');
  // Set a flag in headers to know this is the full version not just CodeStar
  res.setHeader('X-Aetherion-Full-System', 'true');
  res.sendFile(path.join(__dirname, 'aetherion-wallet-v1.0.0', 'index.html'));
});

// Rewrite the client-side paths to work correctly with the application
app.use((req, res, next) => {
  // Don't rewrite for API requests or static assets
  if (req.path.startsWith('/api/') || 
      req.path.includes('.js') || 
      req.path.includes('.css') || 
      req.path.includes('.svg') || 
      req.path.includes('.png') || 
      req.path.includes('.jpg') || 
      req.path.includes('.json')) {
    return next();
  }
  
  // Add debugging information
  console.log(`Wallet server handling path: ${req.path}`);
  
  // Check for specific wallet routes we want to enhance
  if (req.path.startsWith('/wallet') || 
      req.path.startsWith('/quantum-security') || 
      req.path.startsWith('/fractal-explorer') || 
      req.path.startsWith('/multi-wallet') || 
      req.path.startsWith('/aethercoin') || 
      req.path.startsWith('/blockchain')) {
    console.log(`Serving specialized wallet route: ${req.path}`);
  }
  
  // Rewrite all other paths to index.html to support client-side routing
  res.sendFile(path.join(__dirname, 'aetherion-wallet-v1.0.0', 'index.html'));
});

console.log('Starting Enhanced Aetherion Wallet Server');

// Start the Express server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Enhanced Aetherion Wallet running on port ${PORT}`);
  console.log(`✓ Access at http://localhost:${PORT}`);
  console.log(`✓ APIs available at http://localhost:${PORT}/api/health`);
  
  // Display Replit-specific URL information
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    console.log(`✓ Replit URL: https://${replitSlug}-${PORT}.${replitOwner}.repl.co`);
  }
});