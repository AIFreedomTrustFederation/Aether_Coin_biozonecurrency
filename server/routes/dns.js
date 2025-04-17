/**
 * FractalDNS API Routes
 * Provides REST API for the FractalDNS system
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const dns = require('dns');
const net = require('net');
const { performance } = require('perf_hooks');
const FractalDnsServer = require('../dns/fractalDnsServer');

// Create FractalDNS server instance
const dnsServer = new FractalDnsServer();

// Start the DNS server when the application starts
// Note: In production, this would be configurable and possibly started separately
(async () => {
  try {
    await dnsServer.start();
    console.log('FractalDNS server started');
  } catch (error) {
    console.error('Failed to start FractalDNS server:', error);
  }
})();

// Handle clean shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down FractalDNS server...');
  await dnsServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down FractalDNS server...');
  await dnsServer.stop();
  process.exit(0);
});

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get server status
router.get('/status', asyncHandler(async (req, res) => {
  const stats = dnsServer.getStats();
  res.json({
    running: !!stats.startTime,
    uptime: stats.uptime,
    zones: stats.zones,
    records: stats.totalRequests,
    peers: stats.peers || 0
  });
}));

// Get all TLD zones
router.get('/zones', asyncHandler(async (req, res) => {
  const zones = dnsServer.getTldZones();
  res.json({ zones });
}));

// Get a specific zone
router.get('/zones/:tld', asyncHandler(async (req, res) => {
  const { tld } = req.params;
  
  // Get zone data
  const zone = dnsServer.zoneManager.getTldZone(tld);
  
  if (!zone) {
    return res.status(404).json({ error: `Zone not found: ${tld}` });
  }
  
  // Get records (reconstruct if sharded)
  let records = zone.records;
  
  if (zone.shardedRecords && zone.shards) {
    records = dnsServer.zoneManager.reconstructRecords(zone);
  }
  
  res.json({ zone, records });
}));

// Create a new zone
router.post('/zones', asyncHandler(async (req, res) => {
  const { tld } = req.body;
  
  if (!tld) {
    return res.status(400).json({ error: 'TLD is required' });
  }
  
  // Clean the TLD
  const cleanTld = tld.trim().toLowerCase().replace(/^\./, '');
  
  if (!cleanTld) {
    return res.status(400).json({ error: 'Invalid TLD' });
  }
  
  // Check TLD format
  if (!/^[a-z0-9-]+$/.test(cleanTld)) {
    return res.status(400).json({ error: 'TLD can only contain lowercase letters, numbers, and hyphens' });
  }
  
  try {
    // Create zone
    const zone = await dnsServer.zoneManager.createTldZone(cleanTld);
    
    res.status(201).json({ 
      message: `Zone "${cleanTld}" created successfully`, 
      zone 
    });
  } catch (error) {
    if (error.message.includes('Zone already exists')) {
      return res.status(409).json({ error: `Zone already exists: ${cleanTld}` });
    }
    
    console.error(`Failed to create zone: ${cleanTld}`, error);
    res.status(500).json({ error: 'Failed to create zone' });
  }
}));

// Delete a zone
router.delete('/zones/:tld', asyncHandler(async (req, res) => {
  const { tld } = req.params;
  
  try {
    // Delete zone
    await dnsServer.zoneManager.deleteTldZone(tld);
    
    res.json({ message: `Zone "${tld}" deleted successfully` });
  } catch (error) {
    if (error.message.includes('Zone not found')) {
      return res.status(404).json({ error: `Zone not found: ${tld}` });
    }
    
    console.error(`Failed to delete zone: ${tld}`, error);
    res.status(500).json({ error: 'Failed to delete zone' });
  }
}));

// Add a record to a zone
router.post('/zones/:tld/records', asyncHandler(async (req, res) => {
  const { tld } = req.params;
  const { domain, type, value, ttl, priority } = req.body;
  
  if (!domain || !type || !value) {
    return res.status(400).json({ error: 'Domain, type, and value are required' });
  }
  
  // Validate record type
  const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];
  if (!validTypes.includes(type.toUpperCase())) {
    return res.status(400).json({ error: `Invalid record type: ${type}` });
  }
  
  try {
    // Create record
    const record = {
      domain,
      type: type.toUpperCase(),
      value,
      ttl: ttl ? parseInt(ttl, 10) : undefined
    };
    
    // Add priority for MX records
    if (type.toUpperCase() === 'MX' && priority) {
      record.priority = parseInt(priority, 10);
    }
    
    // Add record to zone
    await dnsServer.zoneManager.addRecord(tld, record);
    
    res.status(201).json({ 
      message: `Record added successfully`, 
      record 
    });
  } catch (error) {
    if (error.message.includes('Zone not found')) {
      return res.status(404).json({ error: `Zone not found: ${tld}` });
    }
    
    console.error(`Failed to add record to zone: ${tld}`, error);
    res.status(500).json({ error: 'Failed to add record' });
  }
}));

// Delete a record from a zone
router.delete('/zones/:tld/records', asyncHandler(async (req, res) => {
  const { tld } = req.params;
  const { domain, type } = req.body;
  
  if (!domain || !type) {
    return res.status(400).json({ error: 'Domain and type are required' });
  }
  
  try {
    // Delete record
    await dnsServer.zoneManager.deleteRecord(tld, domain, type);
    
    res.json({ message: `Record deleted successfully` });
  } catch (error) {
    if (error.message.includes('Zone not found')) {
      return res.status(404).json({ error: `Zone not found: ${tld}` });
    }
    
    if (error.message.includes('Record not found')) {
      return res.status(404).json({ error: `Record not found: ${domain}.${tld} (${type})` });
    }
    
    console.error(`Failed to delete record from zone: ${tld}`, error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
}));

// Lookup a DNS record
router.get('/lookup', asyncHandler(async (req, res) => {
  const { domain, type } = req.query;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }
  
  try {
    // Default to A record if not specified
    const recordType = (type || 'A').toUpperCase();
    
    // Validate record type
    const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'ANY'];
    if (!validTypes.includes(recordType)) {
      return res.status(400).json({ error: `Invalid record type: ${recordType}` });
    }
    
    // Perform lookup
    const results = await dnsServer.zoneManager.lookupRecord(domain, recordType);
    
    res.json({ results });
  } catch (error) {
    console.error(`Failed to lookup record: ${domain}`, error);
    res.status(500).json({ error: 'Failed to lookup record' });
  }
}));

// Test domain resolution
router.get('/test', asyncHandler(async (req, res) => {
  const { domain } = req.query;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }
  
  try {
    // Test functionality by using standard DNS resolution
    // In a real implementation, this would test against the FractalDNS server
    const startTime = performance.now();
    
    // Resolve domain using standard DNS
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4(domain, (err, addresses) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(addresses);
      });
    });
    
    const endTime = performance.now();
    
    res.json({
      success: true,
      resolvedAddress: addresses[0],
      latency: Math.round(endTime - startTime)
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
}));

// Export zone to BIND format
router.get('/zones/:tld/export', asyncHandler(async (req, res) => {
  const { tld } = req.params;
  
  try {
    // Export zone
    const content = dnsServer.zoneManager.exportToBind(tld);
    
    res.json({ content });
  } catch (error) {
    if (error.message.includes('Zone not found')) {
      return res.status(404).json({ error: `Zone not found: ${tld}` });
    }
    
    console.error(`Failed to export zone: ${tld}`, error);
    res.status(500).json({ error: 'Failed to export zone' });
  }
}));

module.exports = router;