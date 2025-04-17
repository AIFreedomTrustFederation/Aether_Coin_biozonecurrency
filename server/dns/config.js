/**
 * Configuration for FractalDNS Server
 */

module.exports = {
  // Server settings
  server: {
    port: 53,
    address: '0.0.0.0',
    allowedHosts: ['localhost', '127.0.0.1'],
    ttl: 300,
    zonesPath: './zones',
    queryTimeout: 5000
  },
  
  // Upstream DNS for forwarding standard DNS queries
  upstreamDns: {
    server: '8.8.8.8', // Google DNS
    port: 53,
    alternateServer: '1.1.1.1', // Cloudflare DNS
    alternatePort: 53
  },
  
  // TLDs controlled by FractalDNS
  managedTlds: [
    'trust',
    'aether',
    'fractal'
  ],
  
  // Security settings
  security: {
    quantumSecure: true,
    shardCount: 64,
    keysPath: './keys',
    keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
    minSignatureValidity: 5 * 60 * 1000, // 5 minutes
    allowIPv6: true,
    rateLimit: {
      maxRequestsPerMinute: 300,
      maxRequestsPerIp: 100
    }
  },
  
  // Peer-to-peer network settings
  network: {
    peerDiscovery: true,
    peerPort: 54,
    bootstrapPeers: [
      '127.0.0.1:54'
    ],
    maxPeers: 50,
    peerSyncInterval: 15 * 60 * 1000, // 15 minutes
    peerConnectionTimeout: 10000
  },
  
  // Logging settings
  logging: {
    level: 'INFO', // DEBUG, INFO, WARN, ERROR
    logToConsole: true,
    logToFile: true,
    logPath: './logs',
    rotateLogsDaily: true,
    maxLogFiles: 30
  },
  
  // Web admin interface settings
  webAdmin: {
    enabled: true,
    port: 8053,
    address: '127.0.0.1',
    username: 'admin',
    passwordHash: '', // Set this in production
    sessionSecret: '', // Set this in production
    allowRemoteAccess: false,
    sslEnabled: false,
    sslCertPath: '',
    sslKeyPath: ''
  },
  
  // Domain-specific settings
  domains: {
    'aifreedomtrust.com': {
      allowWildcards: true,
      defaultTtl: 300,
      allowedTypes: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']
    },
    'atc.aifreedomtrust.com': {
      allowWildcards: true,
      defaultTtl: 300,
      allowedTypes: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']
    }
  }
};