/**
 * Zone file management utilities for FractalDNS
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { createLogger } = require('./logger');
const { signData } = require('./cryptography');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const logger = createLogger('zoneManager');

/**
 * Load zone data from a file
 * @param {string} filePath - Path to the zone file
 * @returns {object} - Parsed zone data
 */
async function loadZoneData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`Zone file not found: ${filePath}`);
      return { records: [], meta: { created: new Date().toISOString(), updated: new Date().toISOString() } };
    }
    
    const data = await readFileAsync(filePath, 'utf8');
    const zoneData = JSON.parse(data);
    
    // Ensure the zone has the required structure
    if (!zoneData.records) {
      zoneData.records = [];
    }
    
    if (!zoneData.meta) {
      zoneData.meta = {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    }
    
    logger.info(`Loaded zone file: ${filePath} with ${zoneData.records.length} records`);
    return zoneData;
  } catch (error) {
    logger.error(`Failed to load zone file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Save zone data to a file
 * @param {string} filePath - Path to the zone file
 * @param {object} zoneData - Zone data to save
 * @returns {boolean} - Success status
 */
async function saveZoneData(filePath, zoneData) {
  try {
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Update the timestamp
    if (!zoneData.meta) {
      zoneData.meta = {};
    }
    zoneData.meta.updated = new Date().toISOString();
    
    // Save the file
    await writeFileAsync(filePath, JSON.stringify(zoneData, null, 2), 'utf8');
    logger.info(`Saved zone file: ${filePath} with ${zoneData.records.length} records`);
    return true;
  } catch (error) {
    logger.error(`Failed to save zone file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Create a new zone file
 * @param {string} filePath - Path to the zone file
 * @param {string} zoneName - Name of the zone (TLD)
 * @returns {object} - New zone data
 */
async function createZoneFile(filePath, zoneName) {
  try {
    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      logger.warn(`Zone file already exists: ${filePath}`);
      return await loadZoneData(filePath);
    }
    
    // Create a new zone
    const zoneData = {
      name: zoneName,
      records: [],
      meta: {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    };
    
    // Save the file
    await saveZoneData(filePath, zoneData);
    logger.info(`Created new zone file: ${filePath}`);
    return zoneData;
  } catch (error) {
    logger.error(`Failed to create zone file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Add or update a record in a zone
 * @param {object} zoneData - Zone data
 * @param {object} record - Record to add or update
 * @returns {object} - Updated zone data
 */
function addOrUpdateRecord(zoneData, record) {
  // Ensure the record has the required fields
  if (!record.domain || !record.type || !record.value) {
    throw new Error('Record must have domain, type, and value fields');
  }
  
  // Check if the record already exists
  const existingIndex = zoneData.records.findIndex(r => 
    r.domain === record.domain && r.type === record.type
  );
  
  if (existingIndex >= 0) {
    // Update existing record
    zoneData.records[existingIndex] = {
      ...record,
      updated: new Date().toISOString()
    };
    logger.debug(`Updated record: ${record.domain} (${record.type})`);
  } else {
    // Add new record
    zoneData.records.push({
      ...record,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    });
    logger.debug(`Added record: ${record.domain} (${record.type})`);
  }
  
  // Update the zone timestamp
  zoneData.meta.updated = new Date().toISOString();
  
  return zoneData;
}

/**
 * Delete a record from a zone
 * @param {object} zoneData - Zone data
 * @param {string} domain - Record domain
 * @param {string} type - Record type
 * @returns {object} - Updated zone data
 */
function deleteRecord(zoneData, domain, type) {
  // Filter out the record
  const initialCount = zoneData.records.length;
  zoneData.records = zoneData.records.filter(r => 
    !(r.domain === domain && r.type === type)
  );
  
  // Check if any records were deleted
  if (zoneData.records.length < initialCount) {
    // Update the zone timestamp
    zoneData.meta.updated = new Date().toISOString();
    logger.debug(`Deleted record: ${domain} (${type})`);
  } else {
    logger.warn(`Record not found for deletion: ${domain} (${type})`);
  }
  
  return zoneData;
}

/**
 * Create a signed zone transfer package
 * @param {object} zoneData - Zone data
 * @param {string} privateKey - Private key for signing
 * @returns {object} - Signed zone package
 */
function createSignedZoneTransfer(zoneData, privateKey) {
  try {
    const zoneString = JSON.stringify(zoneData);
    
    // Create the signed package
    const signedPackage = {
      zone: zoneData.name,
      data: zoneData,
      timestamp: Date.now(),
      signature: signData(zoneString, privateKey)
    };
    
    logger.debug(`Created signed zone transfer for ${zoneData.name}`);
    return signedPackage;
  } catch (error) {
    logger.error(`Failed to create signed zone transfer`, error);
    throw error;
  }
}

/**
 * Export zone data to standard DNS file format
 * @param {object} zoneData - Zone data
 * @param {string} outputPath - Path to the output file
 * @returns {boolean} - Success status
 */
async function exportToBindFormat(zoneData, outputPath) {
  try {
    const tld = zoneData.name;
    let bindData = `$TTL 3600\n`;
    bindData += `@ IN SOA ns1.${tld}. admin.${tld}. (\n`;
    bindData += `    ${Math.floor(Date.now() / 1000)} ; serial\n`;
    bindData += `    3600       ; refresh\n`;
    bindData += `    1800       ; retry\n`;
    bindData += `    604800     ; expire\n`;
    bindData += `    86400      ; minimum\n`;
    bindData += `)\n\n`;
    
    // Add NS records
    bindData += `@ IN NS ns1.${tld}.\n`;
    bindData += `@ IN NS ns2.${tld}.\n\n`;
    
    // Add all other records
    for (const record of zoneData.records) {
      const ttl = record.ttl || 300;
      const domain = record.domain === `${tld}.` ? '@' : record.domain.replace(`.${tld}`, '');
      
      switch (record.type) {
        case 'A':
          bindData += `${domain} ${ttl} IN A ${record.value}\n`;
          break;
        case 'AAAA':
          bindData += `${domain} ${ttl} IN AAAA ${record.value}\n`;
          break;
        case 'CNAME':
          bindData += `${domain} ${ttl} IN CNAME ${record.value}\n`;
          break;
        case 'MX':
          bindData += `${domain} ${ttl} IN MX ${record.priority || 10} ${record.value}\n`;
          break;
        case 'TXT':
          bindData += `${domain} ${ttl} IN TXT "${record.value}"\n`;
          break;
        case 'SRV':
          bindData += `${domain} ${ttl} IN SRV ${record.priority || 0} ${record.weight || 0} ${record.port} ${record.value}\n`;
          break;
      }
    }
    
    // Save the file
    await writeFileAsync(outputPath, bindData, 'utf8');
    logger.info(`Exported zone ${tld} to BIND format: ${outputPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to export zone to BIND format`, error);
    throw error;
  }
}

module.exports = {
  loadZoneData,
  saveZoneData,
  createZoneFile,
  addOrUpdateRecord,
  deleteRecord,
  createSignedZoneTransfer,
  exportToBindFormat
};