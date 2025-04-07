
const core = require('@actions/core');
const { Web3Storage } = require('web3.storage');
const crypto = require('crypto');

async function run() {
  try {
    const ipfsHash = core.getInput('ipfs_hash', { required: true });
    
    // Retrieve encrypted data from IPFS
    const storage = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
    const encryptedData = await storage.get(ipfsHash);
    
    if (!encryptedData) {
      throw new Error('Failed to retrieve secrets from IPFS');
    }

    // Decrypt and set environment variables
    const decryptedData = JSON.parse(encryptedData);
    for (const [key, value] of Object.entries(decryptedData)) {
      core.exportVariable(key, value);
    }
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
