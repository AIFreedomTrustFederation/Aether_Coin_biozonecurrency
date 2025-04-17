/**
 * Zone Manager for FractalDNS
 * Handles loading, parsing, and managing DNS zone files
 */

const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');
const { createHash, fractalShard, fractalReconstruct } = require('./cryptography');
const config = require('../config');

// Initialize logger
const logger = createLogger('zoneManager');

/**
 * Zone Manager class
 */
class ZoneManager {
  /**
   * Create a new ZoneManager
   */
  constructor() {
    // Path to zone files
    this.zonesPath = config.server.zonesPath;
    
    // Cache of loaded zones
    this.zones = {};
    
    // TLD zone index
    this.tldIndex = new Map();
    
    // Ensure zones directory exists
    this.ensureZonesDirectory();
  }
  
  /**
   * Ensure the zones directory exists
   */
  ensureZonesDirectory() {
    if (!fs.existsSync(this.zonesPath)) {
      try {
        fs.mkdirSync(this.zonesPath, { recursive: true });
        logger.info(`Created zones directory: ${this.zonesPath}`);
      } catch (error) {
        logger.error(`Failed to create zones directory: ${this.zonesPath}`, error);
        throw error;
      }
    }
  }
  
  /**
   * Load all TLD zones
   */
  async loadTldZones() {
    try {
      logger.info('Loading TLD zones...');
      
      // Clear existing zones
      this.zones = {};
      this.tldIndex.clear();
      
      // Get all zone files
      const files = await fs.promises.readdir(this.zonesPath);
      
      // Filter for JSON files
      const zoneFiles = files.filter(file => file.endsWith('.json'));
      
      logger.debug(`Found ${zoneFiles.length} zone files`);
      
      // Load each zone file
      for (const file of zoneFiles) {
        try {
          const filePath = path.join(this.zonesPath, file);
          const tld = path.basename(file, '.json');
          
          // Read zone file
          const content = await fs.promises.readFile(filePath, 'utf8');
          const zoneData = JSON.parse(content);
          
          // Store zone
          this.zones[tld] = zoneData;
          
          // Update TLD index
          this.tldIndex.set(tld, {
            name: tld,
            recordCount: zoneData.records ? zoneData.records.length : 0,
            updated: zoneData.meta ? zoneData.meta.updated : new Date().toISOString()
          });
          
          logger.debug(`Loaded zone: ${tld} with ${this.tldIndex.get(tld).recordCount} records`);
        } catch (error) {
          logger.error(`Failed to load zone file: ${file}`, error);
        }
      }
      
      logger.info(`Loaded ${Object.keys(this.zones).length} TLD zones`);
      
      return this.zones;
    } catch (error) {
      logger.error('Failed to load TLD zones', error);
      throw error;
    }
  }
  
  /**
   * Get a list of all TLD zones
   * @returns {Array<Object>} Array of TLD zone objects
   */
  getTldZones() {
    return Array.from(this.tldIndex.values());
  }
  
  /**
   * Get a specific TLD zone
   * @param {string} tld - TLD name
   * @returns {Object|null} Zone data or null if not found
   */
  getTldZone(tld) {
    return this.zones[tld] || null;
  }
  
  /**
   * Save a TLD zone
   * @param {string} tld - TLD name
   * @param {Object} zoneData - Zone data to save
   */
  async saveTldZone(tld, zoneData) {
    try {
      // Ensure zones directory exists
      this.ensureZonesDirectory();
      
      // Update metadata
      if (!zoneData.meta) {
        zoneData.meta = {};
      }
      
      // Set updated timestamp
      zoneData.meta.updated = new Date().toISOString();
      
      // Apply fractal sharding if quantum security is enabled
      if (config.security.quantumSecure && zoneData.records && zoneData.records.length > 0) {
        await this.applyFractalSharding(zoneData);
      }
      
      // Generate zone file path
      const filePath = path.join(this.zonesPath, `${tld}.json`);
      
      // Write zone file
      await fs.promises.writeFile(filePath, JSON.stringify(zoneData, null, 2));
      
      // Update cache
      this.zones[tld] = zoneData;
      
      // Update TLD index
      this.tldIndex.set(tld, {
        name: tld,
        recordCount: zoneData.records ? zoneData.records.length : 0,
        updated: zoneData.meta.updated
      });
      
      logger.info(`Saved zone: ${tld} with ${zoneData.records ? zoneData.records.length : 0} records`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to save zone: ${tld}`, error);
      throw error;
    }
  }
  
  /**
   * Create a new TLD zone
   * @param {string} tld - TLD name
   * @returns {Object} New zone data
   */
  async createTldZone(tld) {
    try {
      // Check if zone already exists
      if (this.zones[tld]) {
        throw new Error(`Zone already exists: ${tld}`);
      }
      
      // Create new zone data
      const zoneData = {
        name: tld,
        records: [],
        meta: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          quantumSecure: config.security.quantumSecure,
          shardCount: config.security.shardCount
        }
      };
      
      // Save new zone
      await this.saveTldZone(tld, zoneData);
      
      logger.info(`Created new zone: ${tld}`);
      
      return zoneData;
    } catch (error) {
      logger.error(`Failed to create zone: ${tld}`, error);
      throw error;
    }
  }
  
  /**
   * Delete a TLD zone
   * @param {string} tld - TLD name
   * @returns {boolean} True if deleted successfully
   */
  async deleteTldZone(tld) {
    try {
      // Check if zone exists
      if (!this.zones[tld]) {
        throw new Error(`Zone not found: ${tld}`);
      }
      
      // Generate zone file path
      const filePath = path.join(this.zonesPath, `${tld}.json`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Zone file not found: ${filePath}`);
      }
      
      // Delete zone file
      await fs.promises.unlink(filePath);
      
      // Remove from cache
      delete this.zones[tld];
      
      // Remove from TLD index
      this.tldIndex.delete(tld);
      
      logger.info(`Deleted zone: ${tld}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to delete zone: ${tld}`, error);
      throw error;
    }
  }
  
  /**
   * Apply fractal sharding to zone data
   * @param {Object} zoneData - Zone data to shard
   */
  async applyFractalSharding(zoneData) {
    if (!config.security.quantumSecure) {
      return;
    }
    
    try {
      logger.debug(`Applying fractal sharding to zone: ${zoneData.name}`);
      
      // Store original records
      const originalRecords = zoneData.records;
      
      // Clear sharded records from zone data
      zoneData.shardedRecords = [];
      
      // Apply sharding to each record
      for (const record of originalRecords) {
        // Generate a unique record ID
        const recordId = createHash(`${record.domain}|${record.type}|${record.value}`);
        
        // Convert record to string for sharding
        const recordString = JSON.stringify(record);
        
        // Apply fractal sharding
        const shards = fractalShard(recordString, config.security.shardCount);
        
        // Store shard IDs in record index
        zoneData.shardedRecords.push({
          id: recordId,
          domain: record.domain,
          type: record.type,
          shards: shards.map(shard => shard.id),
          threshold: shards[0].total,
          created: record.created || new Date().toISOString()
        });
        
        // Store shards in zone data
        if (!zoneData.shards) {
          zoneData.shards = {};
        }
        
        // Store each shard
        for (const shard of shards) {
          zoneData.shards[`${recordId}_${shard.id}`] = {
            id: shard.id,
            data: shard.data.toString('base64'),
            size: shard.size,
            position: shard.position,
            total: shard.total,
            parity: shard.parity || false,
            verification: shard.verification
          };
          
          if (shard.sources) {
            zoneData.shards[`${recordId}_${shard.id}`].sources = shard.sources;
          }
          
          if (shard.signature) {
            zoneData.shards[`${recordId}_${shard.id}`].signature = shard.signature;
          }
        }
      }
      
      // Update zone metadata
      zoneData.meta.sharded = true;
      zoneData.meta.shardCount = config.security.shardCount;
      zoneData.meta.recordCount = originalRecords.length;
      
      logger.debug(`Applied fractal sharding to ${originalRecords.length} records`);
    } catch (error) {
      logger.error('Failed to apply fractal sharding', error);
      
      // Restore original records if sharding fails
      if (zoneData._originalRecords) {
        zoneData.records = zoneData._originalRecords;
        delete zoneData._originalRecords;
      }
    }
  }
  
  /**
   * Reconstruct records from shards
   * @param {Object} zoneData - Zone data with shards
   * @returns {Array<Object>} Reconstructed records
   */
  reconstructRecords(zoneData) {
    if (!zoneData.shardedRecords || !zoneData.shards) {
      return zoneData.records || [];
    }
    
    try {
      logger.debug(`Reconstructing records for zone: ${zoneData.name}`);
      
      const reconstructedRecords = [];
      
      // Reconstruct each record from shards
      for (const recordIndex of zoneData.shardedRecords) {
        try {
          // Collect shards for this record
          const shards = [];
          
          for (const shardId of recordIndex.shards) {
            const shardKey = `${recordIndex.id}_${shardId}`;
            const shard = zoneData.shards[shardKey];
            
            if (shard) {
              // Convert shard to buffer
              const shardData = Buffer.from(shard.data, 'base64');
              
              // Add to shards array
              shards.push({
                id: shard.id,
                data: shardData,
                size: shard.size,
                position: shard.position,
                total: shard.total,
                parity: shard.parity,
                verification: shard.verification,
                sources: shard.sources
              });
            }
          }
          
          // Reconstruct record from shards
          const recordData = fractalReconstruct(shards);
          
          // Parse record data
          const record = JSON.parse(recordData.toString());
          
          // Add to reconstructed records
          reconstructedRecords.push(record);
        } catch (error) {
          logger.error(`Failed to reconstruct record: ${recordIndex.domain} (${recordIndex.type})`, error);
        }
      }
      
      logger.debug(`Reconstructed ${reconstructedRecords.length} records`);
      
      return reconstructedRecords;
    } catch (error) {
      logger.error('Failed to reconstruct records', error);
      return zoneData.records || [];
    }
  }
  
  /**
   * Look up a record in the DNS zone
   * @param {string} query - Query domain name
   * @param {string} type - Record type (A, AAAA, etc.)
   * @returns {Array<Object>} Array of matching records
   */
  lookupRecord(query, type) {
    try {
      // Parse query into parts
      const parts = query.toLowerCase().split('.');
      
      // The last part is the TLD
      const tld = parts[parts.length - 1];
      
      // Check if we have this TLD
      if (!this.zones[tld]) {
        logger.debug(`TLD not found: ${tld}`);
        return [];
      }
      
      // Get zone data
      const zoneData = this.zones[tld];
      
      // Get records (reconstruct if sharded)
      let records = zoneData.records;
      
      if (zoneData.shardedRecords && zoneData.shards) {
        records = this.reconstructRecords(zoneData);
      }
      
      if (!records || records.length === 0) {
        logger.debug(`No records in zone: ${tld}`);
        return [];
      }
      
      // Extract domain without TLD
      const domain = parts.slice(0, parts.length - 1).join('.');
      
      // Filter records by domain and type
      const matchingRecords = records.filter(record => {
        // Match exact domain (or wildcard)
        const domainMatch = record.domain === domain || record.domain === '*';
        
        // Match record type (or ANY)
        const typeMatch = type === 'ANY' || record.type === type;
        
        return domainMatch && typeMatch;
      });
      
      logger.debug(`Found ${matchingRecords.length} matching records for ${domain}.${tld} (${type})`);
      
      return matchingRecords;
    } catch (error) {
      logger.error(`Lookup error for ${query} (${type})`, error);
      return [];
    }
  }
  
  /**
   * Add a record to a TLD zone
   * @param {string} tld - TLD name
   * @param {Object} record - Record to add
   * @returns {boolean} True if added successfully
   */
  async addRecord(tld, record) {
    try {
      // Check if zone exists
      if (!this.zones[tld]) {
        throw new Error(`Zone not found: ${tld}`);
      }
      
      // Get zone data
      const zoneData = this.zones[tld];
      
      // Ensure records array exists
      if (!zoneData.records) {
        zoneData.records = [];
      }
      
      // Add created/updated timestamps
      record.created = new Date().toISOString();
      record.updated = new Date().toISOString();
      
      // Check if record already exists
      const existingIndex = zoneData.records.findIndex(r => 
        r.domain === record.domain && r.type === record.type
      );
      
      if (existingIndex >= 0) {
        // Update existing record
        zoneData.records[existingIndex] = {
          ...record,
          created: zoneData.records[existingIndex].created
        };
        
        logger.info(`Updated record: ${record.domain}.${tld} (${record.type})`);
      } else {
        // Add new record
        zoneData.records.push(record);
        
        logger.info(`Added record: ${record.domain}.${tld} (${record.type})`);
      }
      
      // Save zone
      await this.saveTldZone(tld, zoneData);
      
      return true;
    } catch (error) {
      logger.error(`Failed to add record to zone: ${tld}`, error);
      throw error;
    }
  }
  
  /**
   * Delete a record from a TLD zone
   * @param {string} tld - TLD name
   * @param {string} domain - Record domain
   * @param {string} type - Record type
   * @returns {boolean} True if deleted successfully
   */
  async deleteRecord(tld, domain, type) {
    try {
      // Check if zone exists
      if (!this.zones[tld]) {
        throw new Error(`Zone not found: ${tld}`);
      }
      
      // Get zone data
      const zoneData = this.zones[tld];
      
      // Ensure records array exists
      if (!zoneData.records) {
        throw new Error(`No records in zone: ${tld}`);
      }
      
      // Find record index
      const recordIndex = zoneData.records.findIndex(r => 
        r.domain === domain && r.type === type
      );
      
      if (recordIndex < 0) {
        throw new Error(`Record not found: ${domain}.${tld} (${type})`);
      }
      
      // Remove record
      zoneData.records.splice(recordIndex, 1);
      
      logger.info(`Deleted record: ${domain}.${tld} (${type})`);
      
      // Save zone
      await this.saveTldZone(tld, zoneData);
      
      return true;
    } catch (error) {
      logger.error(`Failed to delete record from zone: ${tld}`, error);
      throw error;
    }
  }
  
  /**
   * Export zone to BIND format
   * @param {string} tld - TLD name
   * @returns {string} Zone file in BIND format
   */
  exportToBind(tld) {
    try {
      // Check if zone exists
      if (!this.zones[tld]) {
        throw new Error(`Zone not found: ${tld}`);
      }
      
      // Get zone data
      const zoneData = this.zones[tld];
      
      // Get records (reconstruct if sharded)
      let records = zoneData.records;
      
      if (zoneData.shardedRecords && zoneData.shards) {
        records = this.reconstructRecords(zoneData);
      }
      
      if (!records || records.length === 0) {
        return `; Zone file for ${tld}\n; No records\n`;
      }
      
      // Build zone file
      let zoneFile = `; Zone file for ${tld}\n`;
      zoneFile += `; Exported on ${new Date().toISOString()}\n`;
      zoneFile += `$ORIGIN ${tld}.\n`;
      zoneFile += `$TTL ${config.server.ttl}\n\n`;
      
      // Add SOA record
      zoneFile += `@ IN SOA ns1.${tld}. hostmaster.${tld}. (\n`;
      zoneFile += `  ${Math.floor(Date.now() / 1000)} ; Serial\n`;
      zoneFile += `  3600       ; Refresh (1 hour)\n`;
      zoneFile += `  1800       ; Retry (30 minutes)\n`;
      zoneFile += `  604800     ; Expire (1 week)\n`;
      zoneFile += `  86400      ; Minimum TTL (1 day)\n`;
      zoneFile += `  )\n\n`;
      
      // Add NS records
      zoneFile += `; NS Records\n`;
      zoneFile += `@ IN NS ns1.${tld}.\n`;
      zoneFile += `@ IN NS ns2.${tld}.\n\n`;
      
      // Add other records
      zoneFile += `; Custom Records\n`;
      
      for (const record of records) {
        const name = record.domain === '@' ? '@' : `${record.domain}`;
        const ttl = record.ttl || config.server.ttl;
        
        switch (record.type) {
          case 'A':
            zoneFile += `${name} ${ttl} IN A ${record.value}\n`;
            break;
          case 'AAAA':
            zoneFile += `${name} ${ttl} IN AAAA ${record.value}\n`;
            break;
          case 'CNAME':
            zoneFile += `${name} ${ttl} IN CNAME ${record.value}.\n`;
            break;
          case 'MX':
            zoneFile += `${name} ${ttl} IN MX ${record.priority || 10} ${record.value}.\n`;
            break;
          case 'TXT':
            zoneFile += `${name} ${ttl} IN TXT "${record.value}"\n`;
            break;
          case 'NS':
            zoneFile += `${name} ${ttl} IN NS ${record.value}.\n`;
            break;
          default:
            zoneFile += `; Unsupported record type: ${record.type}\n`;
        }
      }
      
      return zoneFile;
    } catch (error) {
      logger.error(`Failed to export zone to BIND format: ${tld}`, error);
      throw error;
    }
  }
}

module.exports = ZoneManager;