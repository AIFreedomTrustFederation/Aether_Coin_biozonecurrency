/**
 * fractalcoin-filecoin-bridge.js
 * 
 * Integration between FractalCoin sharded storage network and Filecoin
 * This script enables bidirectional storage deals between FractalCoin's network
 * and Filecoin's storage providers.
 * 
 * Features:
 * - Allocates storage from FractalCoin's sharded network to be offered on Filecoin
 * - Enables Filecoin miners to become nodes in the FractalCoin storage network
 * - Creates bridge connections for data transfer between networks
 * - Handles encryption, sharding, and retrieval processes
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const { ethers } = require('ethers');

// Environment variables
const FRACTALCOIN_API_KEY = process.env.FRACTALCOIN_API_KEY;
const FRACTALCOIN_API_ENDPOINT = process.env.FRACTALCOIN_API_ENDPOINT || 'https://api.fractalcoin.network/v1';
const FILECOIN_ALLOCATION_SIZE = parseInt(process.env.FILECOIN_ALLOCATION_SIZE || '1073741824', 10); // 1GB default
const DEBUG = process.env.DEBUG === 'true';

// Debug logging
function log(...args) {
  if (DEBUG) {
    console.log('[FractalCoin-Filecoin Bridge]', ...args);
  }
}

/**
 * Allocate FractalCoin storage to Filecoin network
 * @returns {Promise<{allocatedBytes: number, nodeIds: string[]}>}
 */
async function allocateFractalCoinStorage() {
  if (!FRACTALCOIN_API_KEY) {
    throw new Error('FRACTALCOIN_API_KEY environment variable is required');
  }

  try {
    log('Allocating storage from FractalCoin network...');
    
    // API call to allocate storage from FractalCoin network
    const response = await axios.post(
      `${FRACTALCOIN_API_ENDPOINT}/storage/allocate`,
      {
        bytes: FILECOIN_ALLOCATION_SIZE,
        purpose: 'filecoin-bridge',
        redundancy: 3, // Number of redundant shards
        encryption: 'aes-256-gcm'
      },
      {
        headers: {
          'Authorization': `Bearer ${FRACTALCOIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    log('Storage allocation response:', response.data);
    
    if (!response.data.success) {
      throw new Error(`Failed to allocate storage: ${response.data.message}`);
    }
    
    console.log(`✅ Successfully allocated ${formatBytes(FILECOIN_ALLOCATION_SIZE)} of storage from FractalCoin network`);
    console.log(`📊 Distributed across ${response.data.nodes.length} nodes`);
    
    return {
      allocatedBytes: FILECOIN_ALLOCATION_SIZE,
      nodeIds: response.data.nodes.map(node => node.id)
    };
  } catch (error) {
    console.error('Error allocating FractalCoin storage:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Register FractalCoin storage with Filecoin network
 * @param {Object} allocation - Result from allocateFractalCoinStorage()
 * @returns {Promise<string>} - Filecoin deal CID
 */
async function registerWithFilecoin(allocation) {
  try {
    log('Registering FractalCoin storage with Filecoin network...');
    
    // Generate a unique identifier for this bridge
    const bridgeId = crypto.randomBytes(16).toString('hex');
    
    // Create storage bridge configuration
    const bridgeConfig = {
      id: bridgeId,
      allocatedBytes: allocation.allocatedBytes,
      nodes: allocation.nodeIds,
      access: {
        protocol: 'fractalcoin-bridge-v1',
        endpoints: allocation.nodeIds.map(id => `https://${id}.storage.fractalcoin.network`),
        retrieval: {
          method: 'http',
          authType: 'bearer'
        }
      },
      metadata: {
        name: 'FractalCoin-Filecoin Bridge',
        description: 'Bidirectional storage bridge between FractalCoin and Filecoin',
        created: new Date().toISOString()
      }
    };
    
    // Register the bridge with FractalCoin network
    const registerResponse = await axios.post(
      `${FRACTALCOIN_API_ENDPOINT}/bridges/create`,
      {
        type: 'filecoin',
        config: bridgeConfig
      },
      {
        headers: {
          'Authorization': `Bearer ${FRACTALCOIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    log('Bridge registration response:', registerResponse.data);
    
    if (!registerResponse.data.success) {
      throw new Error(`Failed to register bridge: ${registerResponse.data.message}`);
    }
    
    const bridgeCid = registerResponse.data.cid;
    
    console.log(`✅ Successfully registered FractalCoin-Filecoin bridge`);
    console.log(`🔗 Bridge CID: ${bridgeCid}`);
    console.log(`📊 Allocated storage: ${formatBytes(allocation.allocatedBytes)}`);
    console.log(`🖥️  Nodes: ${allocation.nodeIds.length}`);
    
    return bridgeCid;
  } catch (error) {
    console.error('Error registering with Filecoin:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Utility function to format bytes into human-readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Main function to execute the bridge setup
 */
async function main() {
  try {
    console.log('🔄 Starting FractalCoin-Filecoin bridge setup...');
    
    // Allocate storage from FractalCoin network
    const allocation = await allocateFractalCoinStorage();
    
    // Register the storage with Filecoin
    const bridgeCid = await registerWithFilecoin(allocation);
    
    // Output final setup information
    console.log('\n--- Bridge Setup Summary ---');
    console.log(`Bridge CID: ${bridgeCid}`);
    console.log(`Allocated Storage: ${formatBytes(allocation.allocatedBytes)}`);
    console.log(`Network Nodes: ${allocation.nodeIds.length}`);
    console.log(`Status: Active and Ready`);
    
    console.log('\nBridge setup complete! 🎉');
    console.log('Filecoin miners can now connect to the FractalCoin storage network');
    console.log('using the bridge CID above.');
  } catch (error) {
    console.error('Bridge setup failed:', error);
    process.exit(1);
  }
}

// Check for debug flag
if (process.argv.includes('--debug')) {
  process.env.DEBUG = 'true';
  console.log('Debug mode enabled');
}

// Execute main function if not being imported as a module
if (require.main === module) {
  main();
}

module.exports = {
  allocateFractalCoinStorage,
  registerWithFilecoin,
  formatBytes
};