/**
 * deploy-to-web3.js
 * Deploys Aetherion app to Web3.Storage and updates ENS records
 * 
 * This script:
 * 1. Builds the application
 * 2. Collects all files from the build directory
 * 3. Uploads to Web3.Storage (IPFS/Filecoin)
 * 4. Updates ENS domain record with new CID (if configured)
 * 5. Outputs deployment information
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Web3Storage, getFilesFromPath } = require('web3.storage');
const { ethers } = require('ethers');

// Environment variables
const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN;
const ENS_PRIVATE_KEY = process.env.ENS_PRIVATE_KEY;
const ENS_DOMAIN = process.env.ENS_DOMAIN;
const ETH_NETWORK = process.env.ETH_NETWORK || 'mainnet';

// Constants
const BUILD_DIR = path.join(__dirname, '../dist');
const GATEWAY_URL = 'ipfs.dweb.link';

/**
 * Get all files from a directory recursively
 * @param {string} directory - Directory to scan
 * @returns {Promise<File[]>} - Array of File objects
 */
async function getFilesFromDirectory(directory) {
  try {
    const files = await getFilesFromPath(directory);
    console.log(`Found ${files.length} files in ${directory}`);
    return files;
  } catch (error) {
    console.error('Error getting files from directory:', error);
    throw error;
  }
}

/**
 * Deploy build directory to Web3.Storage
 * @param {string} buildDir - Directory containing built application
 * @returns {Promise<string>} - IPFS CID for the deployed content
 */
async function deployToWeb3Storage(buildDir) {
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error('WEB3_STORAGE_TOKEN environment variable is required');
  }

  try {
    // Initialize Web3.Storage client
    const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
    
    // Get all files from build directory
    const files = await getFilesFromDirectory(buildDir);
    
    // Upload files to Web3.Storage
    console.log(`Uploading ${files.length} files to Web3.Storage...`);
    const cid = await client.put(files, {
      name: 'Aetherion Wallet',
      maxRetries: 3,
      wrapWithDirectory: false // Don't wrap with an additional directory
    });
    
    console.log(`📦 Files uploaded! CID: ${cid}`);
    console.log(`🔗 Gateway URL: https://${cid}.${GATEWAY_URL}/`);
    
    return cid;
  } catch (error) {
    console.error('Error deploying to Web3.Storage:', error);
    throw error;
  }
}

/**
 * Update ENS record with new IPFS CID
 * @param {string} cid - IPFS CID to set as contenthash
 * @returns {Promise<void>}
 */
async function updateENSRecord(cid) {
  if (!ENS_PRIVATE_KEY || !ENS_DOMAIN) {
    console.log('ENS_PRIVATE_KEY or ENS_DOMAIN not set, skipping ENS record update');
    return;
  }

  try {
    // Initialize Ethers provider
    const provider = new ethers.providers.InfuraProvider(ETH_NETWORK);
    const wallet = new ethers.Wallet(ENS_PRIVATE_KEY, provider);
    
    // Initialize ENS
    const ens = new ethers.Contract(
      // ENS Registry address
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      ['function setResolver(bytes32 node, address resolver) public'],
      wallet
    );
    
    // Get ENS resolver
    console.log(`Getting ENS resolver for ${ENS_DOMAIN}...`);
    const ensName = ENS_DOMAIN.endsWith('.eth') ? ENS_DOMAIN : `${ENS_DOMAIN}.eth`;
    const resolver = await provider.getResolver(ensName);
    
    if (!resolver) {
      throw new Error(`No resolver found for ${ensName}`);
    }
    
    // Format the IPFS CID as contenthash
    const ipfsContentId = `ipfs://${cid}`;
    
    // Update contenthash
    console.log(`Updating contenthash for ${ensName} to ${ipfsContentId}...`);
    const tx = await resolver.connect(wallet).setContenthash(
      ethers.utils.namehash(ensName),
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(ipfsContentId))
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    
    console.log(`✅ ENS record updated for ${ensName}`);
    console.log(`🔗 ENS URL: https://${ensName}.link/`);
  } catch (error) {
    console.error('Error updating ENS record:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Check if build directory exists
    if (!fs.existsSync(BUILD_DIR)) {
      throw new Error(`Build directory not found: ${BUILD_DIR}`);
    }
    
    // Deploy to Web3.Storage
    const cid = await deployToWeb3Storage(BUILD_DIR);
    
    // Update ENS record if configured
    if (ENS_PRIVATE_KEY && ENS_DOMAIN) {
      await updateENSRecord(cid);
    }
    
    // Output deployment information
    console.log('\n--- Deployment Summary ---');
    console.log(`IPFS CID: ${cid}`);
    console.log(`Gateway URL: https://${cid}.${GATEWAY_URL}/`);
    
    if (ENS_DOMAIN) {
      const ensName = ENS_DOMAIN.endsWith('.eth') ? ENS_DOMAIN : `${ENS_DOMAIN}.eth`;
      console.log(`ENS Domain: ${ensName}`);
      console.log(`ENS URL: https://${ensName}.link/`);
    }
    
    console.log('\nDeployment complete! 🎉');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Execute main function
main();