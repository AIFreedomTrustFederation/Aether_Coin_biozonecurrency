/**
 * FractalDNS Server
 * A decentralized, quantum-resistant DNS server for the FractalCoin ecosystem
 * 
 * Core features:
 * - Custom TLD (.trust, .aether) resolution
 * - Integration with traditional DNS
 * - Quantum-resistant cryptography
 * - Distributed record storage with fractal sharding
 */

const dns = require('dns');
const dgram = require('dgram');
const crypto = require('crypto');
const { Buffer } = require('buffer');
const config = require('./config');
const { validateDNSPacket, createDNSResponse } = require('./utils/dnsUtils');
const { encryptRecord, decryptRecord } = require('./utils/cryptoUtils');
const { getRecordFromStorage, storeRecordInStorage } = require('./storage/recordStorage');
const { generateMerkleProof } = require('./utils/merkleUtils');
const { logQuery, recordMetrics } = require('./utils/metricsUtils');
const { syncWithNetwork } = require('./network/peerSync');

// Create UDP server for DNS queries
const server = dgram.createSocket('udp4');

// Track active nodes in the network
let activePeers = new Map();

// Initialize the server
server.on('listening', () => {
  const address = server.address();
  console.log(`FractalDNS server listening on ${address.address}:${address.port}`);
  
  // Start peer discovery and sync
  initializePeerNetwork();
  
  // Start periodic tasks
  startPeriodicTasks();
});

// Handle incoming DNS queries
server.on('message', async (msg, rinfo) => {
  try {
    // Log incoming query
    logQuery(rinfo, msg);
    
    // Validate and parse DNS packet
    const query = validateDNSPacket(msg);
    if (!query) {
      console.error('Invalid DNS packet received');
      return;
    }
    
    // Extract the domain from query
    const domain = query.questions[0].name.toLowerCase();
    const recordType = query.questions[0].type;
    
    console.log(`Received query for ${domain} (${getRecordTypeName(recordType)})`);
    
    // Process the query
    const response = await processQuery(domain, recordType, query);
    
    // Send response back to client
    server.send(response, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error('Error sending DNS response:', err);
      }
    });
    
    // Record metrics for this query
    recordMetrics(domain, recordType, 'success');
  } catch (error) {
    console.error('Error processing DNS query:', error);
    
    // Record error metrics
    recordMetrics(null, null, 'error', error.message);
  }
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

/**
 * Process a DNS query
 * @param {string} domain - The domain being queried
 * @param {number} recordType - The DNS record type being requested
 * @param {Object} query - The original DNS query packet
 * @returns {Buffer} - DNS response packet
 */
async function processQuery(domain, recordType, query) {
  // Check if this is a FractalCoin custom TLD
  const tld = domain.split('.').pop();
  
  if (config.customTlds.includes(tld)) {
    // Handle custom TLD resolution
    return await handleCustomTldQuery(domain, recordType, query);
  } else {
    // Handle traditional DNS resolution with potential quantum protection
    return await handleTraditionalDnsQuery(domain, recordType, query);
  }
}

/**
 * Handle resolution for custom TLDs (.trust, .aether, etc)
 */
async function handleCustomTldQuery(domain, recordType, query) {
  try {
    // Get record from our distributed storage
    const record = await getRecordFromStorage(domain, recordType);
    
    if (!record) {
      // No record found, return NXDOMAIN
      return createDNSResponse(query, [], 3); // NXDOMAIN status
    }
    
    // Decrypt record if it's encrypted
    let recordData = record;
    if (record.encryption) {
      recordData = await decryptRecord(record);
    }
    
    // For quantum-secure records, generate proof of authenticity
    let proof = null;
    if (record.quantumSecure) {
      proof = await generateMerkleProof(domain, record);
      // Attach proof to the response (implementation depends on your protocol)
    }
    
    // Create response with the record data
    return createDNSResponse(query, [recordData], 0, proof); // 0 = No error
  } catch (error) {
    console.error(`Error handling custom TLD query for ${domain}:`, error);
    return createDNSResponse(query, [], 2); // Server failure
  }
}

/**
 * Handle resolution for traditional DNS domains with potential quantum protection
 */
async function handleTraditionalDnsQuery(domain, recordType, query) {
  return new Promise((resolve) => {
    // First check our cache
    const cachedRecord = getRecordFromStorage(domain, recordType)
      .catch(() => null); // Ignore errors for cache lookup
      
    if (cachedRecord) {
      resolve(createDNSResponse(query, [cachedRecord], 0));
      return;
    }
    
    // If not in cache, forward to traditional DNS
    dns.resolve(domain, getRecordTypeName(recordType), (err, addresses) => {
      if (err) {
        // Handle DNS error
        const errorCode = getErrorCode(err);
        resolve(createDNSResponse(query, [], errorCode));
        return;
      }
      
      // Format the records properly
      const records = formatTraditionalRecords(domain, recordType, addresses);
      
      // Store in our system for caching
      records.forEach(record => {
        storeRecordInStorage(record).catch(console.error);
      });
      
      // Return response
      resolve(createDNSResponse(query, records, 0));
    });
  });
}

/**
 * Initialize the peer-to-peer network for distributed DNS
 */
function initializePeerNetwork() {
  // Discover and connect to other nodes in the network
  const knownPeers = config.seedNodes || [];
  
  console.log(`Initializing peer network with ${knownPeers.length} seed nodes`);
  
  knownPeers.forEach(peer => {
    connectToPeer(peer)
      .then(success => {
        if (success) {
          console.log(`Connected to peer: ${peer.host}:${peer.port}`);
          activePeers.set(`${peer.host}:${peer.port}`, peer);
        }
      })
      .catch(err => {
        console.error(`Failed to connect to peer ${peer.host}:${peer.port}:`, err);
      });
  });
}

/**
 * Connect to a peer node
 */
async function connectToPeer(peer) {
  try {
    // Implementation would depend on your specific protocol
    // This is a placeholder for actual connection logic
    const connection = { host: peer.host, port: peer.port, status: 'connected' };
    
    // Start record synchronization
    syncWithNetwork([connection]);
    
    return true;
  } catch (error) {
    console.error(`Error connecting to peer ${peer.host}:${peer.port}:`, error);
    return false;
  }
}

/**
 * Start periodic maintenance tasks
 */
function startPeriodicTasks() {
  // Sync records with the network periodically
  setInterval(() => {
    syncWithNetwork(Array.from(activePeers.values()));
  }, config.syncInterval || 300000); // Default: 5 minutes
  
  // Check and refresh peer connections
  setInterval(() => {
    refreshPeerConnections();
  }, config.peerRefreshInterval || 600000); // Default: 10 minutes
  
  // Clean up expired records
  setInterval(() => {
    cleanExpiredRecords();
  }, config.cleanupInterval || 3600000); // Default: 1 hour
}

/**
 * Refreshes connections to peers
 */
function refreshPeerConnections() {
  console.log(`Refreshing peer connections (active peers: ${activePeers.size})`);
  
  // Check existing connections
  activePeers.forEach((peer, id) => {
    // Check if peer is still responsive
    checkPeerStatus(peer)
      .then(isActive => {
        if (!isActive) {
          console.log(`Peer ${id} is no longer responsive, removing`);
          activePeers.delete(id);
        }
      })
      .catch(err => {
        console.error(`Error checking peer ${id}:`, err);
        activePeers.delete(id);
      });
  });
  
  // Discover new peers if needed
  if (activePeers.size < config.minPeers) {
    console.log(`Active peers (${activePeers.size}) below minimum threshold (${config.minPeers}), discovering new peers`);
    discoverNewPeers();
  }
}

/**
 * Check if a peer is still active
 */
async function checkPeerStatus(peer) {
  // Implementation depends on your protocol
  // This is a placeholder
  return true;
}

/**
 * Discover new peers to connect to
 */
function discoverNewPeers() {
  // Implementation depends on your discovery mechanism
  // This could use a variety of methods:
  // - DHT (Distributed Hash Table)
  // - Hardcoded bootstrap nodes
  // - DNS seeds
  // - etc.
}

/**
 * Remove expired records from storage
 */
function cleanExpiredRecords() {
  // Implementation depends on your storage system
  console.log('Cleaning expired DNS records');
  
  // This would be implemented based on your storage mechanism
}

/**
 * Get a text representation of a DNS record type
 */
function getRecordTypeName(type) {
  const types = {
    1: 'A',
    2: 'NS',
    5: 'CNAME',
    15: 'MX',
    16: 'TXT',
    28: 'AAAA'
  };
  return types[type] || 'UNKNOWN';
}

/**
 * Get DNS error code for common errors
 */
function getErrorCode(err) {
  if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
    return 3; // NXDOMAIN
  }
  return 2; // SERVFAIL
}

/**
 * Format traditional DNS records to our internal format
 */
function formatTraditionalRecords(domain, recordType, addresses) {
  return addresses.map(address => ({
    name: domain,
    type: recordType,
    value: address,
    ttl: 300, // Default TTL
    encryption: null,
    quantumSecure: false
  }));
}

// Start the server
server.bind(config.port, config.host);

module.exports = server;