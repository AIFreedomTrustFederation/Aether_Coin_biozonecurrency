/**
 * FractalDNS Server
 * Decentralized, quantum-resistant DNS server for the Aetherion ecosystem
 */

const dgram = require('dgram');
const net = require('net');
const dns = require('dns2');
const { Packet } = dns;
const { createLogger } = require('./utils/logger');
const ZoneManager = require('./utils/zoneManager');
const WebAdminServer = require('./web-admin/server');
const config = require('./config');

// Initialize logger
const logger = createLogger('dnsServer');

/**
 * FractalDNS Server class
 */
class FractalDnsServer {
  /**
   * Create a new FractalDNS server
   */
  constructor() {
    // Initialize zone manager
    this.zoneManager = new ZoneManager();
    
    // Create servers
    this.udpServer = null;
    this.tcpServer = null;
    
    // Initialize web admin server
    this.webAdmin = null;
    
    // Cache for DNS responses
    this.cache = new Map();
    
    // Peer network
    this.peers = new Set();
    
    // Request statistics
    this.stats = {
      totalRequests: 0,
      cachedResponses: 0,
      resolvedQueries: 0,
      forwardedQueries: 0,
      errors: 0,
      startTime: null,
      zoneQueries: {}
    };
    
    // Initialize servers
    this.initialize();
  }
  
  /**
   * Initialize the DNS server
   */
  async initialize() {
    try {
      // Load TLD zones
      await this.zoneManager.loadTldZones();
      
      // Initialize Web Admin server if enabled
      if (config.webAdmin.enabled) {
        this.webAdmin = new WebAdminServer(this);
      }
      
      logger.info('FractalDNS server initialized');
    } catch (error) {
      logger.error('Failed to initialize DNS server', error);
      throw error;
    }
  }
  
  /**
   * Start the DNS server
   */
  async start() {
    try {
      // Start UDP server if enabled
      if (config.server.enableUdp) {
        await this.startUdpServer();
      }
      
      // Start TCP server if enabled
      if (config.server.enableTcp) {
        await this.startTcpServer();
      }
      
      // Start Web Admin server if enabled
      if (this.webAdmin) {
        await this.webAdmin.start();
      }
      
      // Track start time for uptime calculation
      this.stats.startTime = Date.now();
      
      logger.info('FractalDNS server started');
    } catch (error) {
      logger.error('Failed to start DNS server', error);
      throw error;
    }
  }
  
  /**
   * Start the UDP server
   */
  async startUdpServer() {
    return new Promise((resolve, reject) => {
      try {
        // Create UDP server
        this.udpServer = dgram.createSocket('udp4');
        
        // Handle errors
        this.udpServer.on('error', (error) => {
          logger.error('UDP server error', error);
          this.udpServer.close();
        });
        
        // Handle messages
        this.udpServer.on('message', async (buffer, rinfo) => {
          try {
            // Track request statistics
            this.stats.totalRequests++;
            
            // Decode DNS packet
            const packet = Packet.parse(buffer);
            
            // Process DNS request
            const response = await this.processRequest(packet);
            
            // Send response
            this.udpServer.send(response, rinfo.port, rinfo.address);
          } catch (error) {
            logger.error('Error processing UDP request', error);
            this.stats.errors++;
          }
        });
        
        // Handle listening event
        this.udpServer.on('listening', () => {
          const address = this.udpServer.address();
          logger.info(`UDP server listening on ${address.address}:${address.port}`);
          resolve();
        });
        
        // Bind to address and port
        this.udpServer.bind(config.server.port, config.server.address);
      } catch (error) {
        logger.error('Failed to start UDP server', error);
        reject(error);
      }
    });
  }
  
  /**
   * Start the TCP server
   */
  async startTcpServer() {
    return new Promise((resolve, reject) => {
      try {
        // Create TCP server
        this.tcpServer = net.createServer(async (socket) => {
          // Handle connection
          socket.on('data', async (data) => {
            try {
              // Track request statistics
              this.stats.totalRequests++;
              
              // First two bytes are length
              const length = data.readUInt16BE(0);
              const buffer = data.slice(2, length + 2);
              
              // Decode DNS packet
              const packet = Packet.parse(buffer);
              
              // Process DNS request
              const response = await this.processRequest(packet);
              
              // Prepend length
              const responseBuffer = Buffer.alloc(response.length + 2);
              responseBuffer.writeUInt16BE(response.length, 0);
              response.copy(responseBuffer, 2);
              
              // Send response
              socket.write(responseBuffer);
            } catch (error) {
              logger.error('Error processing TCP request', error);
              this.stats.errors++;
              socket.end();
            }
          });
          
          // Handle errors
          socket.on('error', (error) => {
            logger.error('TCP socket error', error);
            socket.end();
          });
        });
        
        // Handle server errors
        this.tcpServer.on('error', (error) => {
          logger.error('TCP server error', error);
          this.tcpServer.close();
        });
        
        // Handle listening event
        this.tcpServer.on('listening', () => {
          const address = this.tcpServer.address();
          logger.info(`TCP server listening on ${address.address}:${address.port}`);
          resolve();
        });
        
        // Listen on address and port
        this.tcpServer.listen(config.server.port, config.server.address);
      } catch (error) {
        logger.error('Failed to start TCP server', error);
        reject(error);
      }
    });
  }
  
  /**
   * Process a DNS request
   * @param {Object} query - DNS query packet
   * @returns {Buffer} - DNS response packet
   */
  async processRequest(query) {
    try {
      // Create response packet
      const response = new Packet();
      response.header.id = query.header.id;
      response.header.qr = 1;
      response.header.opcode = query.header.opcode;
      response.header.aa = 0;
      response.header.tc = 0;
      response.header.rd = query.header.rd;
      response.header.ra = 0;
      response.header.z = 0;
      response.header.ad = 0;
      response.header.cd = 0;
      response.header.rcode = Packet.RCODE.NOERROR;
      response.questions = query.questions;
      response.answers = [];
      
      // Process each question
      for (const question of query.questions) {
        // Get the domain and record type
        const { name, type } = question;
        
        logger.debug(`DNS query: ${name} (${dns.Packet.TYPE[type]})`);
        
        // Track zone query statistics
        const tld = name.split('.').pop();
        if (!this.stats.zoneQueries[tld]) {
          this.stats.zoneQueries[tld] = 0;
        }
        this.stats.zoneQueries[tld]++;
        
        // Check cache first if enabled
        if (config.server.cache.enabled) {
          const cacheKey = `${name}:${type}`;
          const cachedResponse = this.cache.get(cacheKey);
          
          if (cachedResponse && cachedResponse.expires > Date.now()) {
            // Add cached answers to response
            response.answers = response.answers.concat(cachedResponse.answers);
            this.stats.cachedResponses++;
            logger.debug(`Cache hit for: ${name} (${dns.Packet.TYPE[type]})`);
            continue;
          }
        }
        
        // Look up in our zones
        const records = this.zoneManager.lookupRecord(name, dns.Packet.TYPE[type]);
        
        if (records.length > 0) {
          // Convert records to DNS answers
          const answers = records.map(record => {
            return {
              name,
              type,
              class: dns.Packet.CLASS.IN,
              ttl: record.ttl || config.server.ttl,
              address: record.value
            };
          });
          
          // Add answers to response
          response.answers = response.answers.concat(answers);
          
          // Cache response if enabled
          if (config.server.cache.enabled) {
            const cacheKey = `${name}:${type}`;
            this.cache.set(cacheKey, {
              answers,
              expires: Date.now() + (config.server.cache.ttl * 1000)
            });
          }
          
          this.stats.resolvedQueries++;
          logger.debug(`Resolved: ${name} (${dns.Packet.TYPE[type]}) with ${answers.length} records`);
        } 
        // Forward query if recursive resolution is enabled
        else if (config.server.recursiveQuery) {
          try {
            // Forward the query to upstream DNS servers
            const forwardResponse = await this.forwardQuery(name, type);
            
            // Add forwarded answers to response
            if (forwardResponse && forwardResponse.answers) {
              response.answers = response.answers.concat(forwardResponse.answers);
              
              // Cache forwarded response if enabled
              if (config.server.cache.enabled && forwardResponse.answers.length > 0) {
                const cacheKey = `${name}:${type}`;
                this.cache.set(cacheKey, {
                  answers: forwardResponse.answers,
                  expires: Date.now() + (config.server.cache.ttl * 1000)
                });
              }
              
              this.stats.forwardedQueries++;
              logger.debug(`Forwarded: ${name} (${dns.Packet.TYPE[type]}) with ${forwardResponse.answers.length} records`);
            }
          } catch (error) {
            logger.error(`Failed to forward query: ${name} (${dns.Packet.TYPE[type]})`, error);
            response.header.rcode = Packet.RCODE.SERVFAIL;
          }
        } 
        // No records found and no forwarding
        else {
          logger.debug(`No records found: ${name} (${dns.Packet.TYPE[type]})`);
          response.header.rcode = Packet.RCODE.NXDOMAIN;
        }
      }
      
      // Encode response
      return Packet.encode(response);
    } catch (error) {
      logger.error('Error processing DNS request', error);
      this.stats.errors++;
      
      // Create error response
      const errorResponse = new Packet();
      errorResponse.header.id = query.header.id;
      errorResponse.header.qr = 1;
      errorResponse.header.opcode = query.header.opcode;
      errorResponse.header.aa = 0;
      errorResponse.header.tc = 0;
      errorResponse.header.rd = query.header.rd;
      errorResponse.header.ra = 0;
      errorResponse.header.z = 0;
      errorResponse.header.ad = 0;
      errorResponse.header.cd = 0;
      errorResponse.header.rcode = Packet.RCODE.SERVFAIL;
      errorResponse.questions = query.questions;
      
      return Packet.encode(errorResponse);
    }
  }
  
  /**
   * Forward a DNS query to upstream servers
   * @param {string} name - Domain name
   * @param {number} type - Record type
   * @returns {Object} - DNS response packet
   */
  async forwardQuery(name, type) {
    try {
      // Create a resolver
      const resolver = new dns.Resolver({
        serverAddress: config.server.forwardServers[0],
        serverPort: 53
      });
      
      // Send query
      const response = await resolver.query({
        questions: [{
          name,
          type,
          class: dns.Packet.CLASS.IN
        }]
      });
      
      return response;
    } catch (error) {
      logger.error(`Failed to forward query: ${name} (${dns.Packet.TYPE[type]})`, error);
      throw error;
    }
  }
  
  /**
   * Stop the DNS server
   */
  async stop() {
    try {
      // Stop UDP server
      if (this.udpServer) {
        await this.stopUdpServer();
      }
      
      // Stop TCP server
      if (this.tcpServer) {
        await this.stopTcpServer();
      }
      
      // Stop Web Admin server
      if (this.webAdmin) {
        await this.webAdmin.stop();
      }
      
      // Reset statistics
      this.stats.startTime = null;
      
      logger.info('FractalDNS server stopped');
    } catch (error) {
      logger.error('Failed to stop DNS server', error);
      throw error;
    }
  }
  
  /**
   * Stop the UDP server
   */
  async stopUdpServer() {
    return new Promise((resolve, reject) => {
      if (!this.udpServer) {
        resolve();
        return;
      }
      
      this.udpServer.close((error) => {
        if (error) {
          logger.error('Failed to close UDP server', error);
          reject(error);
          return;
        }
        
        logger.info('UDP server stopped');
        this.udpServer = null;
        resolve();
      });
    });
  }
  
  /**
   * Stop the TCP server
   */
  async stopTcpServer() {
    return new Promise((resolve, reject) => {
      if (!this.tcpServer) {
        resolve();
        return;
      }
      
      this.tcpServer.close((error) => {
        if (error) {
          logger.error('Failed to close TCP server', error);
          reject(error);
          return;
        }
        
        logger.info('TCP server stopped');
        this.tcpServer = null;
        resolve();
      });
    });
  }
  
  /**
   * Get TLD zones
   * @returns {Array<Object>} Array of TLD zone objects
   */
  getTldZones() {
    return this.zoneManager.getTldZones();
  }
  
  /**
   * Get server statistics
   * @returns {Object} Server statistics
   */
  getStats() {
    const stats = {
      ...this.stats,
      uptime: this.stats.startTime ? Math.floor((Date.now() - this.stats.startTime) / 1000) : 0,
      zones: this.zoneManager.getTldZones().length,
      cacheSize: this.cache.size,
      peers: this.peers.size
    };
    
    return stats;
  }
}

module.exports = FractalDnsServer;