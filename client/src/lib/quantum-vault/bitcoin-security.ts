/**
 * Bitcoin-Inspired Security Layer for Quantum Vault
 * 
 * This module implements security features inspired by Bitcoin's battle-tested
 * security mechanisms, including:
 * 
 * 1. Merkle tree verification
 * 2. Proof-of-work consensus for distributed verification
 * 3. Multisignature capabilities
 * 4. Hierarchical deterministic (HD) key derivation
 * 5. UTXO-based accounting model for escrow operations
 */

import CryptoJS from 'crypto-js';

/**
 * Types for Bitcoin-inspired security features
 */
export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
}

export interface MerkleProof {
  index: number;
  total: number;
  siblings: string[];
}

export interface BlockHeader {
  version: number;
  previousBlockHash: string;
  merkleRoot: string;
  timestamp: number;
  bits: number; // Compact form of the target
  nonce: number;
}

export interface UTXO {
  txid: string;
  vout: number;
  amount: number;
  script: string;
  address: string;
  confirmations: number;
}

/**
 * Bitcoin-inspired security layer that adds proven security mechanisms
 * to the quantum-secure vault
 */
export class BitcoinSecurityLayer {
  private static instance: BitcoinSecurityLayer;
  
  // Configuration
  private difficulty = 4; // Number of leading zeros for PoW
  
  /**
   * Get singleton instance
   */
  public static getInstance(): BitcoinSecurityLayer {
    if (!BitcoinSecurityLayer.instance) {
      BitcoinSecurityLayer.instance = new BitcoinSecurityLayer();
    }
    return BitcoinSecurityLayer.instance;
  }
  
  private constructor() {}
  
  /**
   * Creates a Merkle tree from a list of data items
   * @param items Array of data items to include in the Merkle tree
   * @returns The Merkle root node
   */
  public createMerkleTree(items: string[]): MerkleNode | null {
    if (items.length === 0) return null;
    
    // First, hash all the items to create leaf nodes
    let nodes: MerkleNode[] = items.map(item => ({
      hash: this.sha256(item)
    }));
    
    // If odd number of nodes, duplicate the last one
    if (nodes.length % 2 !== 0) {
      nodes.push({ ...nodes[nodes.length - 1] });
    }
    
    // Build the tree bottom-up
    while (nodes.length > 1) {
      const newLevel: MerkleNode[] = [];
      
      for (let i = 0; i < nodes.length; i += 2) {
        const left = nodes[i];
        const right = nodes[i + 1];
        
        // Create a parent node with the combined hash
        const combinedHash = this.sha256(left.hash + right.hash);
        newLevel.push({
          hash: combinedHash,
          left,
          right
        });
      }
      
      nodes = newLevel;
    }
    
    // The root of the Merkle tree
    return nodes[0];
  }
  
  /**
   * Generates a Merkle proof for a specific item in the tree
   * @param items All data items in the Merkle tree
   * @param index Index of the item to generate proof for
   * @returns A Merkle proof object
   */
  public generateMerkleProof(items: string[], index: number): MerkleProof | null {
    if (index < 0 || index >= items.length) return null;
    
    const total = items.length;
    const siblings: string[] = [];
    let nodeIndex = index;
    
    // First, hash all the items to create leaf nodes
    let nodes: MerkleNode[] = items.map(item => ({
      hash: this.sha256(item)
    }));
    
    // If odd number of nodes, duplicate the last one
    if (nodes.length % 2 !== 0) {
      nodes.push({ ...nodes[nodes.length - 1] });
    }
    
    // Collect sibling hashes at each level
    while (nodes.length > 1) {
      const newLevel: MerkleNode[] = [];
      
      for (let i = 0; i < nodes.length; i += 2) {
        if (Math.floor(nodeIndex / 2) === Math.floor(i / 2)) {
          // This is the node or its sibling
          if (nodeIndex % 2 === 0) {
            // Current node is left, add right sibling
            siblings.push(nodes[i + 1].hash);
          } else {
            // Current node is right, add left sibling
            siblings.push(nodes[i].hash);
          }
        }
        
        // Create a parent node with the combined hash
        const left = nodes[i];
        const right = nodes[i + 1];
        const combinedHash = this.sha256(left.hash + right.hash);
        newLevel.push({
          hash: combinedHash,
          left,
          right
        });
      }
      
      // Update node index for the next level
      nodeIndex = Math.floor(nodeIndex / 2);
      nodes = newLevel;
    }
    
    return {
      index,
      total,
      siblings
    };
  }
  
  /**
   * Verifies a Merkle proof against a Merkle root
   * @param item The data item to verify
   * @param proof The Merkle proof
   * @param merkleRoot The expected Merkle root hash
   * @returns True if the proof is valid
   */
  public verifyMerkleProof(item: string, proof: MerkleProof, merkleRoot: string): boolean {
    let hash = this.sha256(item);
    let index = proof.index;
    
    for (const sibling of proof.siblings) {
      if (index % 2 === 0) {
        // Current hash is on the left
        hash = this.sha256(hash + sibling);
      } else {
        // Current hash is on the right
        hash = this.sha256(sibling + hash);
      }
      
      // Move up to the parent level
      index = Math.floor(index / 2);
    }
    
    // The final hash should match the Merkle root
    return hash === merkleRoot;
  }
  
  /**
   * Creates a Bitcoin-inspired block header
   * @param previousBlockHash Hash of the previous block
   * @param merkleRoot Merkle root of the transactions
   * @returns A block header object
   */
  public createBlockHeader(previousBlockHash: string, merkleRoot: string): BlockHeader {
    return {
      version: 1,
      previousBlockHash,
      merkleRoot,
      timestamp: Math.floor(Date.now() / 1000),
      bits: this.difficulty,
      nonce: 0
    };
  }
  
  /**
   * Performs a proof-of-work calculation on a block header
   * @param header The block header to mine
   * @returns The mined block header with a valid nonce
   */
  public mineBlock(header: BlockHeader): BlockHeader {
    const target = '0'.repeat(header.bits);
    let nonce = 0;
    let hash = '';
    
    // Keep incrementing nonce until we find a valid hash
    while (true) {
      const tempHeader = { ...header, nonce };
      const headerString = this.serializeBlockHeader(tempHeader);
      hash = this.sha256(this.sha256(headerString)); // Double SHA-256 like Bitcoin
      
      if (hash.startsWith(target)) {
        break;
      }
      
      nonce++;
    }
    
    return { ...header, nonce };
  }
  
  /**
   * Verifies a block header's proof-of-work
   * @param header The block header to verify
   * @returns True if the proof-of-work is valid
   */
  public verifyBlock(header: BlockHeader): boolean {
    const target = '0'.repeat(header.bits);
    const headerString = this.serializeBlockHeader(header);
    const hash = this.sha256(this.sha256(headerString));
    
    return hash.startsWith(target);
  }
  
  /**
   * Generates a multisignature escrow configuration
   * @param requiredSignatures Number of signatures required (M)
   * @param totalParticipants Total number of participants (N)
   * @param participantKeys Public keys of all participants
   * @returns A multisig script configuration
   */
  public createMultisigEscrow(
    requiredSignatures: number, 
    totalParticipants: number, 
    participantKeys: string[]
  ): string {
    if (participantKeys.length !== totalParticipants) {
      throw new Error('Number of keys must match total participants');
    }
    
    if (requiredSignatures > totalParticipants) {
      throw new Error('Required signatures cannot exceed total participants');
    }
    
    // In Bitcoin, this would generate an actual script
    // Here we're just creating a representation
    return `OP_${requiredSignatures} ${participantKeys.join(' ')} OP_${totalParticipants} OP_CHECKMULTISIG`;
  }
  
  /**
   * Creates a UTXO for an escrow operation
   * @param amount The amount to lock in escrow
   * @param script The multisig script or other locking script
   * @param address The recipient address
   * @returns A UTXO object
   */
  public createEscrowUTXO(amount: number, script: string, address: string): UTXO {
    return {
      txid: this.generateTxId(),
      vout: 0,
      amount,
      script,
      address,
      confirmations: 0
    };
  }
  
  /**
   * Implements Bitcoin's Hierarchical Deterministic (HD) wallet key derivation
   * @param seed The seed to derive keys from
   * @param path The derivation path (e.g., "m/44'/0'/0'/0/0")
   * @returns A derived key
   */
  public deriveHDKey(seed: string, path: string): string {
    // In a real implementation, this would use BIP32/BIP44
    // For simplicity, we'll just hash the combination
    return this.sha256(seed + path);
  }
  
  /**
   * Serializes a block header for hashing
   * @private
   */
  private serializeBlockHeader(header: BlockHeader): string {
    return JSON.stringify({
      v: header.version,
      p: header.previousBlockHash,
      m: header.merkleRoot,
      t: header.timestamp,
      b: header.bits,
      n: header.nonce
    });
  }
  
  /**
   * Generates a transaction ID (double SHA-256 hash)
   * @private
   */
  private generateTxId(): string {
    const random = Math.random().toString() + Date.now().toString();
    return this.sha256(this.sha256(random));
  }
  
  /**
   * SHA-256 hash function
   * @private
   */
  private sha256(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }
}

// Export singleton instance
export const bitcoinSecurityLayer = BitcoinSecurityLayer.getInstance();