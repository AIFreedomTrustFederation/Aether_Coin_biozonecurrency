/**
 * Main server routes
 */

const express = require('express');
const dnsRoutes = require('./dns');

const router = express.Router();

// API routes
router.use('/api/dns', dnsRoutes);

// Default route for API root
router.get('/api', (req, res) => {
  res.json({
    message: 'FractalDNS API',
    version: '1.0.0',
    endpoints: {
      dns: '/api/dns'
    }
  });
});

module.exports = router;