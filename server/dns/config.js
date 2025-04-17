/**
 * FractalDNS Configuration
 * Provides centralized configuration for all FractalDNS components
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Default configuration
const defaultConfig = {
  // DNS Server configuration
  server: {
    // Server binding address
    address: '0.0.0.0',
    // DNS port (default is 53)
    port: 53,
    // Path to zones directory
    zonesPath: path.join(__dirname, 'zones'),
    // Default TTL for records
    ttl: 3600,
    // Enable TCP server
    enableTcp: true,
    // Enable UDP server
    enableUdp: true,
    // Maximum UDP payload size
    maxUdpPayloadSize: 4096,
    // Recursive query support
    recursiveQuery: false,
    // Forwarding servers for recursive queries
    forwardServers: ['1.1.1.1', '8.8.8.8'],
    // Caching settings
    cache: {
      enabled: true,
      maxSize: 10000,
      ttl: 300
    }
  },
  
  // Web Admin Interface
  webAdmin: {
    // Enable web admin interface
    enabled: true,
    // Binding address
    address: '127.0.0.1',
    // Web admin port
    port: 8053,
    // Session secret
    sessionSecret: process.env.DNS_SESSION_SECRET || 'fractal-dns-secret-key',
    // Admin credentials
    username: process.env.DNS_ADMIN_USER || 'admin',
    // Hashed password (can be empty, will use default 'admin')
    passwordHash: process.env.DNS_ADMIN_HASH || '',
    // SSL configuration
    sslEnabled: false,
    sslKeyPath: '',
    sslCertPath: ''
  },
  
  // Security settings
  security: {
    // Enable quantum-resistant cryptography
    quantumSecure: true,
    // Number of shards for fractal sharding
    shardCount: 64,
    // Encryption key for record signing
    signingKey: process.env.DNS_SIGNING_KEY || '',
    // Rate limiting
    rateLimit: {
      enabled: true,
      windowMs: 60000, // 1 minute
      maxRequests: 100
    },
    // DNSSEC settings
    dnssec: {
      enabled: false,
      keyPath: ''
    }
  },
  
  // Peer network for distributed DNS
  peerNetwork: {
    // Enable peer networking
    enabled: true,
    // Peer sync port
    port: 5353,
    // Peer discovery methods
    discovery: {
      // Static list of peers
      staticPeers: [],
      // Enable multicast discovery
      multicast: true,
      // Enable DNS-based discovery
      dns: true,
      // Discovery interval in seconds
      interval: 300
    },
    // Data replication settings
    replication: {
      // Enable zone replication
      enabled: true,
      // Replication interval in seconds
      interval: 600
    }
  },
  
  // Logging configuration
  logging: {
    // Log level
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    // Log file
    file: path.join(os.tmpdir(), 'fractal-dns.log'),
    // Console logging
    console: true,
    // Include timestamps
    timestamps: true
  }
};

// Load custom configuration from file
let customConfig = {};

const configPath = path.join(__dirname, 'fractal-dns.json');

if (fs.existsSync(configPath)) {
  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    customConfig = JSON.parse(configFile);
  } catch (error) {
    console.error('Error loading configuration file:', error);
  }
}

// Merge default and custom configurations
function mergeConfigs(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeConfigs(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Merge configurations
const config = mergeConfigs(defaultConfig, customConfig);

// Ensure zones directory exists
if (!fs.existsSync(config.server.zonesPath)) {
  try {
    fs.mkdirSync(config.server.zonesPath, { recursive: true });
  } catch (error) {
    console.error('Error creating zones directory:', error);
  }
}

module.exports = config;