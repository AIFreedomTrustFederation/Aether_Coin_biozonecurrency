/**
 * Express server to host the Aetherion UI Wallet application
 * Can be deployed to a traditional web hosting environment
 * Configured to serve the application at atc.aifreedomtrust.com/wallet
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory (production build)
app.use('/wallet', express.static(path.join(__dirname, 'dist')));

// For API requests, pass to the appropriate handler
app.use('/wallet/api', (req, res, next) => {
  // Import the API router from the server
  try {
    const apiRouter = require('./server').router;
    apiRouter(req, res, next);
  } catch (error) {
    console.error('API router error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// For all other routes under /wallet, serve the index.html to support client-side routing
app.get('/wallet/*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Please run npm run build first.');
  }
});

// Root redirect to /wallet for convenience
app.get('/', (req, res) => {
  res.redirect('/wallet');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aetherion UI Wallet running at http://0.0.0.0:${PORT}/wallet`);
  console.log(`For custom domain deployment at https://atc.aifreedomtrust.com/wallet`);
});