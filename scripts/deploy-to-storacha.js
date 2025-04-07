/**
 * deploy-to-storacha.js
 * Deploys Aetherion app to Storacha and updates ENS records
 * 
 * This script:
 * 1. Builds the application
 * 2. Collects all files from the build directory
 * 3. Uploads to Storacha (IPFS/Filecoin alternative)
 * 4. Updates ENS domain record with new CID (if configured)
 * 5. Outputs deployment information
 */

// Using ESM syntax for Node.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const STORACHA_API_KEY = process.env.STORACHA_API_KEY;
const ENS_PRIVATE_KEY = process.env.ENS_PRIVATE_KEY;
const ENS_DOMAIN = process.env.ENS_DOMAIN;
const ETH_NETWORK = process.env.ETH_NETWORK || 'mainnet';

// Constants
const BUILD_DIR = path.join(__dirname, '../dist');
const STORACHA_API_URL = 'https://api.storacha.io/v1/upload';
const GATEWAY_URL = 'storacha.io';

/**
 * Get all files from a directory recursively
 * @param {string} directory - Directory to scan
 * @returns {Promise<Array<{path: string, content: Buffer}>>} - Array of file objects
 */
async function getFilesFromDirectory(directory) {
  try {
    const files = [];
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        const subDirFiles = await getFilesFromDirectory(fullPath);
        files.push(...subDirFiles);
      } else {
        // Create relative path from the build directory
        const relativePath = path.relative(BUILD_DIR, fullPath);
        const content = fs.readFileSync(fullPath);
        files.push({ path: relativePath, content });
      }
    }

    console.log(`Found ${files.length} files in ${directory}`);
    return files;
  } catch (error) {
    console.error('Error getting files from directory:', error);
    throw error;
  }
}

/**
 * Deploy build directory to Storacha
 * @param {string} buildDir - Directory containing built application
 * @returns {Promise<string>} - IPFS CID for the deployed content
 */
async function deployToStoracha(buildDir) {
  if (!STORACHA_API_KEY) {
    throw new Error('STORACHA_API_KEY environment variable is required');
  }

  try {
    // Get all files from build directory
    const files = await getFilesFromDirectory(buildDir);
    
    // Create form data for upload
    const formData = new FormData();
    
    // Add each file to the form data
    for (const file of files) {
      formData.append('files', file.content, {
        filename: file.path,
        filepath: file.path,
      });
    }
    
    // Add metadata
    formData.append('name', 'Aetherion Wallet');
    
    console.log(`Uploading ${files.length} files to Storacha...`);
    
    // Upload to Storacha
    const response = await axios.post(STORACHA_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${STORACHA_API_KEY}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    if (response.status !== 200 || !response.data.cid) {
      throw new Error(`Failed to upload to Storacha: ${JSON.stringify(response.data)}`);
    }
    
    const cid = response.data.cid;
    console.log(`📦 Files uploaded! CID: ${cid}`);
    console.log(`🔗 Gateway URL: https://${cid}.${GATEWAY_URL}/`);
    
    return cid;
  } catch (error) {
    console.error('Error deploying to Storacha:', error);
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
    
    // Deploy to Storacha
    const cid = await deployToStoracha(BUILD_DIR);
    
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