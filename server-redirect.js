/**
 * Express server to host the Aetherion UI Wallet application
 * Can be deployed to a traditional web hosting environment
 * Configured to serve the application at atc.aifreedomtrust.com/wallet or atc.aifreedomtrust.com/dapp
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Add basic security headers
app.use(helmet({
  contentSecurityPolicy: false, // We'll configure this manually if needed
  crossOriginEmbedderPolicy: false, // Allow loading resources from different origins
}));

// Add custom security headers
app.use((req, res, next) => {
  // Set strict HTTPS transport security with long duration
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Parse JSON requests
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Serve static files from the 'dist' directory (production build) for both paths
app.use('/wallet', express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true,
}));

app.use('/dapp', express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online', server: 'aetherion-redirect' });
});

// For API requests, pass to the appropriate handler
app.use('/wallet/api', async (req, res, next) => {
  // Import the API router from the server
  try {
    // Check if the API router file exists
    const apiPath = path.join(__dirname, 'dist', 'index.js');
    if (!fs.existsSync(apiPath)) {
      console.error(`API file not found at ${apiPath}`);
      return res.status(500).json({ error: 'API not available' });
    }
    
    const { router } = await import('./dist/index.js');
    if (typeof router !== 'function') {
      console.error('API router is not a function');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    router(req, res, next);
  } catch (error) {
    console.error('API router error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Also handle API requests for the /dapp path
app.use('/dapp/api', async (req, res, next) => {
  try {
    // Check if the API router file exists
    const apiPath = path.join(__dirname, 'dist', 'index.js');
    if (!fs.existsSync(apiPath)) {
      console.error(`API file not found at ${apiPath}`);
      return res.status(500).json({ error: 'API not available' });
    }
    
    const { router } = await import('./dist/index.js');
    if (typeof router !== 'function') {
      console.error('API router is not a function');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    router(req, res, next);
  } catch (error) {
    console.error('API router error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// For all other routes under /wallet, serve the index.html to support client-side routing
app.get('/wallet', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run npm run build first.');
  }
});

app.get('/wallet/*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run npm run build first.');
  }
});

// For all other routes under /dapp, serve the index.html to support client-side routing
app.get('/dapp', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run npm run build first.');
  }
});

app.get('/dapp/*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run npm run build first.');
  }
});

// Root redirect to /dapp for convenience
app.get('/', (req, res) => {
  res.redirect('/dapp');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aetherion UI Wallet running at http://0.0.0.0:${PORT}/dapp`);
  console.log(`Alternative path available at http://0.0.0.0:${PORT}/wallet`);
  console.log(`For custom domain deployment at https://atc.aifreedomtrust.com/dapp`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});