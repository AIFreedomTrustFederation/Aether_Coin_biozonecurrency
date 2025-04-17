#!/usr/bin/env node

/**
 * Command Line Interface for FractalDNS
 * Provides management of the DNS server, zones, and records
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createLogger } = require('./utils/logger');
const { loadZoneData, saveZoneData, addOrUpdateRecord, deleteRecord, exportToBindFormat } = require('./utils/zoneManager');
const FractalDnsServer = require('./fractalDnsServer');
const config = require('./config');

// Initialize logger
const logger = createLogger('cli');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Global reference to the DNS server
let dnsServer = null;

/**
 * Display the help menu
 */
function showHelp() {
  console.log('\nFractalDNS CLI - Command Line Interface');
  console.log('=======================================\n');
  console.log('Available commands:');
  console.log('  start                   - Start the DNS server');
  console.log('  stop                    - Stop the DNS server');
  console.log('  status                  - Show server status');
  console.log('  list-zones              - List all TLD zones');
  console.log('  create-zone <tld>       - Create a new TLD zone');
  console.log('  list-records <tld>      - List records for a TLD');
  console.log('  add-record              - Add a new DNS record (interactive)');
  console.log('  delete-record           - Delete a DNS record (interactive)');
  console.log('  export-zone <tld> <file>- Export a zone to BIND format');
  console.log('  reload-config           - Reload server configuration');
  console.log('  clear                   - Clear the screen');
  console.log('  help                    - Show this help menu');
  console.log('  exit                    - Exit the CLI');
  console.log('\n');
}

/**
 * Start the DNS server
 */
async function startServer() {
  if (dnsServer) {
    console.log('DNS server is already running.');
    return;
  }
  
  try {
    console.log('Starting FractalDNS server...');
    
    // Initialize the server
    dnsServer = new FractalDnsServer({
      port: config.server.port,
      address: config.server.address,
      ttl: config.server.ttl,
      zonesPath: config.server.zonesPath,
      shardCount: config.security.shardCount,
      quantumSecure: config.security.quantumSecure
    });
    
    // Start the server
    await dnsServer.start();
    
    console.log(`FractalDNS server started. Listening on ${config.server.address}:${config.server.port}`);
  } catch (error) {
    console.error('Failed to start DNS server:', error);
  }
}

/**
 * Stop the DNS server
 */
async function stopServer() {
  if (!dnsServer) {
    console.log('DNS server is not running.');
    return;
  }
  
  try {
    console.log('Stopping FractalDNS server...');
    
    // Stop the server
    await dnsServer.stop();
    dnsServer = null;
    
    console.log('FractalDNS server stopped.');
  } catch (error) {
    console.error('Failed to stop DNS server:', error);
  }
}

/**
 * Show server status
 */
function showStatus() {
  if (dnsServer) {
    console.log('FractalDNS server is running.');
    
    // Get TLD zones
    const zones = dnsServer.getTldZones();
    console.log(`Server is managing ${zones.length} TLD zones:`);
    
    for (const zone of zones) {
      console.log(`  - ${zone.name}: ${zone.recordCount} records (last updated: ${zone.updated})`);
    }
    
    console.log(`DNS server configured with quantum security: ${config.security.quantumSecure ? 'Enabled' : 'Disabled'}`);
  } else {
    console.log('FractalDNS server is not running.');
  }
}

/**
 * List all TLD zones
 */
async function listZones() {
  try {
    // If server is running, get zones from it
    if (dnsServer) {
      const zones = dnsServer.getTldZones();
      
      console.log(`\nManaged TLD Zones (${zones.length}):\n`);
      
      for (const zone of zones) {
        console.log(`  .${zone.name} - ${zone.recordCount} records`);
      }
      
      console.log('');
      return;
    }
    
    // Otherwise, read from the files
    const zonesDir = config.server.zonesPath;
    
    if (!fs.existsSync(zonesDir)) {
      console.log('Zones directory not found. No zones available.');
      return;
    }
    
    const zoneFiles = fs.readdirSync(zonesDir).filter(file => file.endsWith('.json'));
    
    console.log(`\nManaged TLD Zones (${zoneFiles.length}):\n`);
    
    for (const file of zoneFiles) {
      const zoneData = await loadZoneData(path.join(zonesDir, file));
      const tld = path.basename(file, '.json');
      
      console.log(`  .${tld} - ${zoneData.records.length} records`);
    }
    
    console.log('');
  } catch (error) {
    console.error('Failed to list zones:', error);
  }
}

/**
 * Create a new TLD zone
 * @param {string} tld - TLD name
 */
async function createZone(tld) {
  if (!tld) {
    console.log('Please specify a TLD name (without the dot).');
    return;
  }
  
  // Clean the TLD
  tld = tld.trim().toLowerCase();
  
  if (tld.startsWith('.')) {
    tld = tld.substring(1);
  }
  
  try {
    const zonesDir = config.server.zonesPath;
    
    // Ensure the zones directory exists
    if (!fs.existsSync(zonesDir)) {
      fs.mkdirSync(zonesDir, { recursive: true });
    }
    
    const zonePath = path.join(zonesDir, `${tld}.json`);
    
    // Check if the zone already exists
    if (fs.existsSync(zonePath)) {
      console.log(`Zone .${tld} already exists.`);
      return;
    }
    
    // Create a new zone
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
    
    // Save the zone file
    await saveZoneData(zonePath, zoneData);
    
    console.log(`Created new TLD zone: .${tld}`);
    
    // If the server is running, reload the zone
    if (dnsServer) {
      await dnsServer.loadTldZones();
      console.log('Server reloaded the new zone.');
    }
  } catch (error) {
    console.error(`Failed to create zone .${tld}:`, error);
  }
}

/**
 * List records for a TLD zone
 * @param {string} tld - TLD name
 */
async function listRecords(tld) {
  if (!tld) {
    console.log('Please specify a TLD name (without the dot).');
    return;
  }
  
  // Clean the TLD
  tld = tld.trim().toLowerCase();
  
  if (tld.startsWith('.')) {
    tld = tld.substring(1);
  }
  
  try {
    let records = [];
    
    // If server is running, get records from it
    if (dnsServer) {
      const zones = dnsServer.getTldZones();
      const zone = zones.find(z => z.name === tld);
      
      if (!zone) {
        console.log(`Zone .${tld} not found.`);
        return;
      }
      
      for (const domain of Object.keys(dnsServer.zones[tld].records)) {
        records.push(...dnsServer.zones[tld].records[domain]);
      }
    } else {
      // Otherwise, read from the file
      const zonePath = path.join(config.server.zonesPath, `${tld}.json`);
      
      if (!fs.existsSync(zonePath)) {
        console.log(`Zone .${tld} not found.`);
        return;
      }
      
      const zoneData = await loadZoneData(zonePath);
      records = zoneData.records;
    }
    
    console.log(`\nRecords for .${tld} (${records.length}):\n`);
    
    // Group records by domain
    const domains = {};
    
    for (const record of records) {
      if (!domains[record.domain]) {
        domains[record.domain] = [];
      }
      
      domains[record.domain].push(record);
    }
    
    // Display records by domain
    for (const domain of Object.keys(domains).sort()) {
      console.log(`Domain: ${domain}`);
      
      for (const record of domains[domain]) {
        console.log(`  ${record.type} → ${record.value} (TTL: ${record.ttl || config.server.ttl})`);
      }
      
      console.log('');
    }
  } catch (error) {
    console.error(`Failed to list records for .${tld}:`, error);
  }
}

/**
 * Add a new DNS record (interactive)
 */
async function addRecord() {
  try {
    // List zones first
    await listZones();
    
    // Get TLD
    const tld = await promptQuestion('Enter TLD (without the dot): ');
    
    if (!tld) {
      console.log('Operation cancelled.');
      return;
    }
    
    // Load the zone
    const zonePath = path.join(config.server.zonesPath, `${tld.trim().toLowerCase()}.json`);
    
    if (!fs.existsSync(zonePath)) {
      console.log(`Zone .${tld} not found.`);
      return;
    }
    
    const zoneData = await loadZoneData(zonePath);
    
    // Get record details
    const domain = await promptQuestion('Enter domain name (e.g., example.com or sub.example.com): ');
    
    if (!domain) {
      console.log('Operation cancelled.');
      return;
    }
    
    // Show available record types
    console.log('\nAvailable record types:');
    console.log('  A     - IPv4 address record');
    console.log('  AAAA  - IPv6 address record');
    console.log('  CNAME - Canonical name record (alias)');
    console.log('  MX    - Mail exchange record');
    console.log('  TXT   - Text record');
    console.log('  NS    - Name server record');
    
    const type = await promptQuestion('Enter record type: ');
    
    if (!['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'].includes(type.toUpperCase())) {
      console.log(`Unsupported record type: ${type}`);
      return;
    }
    
    const value = await promptQuestion('Enter record value: ');
    
    if (!value) {
      console.log('Operation cancelled.');
      return;
    }
    
    const ttlStr = await promptQuestion(`Enter TTL (seconds, default: ${config.server.ttl}): `);
    const ttl = ttlStr ? parseInt(ttlStr, 10) : config.server.ttl;
    
    if (isNaN(ttl) || ttl < 0) {
      console.log('Invalid TTL. Using default value.');
    }
    
    // Create the record
    const record = {
      domain,
      type: type.toUpperCase(),
      value,
      ttl: isNaN(ttl) ? config.server.ttl : ttl
    };
    
    // Add priority for MX records
    if (type.toUpperCase() === 'MX') {
      const priorityStr = await promptQuestion('Enter priority (default: 10): ');
      const priority = priorityStr ? parseInt(priorityStr, 10) : 10;
      
      if (isNaN(priority) || priority < 0) {
        console.log('Invalid priority. Using default value.');
      }
      
      record.priority = isNaN(priority) ? 10 : priority;
    }
    
    // Add the record to the zone
    const updatedZone = addOrUpdateRecord(zoneData, record);
    
    // Save the zone file
    await saveZoneData(zonePath, updatedZone);
    
    console.log(`Added/updated ${type.toUpperCase()} record for ${domain}`);
    
    // If the server is running, reload the zone
    if (dnsServer) {
      await dnsServer.loadTldZones();
      console.log('Server reloaded the updated zone.');
    }
  } catch (error) {
    console.error('Failed to add record:', error);
  }
}

/**
 * Delete a DNS record (interactive)
 */
async function deleteRecord() {
  try {
    // List zones first
    await listZones();
    
    // Get TLD
    const tld = await promptQuestion('Enter TLD (without the dot): ');
    
    if (!tld) {
      console.log('Operation cancelled.');
      return;
    }
    
    // Load the zone
    const zonePath = path.join(config.server.zonesPath, `${tld.trim().toLowerCase()}.json`);
    
    if (!fs.existsSync(zonePath)) {
      console.log(`Zone .${tld} not found.`);
      return;
    }
    
    const zoneData = await loadZoneData(zonePath);
    
    // List records for the zone
    console.log(`\nRecords for .${tld} (${zoneData.records.length}):\n`);
    
    // Map records by ID for deletion
    const recordsById = {};
    let counter = 1;
    
    for (const record of zoneData.records) {
      const id = counter++;
      recordsById[id] = record;
      console.log(`  ${id}. ${record.domain} (${record.type}) → ${record.value}`);
    }
    
    console.log('');
    
    // Get record ID to delete
    const idStr = await promptQuestion('Enter record ID to delete (or 0 to cancel): ');
    const id = parseInt(idStr, 10);
    
    if (isNaN(id) || id === 0 || !recordsById[id]) {
      console.log('Operation cancelled.');
      return;
    }
    
    const recordToDelete = recordsById[id];
    
    // Confirm deletion
    const confirm = await promptQuestion(`Are you sure you want to delete the ${recordToDelete.type} record for ${recordToDelete.domain}? (y/n): `);
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      return;
    }
    
    // Delete the record
    const updatedZone = deleteRecord(zoneData, recordToDelete.domain, recordToDelete.type);
    
    // Save the zone file
    await saveZoneData(zonePath, updatedZone);
    
    console.log(`Deleted ${recordToDelete.type} record for ${recordToDelete.domain}`);
    
    // If the server is running, reload the zone
    if (dnsServer) {
      await dnsServer.loadTldZones();
      console.log('Server reloaded the updated zone.');
    }
  } catch (error) {
    console.error('Failed to delete record:', error);
  }
}

/**
 * Export a zone to BIND format
 * @param {string} tld - TLD name
 * @param {string} file - Output file path
 */
async function exportZone(tld, file) {
  if (!tld) {
    console.log('Please specify a TLD name (without the dot).');
    return;
  }
  
  if (!file) {
    console.log('Please specify an output file path.');
    return;
  }
  
  // Clean the TLD
  tld = tld.trim().toLowerCase();
  
  if (tld.startsWith('.')) {
    tld = tld.substring(1);
  }
  
  try {
    // Load the zone
    const zonePath = path.join(config.server.zonesPath, `${tld}.json`);
    
    if (!fs.existsSync(zonePath)) {
      console.log(`Zone .${tld} not found.`);
      return;
    }
    
    const zoneData = await loadZoneData(zonePath);
    
    // Export to BIND format
    await exportToBindFormat(zoneData, file);
    
    console.log(`Exported zone .${tld} to ${file}`);
  } catch (error) {
    console.error(`Failed to export zone .${tld}:`, error);
  }
}

/**
 * Reload server configuration
 */
async function reloadConfig() {
  try {
    console.log('Reloading configuration...');
    
    // Clear the require cache for the config file
    delete require.cache[require.resolve('./config')];
    
    // Re-import the config
    const newConfig = require('./config');
    
    // Update config reference
    Object.assign(config, newConfig);
    
    console.log('Configuration reloaded.');
    
    // If the server is running, restart it
    if (dnsServer) {
      console.log('Restarting DNS server with new configuration...');
      
      await dnsServer.stop();
      dnsServer = null;
      
      await startServer();
    }
  } catch (error) {
    console.error('Failed to reload configuration:', error);
  }
}

/**
 * Clear the screen
 */
function clearScreen() {
  console.clear();
  showBanner();
}

/**
 * Show the banner
 */
function showBanner() {
  console.log('\n=== FractalDNS Server for Aetherion ===');
  console.log('Quantum-resistant DNS system for the FractalCoin TLD\n');
}

/**
 * Prompt for user input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User input
 */
function promptQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Process a CLI command
 * @param {string} input - User input
 */
async function processCommand(input) {
  const args = input.trim().split(' ');
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'start':
      await startServer();
      break;
    case 'stop':
      await stopServer();
      break;
    case 'status':
      showStatus();
      break;
    case 'list-zones':
      await listZones();
      break;
    case 'create-zone':
      await createZone(args[1]);
      break;
    case 'list-records':
      await listRecords(args[1]);
      break;
    case 'add-record':
      await addRecord();
      break;
    case 'delete-record':
      await deleteRecord();
      break;
    case 'export-zone':
      await exportZone(args[1], args[2]);
      break;
    case 'reload-config':
      await reloadConfig();
      break;
    case 'clear':
      clearScreen();
      break;
    case 'help':
      showHelp();
      break;
    case 'exit':
      console.log('Exiting FractalDNS CLI...');
      
      if (dnsServer) {
        await stopServer();
      }
      
      rl.close();
      process.exit(0);
      break;
    case '':
      // Empty command, do nothing
      break;
    default:
      console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
      break;
  }
}

/**
 * Main function
 */
async function main() {
  clearScreen();
  showHelp();
  
  rl.on('line', async (input) => {
    try {
      await processCommand(input);
    } catch (error) {
      console.error('Error processing command:', error);
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('FractalDNS CLI terminated.');
    process.exit(0);
  });
  
  // Start the prompt
  rl.setPrompt('fractalDNS> ');
  rl.prompt();
}

// Start the CLI
main().catch(console.error);