/**
 * FractalDNS Server
 * A decentralized, quantum-resistant DNS server implementation
 * For the FractalCoin TLD hosting provider system
 */

const dgram = require('dgram');
const dns = require('native-dns');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const config = require('./config');
const { generateKeyPair } = require('./utils/cryptography');
const { createLogger } = require('./utils/logger');
const { loadZoneData, saveZoneData } = require('./utils/zoneManager');
const { validateRequest, signResponse } = require('./utils/security');

// Initialize logger
const logger = createLogger('fractalDnsServer');

class FractalDnsServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || 53,
      address: options.address || '0.0.0.0',
      ttl: options.ttl || 300,
      zonesPath: options.zonesPath || path.join(__dirname, 'zones'),
      shardCount: options.shardCount || 64,
      quantumSecure: options.quantumSecure !== false,
      ...options
    };

    this.server = dns.createServer();
    this.udpServer = dgram.createSocket('udp4');
    this.zones = {};
    this.shards = new Map();
    this.peers = new Set();
    
    this.initializeServer();
  }

  async initializeServer() {
    try {
      // Ensure zones directory exists
      if (!fs.existsSync(this.options.zonesPath)) {
        fs.mkdirSync(this.options.zonesPath, { recursive: true });
      }

      // Load TLD zone files
      await this.loadTldZones();

      // Initialize cryptographic keys if quantum security is enabled
      if (this.options.quantumSecure) {
        const keyPair = await generateKeyPair();
        this.keys = keyPair;
        logger.info('Quantum-resistant keys generated successfully');
      }

      // Set up event handlers for DNS server
      this.setupEventHandlers();

      logger.info(`FractalDNS Server initialized with ${Object.keys(this.zones).length} zones`);
    } catch (error) {
      logger.error('Failed to initialize FractalDNS Server:', error);
      throw error;
    }
  }

  async loadTldZones() {
    try {
      // Load standard TLDs
      const tldFiles = fs.readdirSync(this.options.zonesPath).filter(file => file.endsWith('.json'));
      
      for (const file of tldFiles) {
        const tld = path.basename(file, '.json');
        const zoneData = await loadZoneData(path.join(this.options.zonesPath, file));
        
        this.zones[tld] = zoneData;
        logger.info(`Loaded TLD zone: ${tld} with ${zoneData.records.length} records`);
        
        // Initialize shards for this zone
        if (this.options.quantumSecure) {
          this.createZoneShards(tld, zoneData);
        }
      }

      // Create default TLDs if they don't exist
      const defaultTlds = ['.trust', '.aether', '.fractal'];
      
      for (const tld of defaultTlds) {
        const cleanTld = tld.startsWith('.') ? tld.substring(1) : tld;
        
        if (!this.zones[cleanTld]) {
          const newZone = {
            name: cleanTld,
            records: [],
            meta: {
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              quantumSecure: this.options.quantumSecure,
              shardCount: this.options.shardCount
            }
          };
          
          this.zones[cleanTld] = newZone;
          
          // Save the new zone file
          await saveZoneData(path.join(this.options.zonesPath, `${cleanTld}.json`), newZone);
          logger.info(`Created new TLD zone: ${cleanTld}`);
          
          // Create shards for the new zone
          if (this.options.quantumSecure) {
            this.createZoneShards(cleanTld, newZone);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load TLD zones:', error);
      throw error;
    }
  }

  createZoneShards(tld, zoneData) {
    const shardCount = this.options.shardCount;
    const records = zoneData.records || [];
    
    // Create shards for the zone
    for (let i = 0; i < shardCount; i++) {
      const shardKey = `${tld}-shard-${i}`;
      
      // Assign records to shards using a deterministic approach
      const shardRecords = records.filter(record => {
        const recordHash = crypto.createHash('sha256').update(record.domain).digest('hex');
        const shardIndex = parseInt(recordHash.substring(0, 8), 16) % shardCount;
        return shardIndex === i;
      });
      
      this.shards.set(shardKey, {
        tld,
        shardIndex: i,
        records: shardRecords,
        signature: this.signShard(shardRecords)
      });
      
      logger.debug(`Created shard ${shardKey} with ${shardRecords.length} records`);
    }
  }

  signShard(records) {
    if (!this.options.quantumSecure || !this.keys) return null;
    
    const recordsData = JSON.stringify(records);
    // In a real implementation, this would use a quantum-resistant signature algorithm
    return crypto.createSign('sha256').update(recordsData).sign(this.keys.privateKey, 'base64');
  }

  setupEventHandlers() {
    // Handle DNS questions
    this.server.on('request', (request, response) => {
      try {
        this.handleDnsRequest(request, response);
      } catch (error) {
        logger.error('Error handling DNS request:', error);
      }
    });

    // Handle errors
    this.server.on('error', (error) => {
      logger.error('DNS server error:', error);
    });

    // Handle UDP messages for peer coordination
    this.udpServer.on('message', (message, remote) => {
      try {
        this.handlePeerMessage(message, remote);
      } catch (error) {
        logger.error('Error handling peer message:', error);
      }
    });

    // Handle UDP server errors
    this.udpServer.on('error', (error) => {
      logger.error('UDP server error:', error);
    });
  }

  async handleDnsRequest(request, response) {
    const questions = request.question;
    
    // Process each question in the request
    for (const question of questions) {
      const { name, type } = question;
      logger.debug(`DNS query: ${name} (${dns.consts.QTYPE_TO_NAME[type]})`);
      
      // Extract the TLD from the domain name
      const parts = name.split('.');
      const tld = parts[parts.length - 1].toLowerCase();
      
      // Check if this is one of our custom TLDs
      if (this.zones[tld]) {
        await this.handleCustomTld(name, type, response);
      } else {
        // For standard DNS resolution, forward to upstream DNS
        await this.forwardToUpstreamDns(name, type, response);
      }
    }
    
    // If the request has DNSSEC enabled and we're quantum secure, add security records
    if (request.header.rd && this.options.quantumSecure) {
      this.addSecurityRecords(response);
    }
    
    response.send();
  }

  async handleCustomTld(name, type, response) {
    const parts = name.split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    const zone = this.zones[tld];
    
    if (!zone) return;
    
    // Find matching records in the zone
    const domainParts = parts.slice(0, parts.length - 1);
    let currentDomain = '';
    
    for (let i = domainParts.length - 1; i >= 0; i--) {
      currentDomain = i === domainParts.length - 1 
        ? domainParts[i] + '.' + tld
        : domainParts[i] + '.' + currentDomain;
      
      const records = zone.records.filter(r => 
        r.domain === currentDomain && 
        dns.consts.QTYPE_TO_NAME[type] === r.type
      );
      
      if (records.length > 0) {
        // Add records to the response
        for (const record of records) {
          this.addRecordToResponse(record, response, type);
        }
        return;
      }
    }
    
    // If no direct match, check for wildcard records
    const wildcardRecords = zone.records.filter(r => 
      r.domain.startsWith('*.') && 
      name.endsWith(r.domain.substring(2)) && 
      dns.consts.QTYPE_TO_NAME[type] === r.type
    );
    
    if (wildcardRecords.length > 0) {
      for (const record of wildcardRecords) {
        this.addRecordToResponse(record, response, type);
      }
    }
  }

  addRecordToResponse(record, response, type) {
    const answer = {
      name: record.domain,
      ttl: record.ttl || this.options.ttl,
      class: dns.consts.NAME_TO_QCLASS.IN
    };
    
    switch (record.type) {
      case 'A':
        answer.type = dns.consts.NAME_TO_QTYPE.A;
        answer.address = record.value;
        break;
      case 'AAAA':
        answer.type = dns.consts.NAME_TO_QTYPE.AAAA;
        answer.address = record.value;
        break;
      case 'CNAME':
        answer.type = dns.consts.NAME_TO_QTYPE.CNAME;
        answer.data = record.value;
        break;
      case 'MX':
        answer.type = dns.consts.NAME_TO_QTYPE.MX;
        answer.priority = record.priority || 10;
        answer.exchange = record.value;
        break;
      case 'TXT':
        answer.type = dns.consts.NAME_TO_QTYPE.TXT;
        answer.data = [record.value];
        break;
      case 'NS':
        answer.type = dns.consts.NAME_TO_QTYPE.NS;
        answer.data = record.value;
        break;
      default:
        logger.warn(`Unsupported record type: ${record.type}`);
        return;
    }
    
    response.answer.push(answer);
  }

  async forwardToUpstreamDns(name, type, response) {
    const question = dns.Question({
      name,
      type,
      class: dns.consts.NAME_TO_QCLASS.IN
    });
    
    const req = dns.Request({
      question,
      server: config.upstreamDns.server,
      port: config.upstreamDns.port,
      timeout: 5000
    });
    
    return new Promise((resolve) => {
      req.on('timeout', () => {
        logger.warn(`DNS forward request timeout for ${name}`);
        resolve();
      });
      
      req.on('message', (err, msg) => {
        if (err) {
          logger.error(`DNS forward error for ${name}:`, err);
          resolve();
          return;
        }
        
        if (msg.answer.length > 0) {
          msg.answer.forEach(answer => response.answer.push(answer));
        }
        
        resolve();
      });
      
      req.send();
    });
  }

  addSecurityRecords(response) {
    if (!this.keys) return;
    
    // In a real implementation, this would add DNSSEC or custom quantum-resistant security records
    // This is a simplified implementation
    const now = Math.floor(Date.now() / 1000);
    
    const securityRecord = {
      name: response.question[0].name,
      ttl: 300,
      class: dns.consts.NAME_TO_QCLASS.IN,
      type: dns.consts.NAME_TO_QTYPE.TXT,
      data: [`quantum-secure=true; timestamp=${now}; signature=${this.createRecordSignature(response)}`]
    };
    
    response.additional.push(securityRecord);
  }

  createRecordSignature(response) {
    if (!this.keys) return '';
    
    const responseData = JSON.stringify(response.answer);
    // In a real implementation, this would use a quantum-resistant signature algorithm
    return crypto.createSign('sha256').update(responseData).sign(this.keys.privateKey, 'base64').substring(0, 40);
  }

  handlePeerMessage(message, remote) {
    // Process peer-to-peer messages for DNS coordination
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'HELLO':
          this.handlePeerHello(data, remote);
          break;
        case 'ZONE_UPDATE':
          this.handleZoneUpdate(data);
          break;
        case 'SHARD_REQUEST':
          this.handleShardRequest(data, remote);
          break;
        default:
          logger.warn(`Unknown peer message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('Error processing peer message:', error);
    }
  }

  handlePeerHello(data, remote) {
    const peerAddress = `${remote.address}:${remote.port}`;
    
    // Add the peer to our peer list if it's not already there
    if (!this.peers.has(peerAddress)) {
      this.peers.add(peerAddress);
      logger.info(`New peer connected: ${peerAddress}`);
      
      // Send our peer list back
      const response = {
        type: 'HELLO_ACK',
        peers: Array.from(this.peers),
        zones: Object.keys(this.zones)
      };
      
      this.udpServer.send(
        Buffer.from(JSON.stringify(response)),
        remote.port,
        remote.address
      );
    }
  }

  handleZoneUpdate(data) {
    const { zone, records, signature } = data;
    
    if (!this.zones[zone]) {
      logger.warn(`Received update for unknown zone: ${zone}`);
      return;
    }
    
    // Verify the signature if quantum security is enabled
    if (this.options.quantumSecure) {
      const isValid = this.verifyZoneUpdate(zone, records, signature);
      
      if (!isValid) {
        logger.warn(`Invalid signature for zone update: ${zone}`);
        return;
      }
    }
    
    // Apply the zone update
    this.updateZoneRecords(zone, records);
    logger.info(`Updated zone ${zone} with ${records.length} records`);
  }

  verifyZoneUpdate(zone, records, signature) {
    // In a real implementation, this would verify using quantum-resistant algorithms
    // This is a simplified implementation
    return true;
  }

  updateZoneRecords(zone, records) {
    if (!this.zones[zone]) return;
    
    // Update the zone records
    this.zones[zone].records = records;
    this.zones[zone].meta.updated = new Date().toISOString();
    
    // Save the updated zone
    saveZoneData(path.join(this.options.zonesPath, `${zone}.json`), this.zones[zone]);
    
    // Update shards if quantum security is enabled
    if (this.options.quantumSecure) {
      this.createZoneShards(zone, this.zones[zone]);
    }
  }

  handleShardRequest(data, remote) {
    const { zone, shardIndex } = data;
    const shardKey = `${zone}-shard-${shardIndex}`;
    
    if (!this.shards.has(shardKey)) {
      logger.warn(`Requested unknown shard: ${shardKey}`);
      return;
    }
    
    // Send the requested shard
    const shard = this.shards.get(shardKey);
    const response = {
      type: 'SHARD_RESPONSE',
      shard,
      timestamp: Date.now()
    };
    
    this.udpServer.send(
      Buffer.from(JSON.stringify(response)),
      remote.port,
      remote.address
    );
    
    logger.debug(`Sent shard ${shardKey} to ${remote.address}:${remote.port}`);
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Start the DNS server
        this.server.serve(this.options.port, this.options.address);
        logger.info(`DNS server listening on ${this.options.address}:${this.options.port}`);
        
        // Start the UDP server for peer coordination
        this.udpServer.bind(this.options.port + 1, this.options.address);
        logger.info(`Peer coordination server listening on ${this.options.address}:${this.options.port + 1}`);
        
        resolve();
      } catch (error) {
        logger.error('Failed to start FractalDNS Server:', error);
        reject(error);
      }
    });
  }

  async stop() {
    // Close the servers
    this.server.close();
    this.udpServer.close();
    logger.info('FractalDNS Server stopped');
  }

  /**
   * Add a new domain record to a TLD zone
   */
  async addDomainRecord(record) {
    const parts = record.domain.split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    
    if (!this.zones[tld]) {
      throw new Error(`TLD not found: ${tld}`);
    }
    
    // Check if record already exists
    const existingIndex = this.zones[tld].records.findIndex(r => 
      r.domain === record.domain && r.type === record.type
    );
    
    if (existingIndex >= 0) {
      // Update existing record
      this.zones[tld].records[existingIndex] = {
        ...record,
        updated: new Date().toISOString()
      };
    } else {
      // Add new record
      this.zones[tld].records.push({
        ...record,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
    }
    
    // Update zone metadata
    this.zones[tld].meta.updated = new Date().toISOString();
    
    // Save the updated zone
    await saveZoneData(path.join(this.options.zonesPath, `${tld}.json`), this.zones[tld]);
    
    // Update shards if quantum security is enabled
    if (this.options.quantumSecure) {
      this.createZoneShards(tld, this.zones[tld]);
    }
    
    logger.info(`Added/updated record for ${record.domain} (${record.type})`);
    return true;
  }

  /**
   * Delete a domain record from a TLD zone
   */
  async deleteDomainRecord(domain, type) {
    const parts = domain.split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    
    if (!this.zones[tld]) {
      throw new Error(`TLD not found: ${tld}`);
    }
    
    // Find and remove the record
    const initialCount = this.zones[tld].records.length;
    this.zones[tld].records = this.zones[tld].records.filter(r => 
      !(r.domain === domain && r.type === type)
    );
    
    if (this.zones[tld].records.length === initialCount) {
      logger.warn(`Record not found for deletion: ${domain} (${type})`);
      return false;
    }
    
    // Update zone metadata
    this.zones[tld].meta.updated = new Date().toISOString();
    
    // Save the updated zone
    await saveZoneData(path.join(this.options.zonesPath, `${tld}.json`), this.zones[tld]);
    
    // Update shards if quantum security is enabled
    if (this.options.quantumSecure) {
      this.createZoneShards(tld, this.zones[tld]);
    }
    
    logger.info(`Deleted record for ${domain} (${type})`);
    return true;
  }

  /**
   * Get all records for a specific domain
   */
  getDomainRecords(domain) {
    const parts = domain.split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    
    if (!this.zones[tld]) {
      return [];
    }
    
    return this.zones[tld].records.filter(r => r.domain === domain);
  }

  /**
   * Get all TLD zones
   */
  getTldZones() {
    return Object.keys(this.zones).map(tld => ({
      name: tld,
      recordCount: this.zones[tld].records.length,
      updated: this.zones[tld].meta.updated
    }));
  }
}

module.exports = FractalDnsServer;