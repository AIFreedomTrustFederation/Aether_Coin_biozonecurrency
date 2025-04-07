/**
 * Simple Express server to handle redirects to the new domain
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, 'client')));

// Redirect all routes to the same path on the new domain
app.get('*', (req, res) => {
  // Check if it's a direct file request
  if (req.path.includes('.')) {
    // Serve 404.html for any missing files
    res.sendFile(path.join(__dirname, 'client', '404.html'));
  } else {
    // For all other paths, redirect to the new domain's root
    res.redirect(301, 'https://atc.aifreedomtrust.com/wallet');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AetherCoin redirect server running at http://0.0.0.0:${PORT}`);
});