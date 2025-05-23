/**
 * Merkle Tree Utilities
 * 
 * This file provides utilities for creating and validating Merkle trees.
 * Merkle trees are binary trees of hashes used to efficiently verify
 * the integrity of transactions in a block.
 */

import { SHA256 } from 'crypto-js';
import { Transaction } from '../types';

/**
 * Calculate the Merkle root from an array of transactions
 * @param transactions Array of transactions
 * @returns Merkle root hash
 */
export function calculateMerkleRoot(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }
  
  // Extract transaction IDs
  let hashes = transactions.map(tx => tx.id);
  
  // If odd number of elements, duplicate the last one
  if (hashes.length % 2 !== 0) {
    hashes.push(hashes[hashes.length - 1]);
  }
  
  // Build the Merkle tree
  while (hashes.length > 1) {
    const levelHashes: string[] = [];
    
    // Process pairs of hashes
    for (let i = 0; i < hashes.length; i += 2) {
      const combinedHash = SHA256(hashes[i] + hashes[i + 1]).toString();
      levelHashes.push(combinedHash);
    }
    
    hashes = levelHashes;
    
    // If odd number of hashes, duplicate the last one
    if (hashes.length % 2 !== 0 && hashes.length > 1) {
      hashes.push(hashes[hashes.length - 1]);
    }
  }
  
  return hashes[0];
}

/**
 * Verify that a transaction is included in a given Merkle root
 * @param txId Transaction ID to verify
 * @param merkleRoot Merkle root hash
 * @param proof Merkle proof (array of hashes needed to reconstruct the root)
 * @param index Position of the transaction in the original list
 * @returns True if the transaction is included in the Merkle root
 */
export function verifyMerkleProof(
  txId: string,
  merkleRoot: string,
  proof: string[],
  index: number
): boolean {
  let hash = txId;
  
  for (let i = 0; i < proof.length; i++) {
    const isRightNode = index % 2 === 0;
    const pairHash = proof[i];
    
    // Combine the current hash with its pair based on position
    if (isRightNode) {
      hash = SHA256(hash + pairHash).toString();
    } else {
      hash = SHA256(pairHash + hash).toString();
    }
    
    // Move up one level in the tree
    index = Math.floor(index / 2);
  }
  
  // The final hash should equal the Merkle root
  return hash === merkleRoot;
}

/**
 * Generate a Merkle proof for a specific transaction
 * @param transactions Array of transactions
 * @param txId ID of the transaction to generate proof for
 * @returns Object containing the proof array and index, or null if transaction not found
 */
export function generateMerkleProof(
  transactions: Transaction[],
  txId: string
): { proof: string[]; index: number } | null {
  // Find the transaction
  const txIndex = transactions.findIndex(tx => tx.id === txId);
  if (txIndex === -1) {
    return null;
  }
  
  // Extract transaction IDs
  let hashes = transactions.map(tx => tx.id);
  
  // If odd number of elements, duplicate the last one
  if (hashes.length % 2 !== 0) {
    hashes.push(hashes[hashes.length - 1]);
  }
  
  let index = txIndex;
  const proof: string[] = [];
  
  // Build the Merkle proof
  while (hashes.length > 1) {
    const levelHashes: string[] = [];
    
    // Process pairs of hashes
    for (let i = 0; i < hashes.length; i += 2) {
      if (i === index || i + 1 === index) {
        // This is the pair containing our transaction
        proof.push(i === index ? hashes[i + 1] : hashes[i]);
      }
      
      const combinedHash = SHA256(hashes[i] + hashes[i + 1]).toString();
      levelHashes.push(combinedHash);
    }
    
    hashes = levelHashes;
    
    // Adjust the index for the next level
    index = Math.floor(index / 2);
    
    // If odd number of hashes, duplicate the last one
    if (hashes.length % 2 !== 0 && hashes.length > 1) {
      hashes.push(hashes[hashes.length - 1]);
    }
  }
  
  return { proof, index: txIndex };
}