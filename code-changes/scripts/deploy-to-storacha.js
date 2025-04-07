/**
 * deploy-to-storacha.js
 * Deploys Aetherion app to Storacha and updates ENS records
 * 
 * This script:
 * 1. Builds the application if not already built
 * 2. Collects all files from the build directory
 * 3. Uploads to Storacha (IPFS)
 * 4. Updates ENS domain record with new CID (if configured)
 * 5. Outputs deployment information
 */

import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const STORACHA_API_ENDPOINT = 'https://api.storacha.io/v1/upload';
const STORACHA_API_KEY = process.env.STORACHA_API_KEY;
const ENS_PRIVATE_KEY = process.env.ENS_PRIVATE_KEY;
const ENS_DOMAIN = process.env.ENS_DOMAIN;
const BUILD_DIR = './dist';

/**
 * Get all files from a directory recursively
 * @param {string} directory - Directory to scan
 * @returns {Promise<Array<{path: string, content: Buffer}>>} - Array of file objects
 */
async function getFilesFromDirectory(directory) {
  const files = [];
  
  async function scanDirectory(currentDir, baseDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath, baseDir);
      } else {
        const content = await fs.readFile(fullPath);
        files.push({
          path: relativePath,
          content
        });
      }
    }
  }
  
  await scanDirectory(directory, directory);
  return files;
}

/**
 * Deploy build directory to Storacha
 * @param {string} buildDir - Directory containing built application
 * @returns {Promise<string>} - IPFS CID for the deployed content
 */
async function deployToStoracha(buildDir) {
  console.log('📦 Collecting files from build directory...');
  const files = await getFilesFromDirectory(buildDir);
  console.log(`Found ${files.length} files to upload.`);
  
  // Prepare FormData with files
  const formData = new FormData();
  
  // Add each file to FormData
  for (const file of files) {
    // Convert Buffer to Blob for browser compatibility
    const blob = new Blob([file.content]);
    formData.append('files', blob, file.path);
  }
  
  console.log('🚀 Uploading to Storacha...');
  
  try {
    const response = await axios.post(STORACHA_API_ENDPOINT, formData, {
      headers: {
        'Authorization': `Bearer ${STORACHA_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.status === 200 && response.data.cid) {
      return response.data.cid;
    } else {
      throw new Error('Invalid response from Storacha API');
    }
  } catch (error) {
    console.error('❌ Error uploading to Storacha:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.data);
    }
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
    console.log('⚠️ ENS update skipped: missing ENS_PRIVATE_KEY or ENS_DOMAIN');
    return;
  }
  
  console.log(`🔄 Updating ENS domain ${ENS_DOMAIN} with CID ${cid}...`);
  
  try {
    const provider = new ethers.providers.InfuraProvider('mainnet');
    const wallet = new ethers.Wallet(ENS_PRIVATE_KEY, provider);
    
    // Convert IPFS CID to contenthash format
    const contentHash = `ipfs://${cid}`;
    
    // Get ENS registry and resolver
    const ensRegistry = new ethers.Contract(
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      ['function resolver(bytes32 node) view returns (address)'],
      wallet
    );
    
    const nameHash = ethers.utils.namehash(ENS_DOMAIN);
    const resolverAddress = await ensRegistry.resolver(nameHash);
    
    if (!resolverAddress || resolverAddress === ethers.constants.AddressZero) {
      throw new Error(`No resolver found for ${ENS_DOMAIN}`);
    }
    
    // Connect to the resolver
    const resolver = new ethers.Contract(
      resolverAddress,
      ['function setContenthash(bytes32 node, bytes contenthash) public'],
      wallet
    );
    
    // Encode the IPFS content hash
    const encodedContentHash = ethers.utils.hexlify(
      ethers.utils.base58.decode(cid).slice(2)
    );
    
    // Update the content hash
    const tx = await resolver.setContenthash(
      nameHash,
      encodedContentHash,
      { gasLimit: 100000 }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ ENS record updated successfully!`);
    
  } catch (error) {
    console.error('❌ Error updating ENS record:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Check if API key is available
    if (!STORACHA_API_KEY) {
      throw new Error('STORACHA_API_KEY is not set in environment variables');
    }
    
    // Check if build directory exists
    try {
      await fs.access(BUILD_DIR);
    } catch (error) {
      console.log('🔧 Build directory not found, running build first...');
      // You would typically run a build command here
      // e.g., await execAsync('npm run build');
      throw new Error('Build directory not found. Please run "npm run build" first.');
    }
    
    // Deploy to Storacha
    const cid = await deployToStoracha(BUILD_DIR);
    console.log(`✅ Deployment successful! CID: ${cid}`);
    console.log(`🌍 Your app is available at: https://${cid}.ipfs.dweb.link/`);
    console.log(`🌍 Gateway URL: https://ipfs.io/ipfs/${cid}/`);
    console.log(`🌍 Storacha URL: https://storacha.io/ipfs/${cid}/`);
    
    // Update ENS record if configured
    if (ENS_PRIVATE_KEY && ENS_DOMAIN) {
      await updateENSRecord(cid);
      console.log(`🌍 ENS Website: https://${ENS_DOMAIN}.limo/`);
    }
    
    return cid;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);