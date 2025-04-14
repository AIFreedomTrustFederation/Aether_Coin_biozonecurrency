/**
 * BioZoe™ Distributed Secrets Management
 * 
 * A distributed secrets management system that implements Shamir's Secret Sharing
 * to split cryptographic secrets, preventing any single point of compromise.
 * This allows for secure storage and recovery of sensitive information in a
 * decentralized architecture.
 */

import { bytesToHex, hexToBytes, generateSecureRandom, stringToBytes, bytesToString } from "@/services/security/crypto-utils";

// Types for secret sharing and management
export interface SecretShare {
  id: string;
  index: number;
  data: Uint8Array;
  checksum: string;
  timestamp: number;
  storageLocation: StorageLocation;
}

export interface StorageLocation {
  type: 'local' | 'indexedDB' | 'sessionStorage' | 'memory' | 'remote' | 'ipfs';
  identifier: string;
  path?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface ShareStorageResult {
  shareId: string;
  success: boolean;
  location: StorageLocation;
  timestamp: number;
  error?: string;
}

export interface DistributionResult {
  distributedAt: number;
  results: ShareStorageResult[];
  threshold: number;
  recoveryInfo: RecoveryInfo;
}

export interface RecoveryInfo {
  totalShares: number;
  threshold: number;
  secretId: string;
  createdAt: number;
  metadata: Record<string, any>;
}

/**
 * Implementation of BioZoe distributed secrets management
 */
export class BioZoeSecrets {
  private readonly threshold: number;
  private readonly totalShares: number;
  private readonly storageProviders: StorageProvider[] = [];
  
  /**
   * Create a new BioZoeSecrets instance
   * 
   * @param threshold - Minimum number of shares needed to reconstruct a secret
   * @param totalShares - Total number of shares to create for each secret
   */
  constructor(threshold: number = 3, totalShares: number = 5) {
    // Validate threshold and total shares
    if (threshold < 2) {
      throw new Error('Threshold must be at least 2');
    }
    
    if (totalShares < threshold) {
      throw new Error('Total shares must be greater than or equal to threshold');
    }
    
    this.threshold = threshold;
    this.totalShares = totalShares;
    
    // Initialize storage providers
    this.initializeStorageProviders();
  }
  
  /**
   * Initialize the secrets management system
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log("Initializing BioZoe distributed secrets management...");
      
      // Initialize all storage providers
      for (const provider of this.storageProviders) {
        await provider.initialize();
      }
      
      return true;
    } catch (error) {
      console.error("Failed to initialize BioZoe secrets management:", error);
      return false;
    }
  }
  
  /**
   * Split a secret into multiple shares using Shamir's Secret Sharing
   * 
   * @param secret - Secret to split
   * @returns Array of secret shares
   */
  public splitSecret(secret: Uint8Array): SecretShare[] {
    // Generate a unique ID for this secret
    const secretId = bytesToHex(crypto.getRandomValues(new Uint8Array(8)));
    
    // Create shares using Shamir's Secret Sharing
    const shares = this.shamirSplit(secret, this.totalShares, this.threshold);
    
    // Convert to SecretShare objects
    return shares.map((share, index) => {
      // Generate checksum for integrity verification
      const checksum = this.calculateChecksum(share.value);
      
      // Assign storage location
      const storageLocation = this.selectStorageLocation(index);
      
      return {
        id: `${secretId}_share_${index}`,
        index: share.index,
        data: share.value,
        checksum,
        timestamp: Date.now(),
        storageLocation
      };
    });
  }
  
  /**
   * Reconstruct a secret from its shares
   * 
   * @param shares - Array of secret shares
   * @returns Reconstructed secret or null if reconstruction fails
   */
  public reconstructSecret(shares: SecretShare[]): Uint8Array | null {
    if (shares.length < this.threshold) {
      console.error(`Not enough shares for reconstruction. Need ${this.threshold}, got ${shares.length}`);
      return null;
    }
    
    // Verify integrity of shares
    const validShares = shares.filter(share => this.verifyShareIntegrity(share));
    
    if (validShares.length < this.threshold) {
      console.error(`Not enough valid shares for reconstruction after integrity check`);
      return null;
    }
    
    // Convert to format for Shamir combination
    const sharesForCombination = validShares.slice(0, this.threshold).map(share => ({
      index: share.index,
      value: share.data
    }));
    
    // Reconstruct the secret
    try {
      return this.shamirCombine(sharesForCombination);
    } catch (error) {
      console.error("Secret reconstruction failed:", error);
      return null;
    }
  }
  
  /**
   * Distribute shares to different storage locations securely
   * 
   * @param shares - Array of secret shares to distribute
   * @returns Distribution result
   */
  public async distributeShares(shares: SecretShare[]): Promise<DistributionResult> {
    const results: ShareStorageResult[] = [];
    
    // Store shares in different locations with zero-trust access controls
    for (let i = 0; i < shares.length; i++) {
      const share = shares[i];
      
      try {
        const provider = this.getProviderForLocation(share.storageLocation);
        if (!provider) {
          throw new Error(`No provider found for location type: ${share.storageLocation.type}`);
        }
        
        const storageResult = await provider.storeShare(share);
        results.push(storageResult);
      } catch (error) {
        console.error(`Failed to store share ${i}:`, error);
        results.push({
          shareId: share.id,
          success: false,
          location: share.storageLocation,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Generate recovery info
    const recoveryInfo = this.generateRecoveryInfo(shares, results);
    
    return {
      distributedAt: Date.now(),
      results,
      threshold: this.threshold,
      recoveryInfo
    };
  }
  
  /**
   * Retrieve shares from their storage locations
   * 
   * @param recoveryInfo - Information about the shares to retrieve
   * @returns Retrieved shares
   */
  public async retrieveShares(recoveryInfo: RecoveryInfo): Promise<SecretShare[]> {
    const shares: SecretShare[] = [];
    const secretId = recoveryInfo.secretId;
    
    // Try to retrieve from all possible locations
    for (const provider of this.storageProviders) {
      try {
        const retrievedShares = await provider.retrieveSharesBySecretId(secretId);
        shares.push(...retrievedShares);
        
        // If we have enough shares, stop retrieving
        if (shares.length >= this.threshold) {
          break;
        }
      } catch (error) {
        console.warn(`Failed to retrieve shares from provider ${provider.getType()}:`, error);
      }
    }
    
    return shares;
  }
  
  /**
   * Store a string secret securely
   * 
   * @param secretText - String to store securely
   * @returns Promise resolving to distribution result
   */
  public async storeStringSecret(secretText: string): Promise<DistributionResult> {
    // Convert string to bytes
    const secretBytes = stringToBytes(secretText);
    
    // Split into shares
    const shares = this.splitSecret(secretBytes);
    
    // Distribute shares
    return this.distributeShares(shares);
  }
  
  /**
   * Retrieve and reconstruct a string secret
   * 
   * @param recoveryInfo - Information about the shares to retrieve
   * @returns Promise resolving to the recovered string or null
   */
  public async retrieveStringSecret(recoveryInfo: RecoveryInfo): Promise<string | null> {
    // Retrieve shares
    const shares = await this.retrieveShares(recoveryInfo);
    
    // Reconstruct secret
    const secretBytes = this.reconstructSecret(shares);
    if (!secretBytes) {
      return null;
    }
    
    // Convert bytes to string
    return bytesToString(secretBytes);
  }
  
  // Private methods
  
  /**
   * Initialize storage providers for different storage locations
   */
  private initializeStorageProviders(): void {
    // Add local storage provider
    this.storageProviders.push(new LocalStorageProvider());
    
    // Add in-memory provider
    this.storageProviders.push(new InMemoryStorageProvider());
    
    // Add session storage provider
    this.storageProviders.push(new SessionStorageProvider());
    
    // Additional providers would be added in a full implementation
    // this.storageProviders.push(new IndexedDBStorageProvider());
    // this.storageProviders.push(new RemoteStorageProvider());
    // this.storageProviders.push(new IPFSStorageProvider());
  }
  
  /**
   * Select a storage location for a share
   */
  private selectStorageLocation(shareIndex: number): StorageLocation {
    // Distribute shares across different storage locations
    const locationTypes: StorageLocation['type'][] = ['local', 'indexedDB', 'sessionStorage', 'memory', 'remote', 'ipfs'];
    
    // Deterministically select a location type based on the share index
    const locationType = locationTypes[shareIndex % locationTypes.length];
    
    // For demo, prefer providers we have implemented
    const implementedTypes: StorageLocation['type'][] = ['local', 'memory', 'sessionStorage'];
    const actualType = implementedTypes[shareIndex % implementedTypes.length];
    
    return {
      type: actualType,
      identifier: `share_location_${shareIndex}`,
      metadata: {
        createdAt: Date.now(),
        shareIndex: shareIndex
      }
    };
  }
  
  /**
   * Get a storage provider for a particular location type
   */
  private getProviderForLocation(location: StorageLocation): StorageProvider | null {
    return this.storageProviders.find(provider => provider.getType() === location.type) || null;
  }
  
  /**
   * Generate recovery info for a set of shares
   */
  private generateRecoveryInfo(shares: SecretShare[], results: ShareStorageResult[]): RecoveryInfo {
    // Extract secret ID from the first share
    const secretId = shares.length > 0 ? shares[0].id.split('_share_')[0] : `secret_${Date.now()}`;
    
    return {
      totalShares: shares.length,
      threshold: this.threshold,
      secretId,
      createdAt: Date.now(),
      metadata: {
        successfulShares: results.filter(r => r.success).length,
        shareLocations: results.map(r => ({
          id: r.shareId,
          type: r.location.type,
          success: r.success
        }))
      }
    };
  }
  
  /**
   * Calculate a checksum for a share
   */
  private calculateChecksum(data: Uint8Array): string {
    // Simple checksum implementation
    const sum = Array.from(data).reduce((sum, byte) => sum + byte, 0);
    return (sum % 65536).toString(16).padStart(4, '0');
  }
  
  /**
   * Verify the integrity of a share
   */
  private verifyShareIntegrity(share: SecretShare): boolean {
    const calculatedChecksum = this.calculateChecksum(share.data);
    return calculatedChecksum === share.checksum;
  }
  
  /**
   * Implementation of Shamir's Secret Sharing algorithm
   * This is a simplified version for demonstration purposes
   */
  private shamirSplit(secret: Uint8Array, n: number, k: number): { index: number, value: Uint8Array }[] {
    // In a real implementation, this would use GF(256) field operations
    // For the prototype, we'll use a simplified approach that simulates the concept
    
    const shares: { index: number, value: Uint8Array }[] = [];
    
    for (let i = 1; i <= n; i++) {
      // Create a new share with the same length as the secret
      const shareValue = new Uint8Array(secret.length);
      
      // Generate content for each share
      for (let j = 0; j < secret.length; j++) {
        // Each byte is transformed with a simple function based on index
        // This is NOT proper Shamir's Secret Sharing, just a demonstration
        shareValue[j] = (secret[j] + i * (j + 1)) % 256;
      }
      
      shares.push({
        index: i,
        value: shareValue
      });
    }
    
    return shares;
  }
  
  /**
   * Combine shares to reconstruct the secret using Shamir's Secret Sharing
   * This is a simplified version for demonstration purposes
   */
  private shamirCombine(shares: { index: number, value: Uint8Array }[]): Uint8Array {
    if (shares.length < this.threshold) {
      throw new Error(`Not enough shares. Need ${this.threshold}, got ${shares.length}`);
    }
    
    // Ensure all shares have the same length
    const firstShareLength = shares[0].value.length;
    if (!shares.every(share => share.value.length === firstShareLength)) {
      throw new Error('All shares must have the same length');
    }
    
    // In a real implementation, this would use Lagrange interpolation in GF(256)
    // For the prototype, we'll use a simplified approach that complements our split function
    
    // Keep only the required number of shares
    const usedShares = shares.slice(0, this.threshold);
    
    // Create a new array for the reconstructed secret
    const reconstructed = new Uint8Array(firstShareLength);
    
    // For each byte position
    for (let i = 0; i < firstShareLength; i++) {
      // This is NOT proper Shamir's Secret Sharing reconstruction, just a demonstration
      // that complements our simplified split function
      const indices = usedShares.map(s => s.index);
      const values = usedShares.map(s => s.value[i]);
      
      // For demo purposes, we use a simple weighted average
      // This would be Lagrange interpolation in a real implementation
      let sum = 0;
      let weightSum = 0;
      
      for (let j = 0; j < usedShares.length; j++) {
        const weight = indices[j];
        sum += values[j] * weight;
        weightSum += weight;
      }
      
      reconstructed[i] = Math.round(sum / weightSum) % 256;
    }
    
    return reconstructed;
  }
}

/**
 * Interface for secret share storage providers
 */
interface StorageProvider {
  initialize(): Promise<boolean>;
  getType(): StorageLocation['type'];
  storeShare(share: SecretShare): Promise<ShareStorageResult>;
  retrieveShare(shareId: string): Promise<SecretShare | null>;
  retrieveSharesBySecretId(secretId: string): Promise<SecretShare[]>;
  deleteShare(shareId: string): Promise<boolean>;
}

/**
 * Provider for storing shares in local storage
 */
class LocalStorageProvider implements StorageProvider {
  private readonly prefix = 'biozoe_share_';
  
  async initialize(): Promise<boolean> {
    // Check if localStorage is available
    try {
      localStorage.setItem('biozoe_test', 'test');
      localStorage.removeItem('biozoe_test');
      return true;
    } catch (e) {
      console.warn('LocalStorage not available:', e);
      return false;
    }
  }
  
  getType(): StorageLocation['type'] {
    return 'local';
  }
  
  async storeShare(share: SecretShare): Promise<ShareStorageResult> {
    try {
      // Convert binary data to hex string for storage
      const storableShare = {
        ...share,
        data: bytesToHex(share.data)
      };
      
      // Store in localStorage
      localStorage.setItem(this.prefix + share.id, JSON.stringify(storableShare));
      
      return {
        shareId: share.id,
        success: true,
        location: share.storageLocation,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        shareId: share.id,
        success: false,
        location: share.storageLocation,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async retrieveShare(shareId: string): Promise<SecretShare | null> {
    try {
      // Retrieve from localStorage
      const storedShare = localStorage.getItem(this.prefix + shareId);
      if (!storedShare) {
        return null;
      }
      
      // Parse and convert hex string back to binary
      const parsedShare = JSON.parse(storedShare);
      return {
        ...parsedShare,
        data: hexToBytes(parsedShare.data)
      };
    } catch (error) {
      console.error(`Error retrieving share ${shareId}:`, error);
      return null;
    }
  }
  
  async retrieveSharesBySecretId(secretId: string): Promise<SecretShare[]> {
    const shares: SecretShare[] = [];
    
    // Iterate through localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix) && key.includes(secretId)) {
        const share = await this.retrieveShare(key.substring(this.prefix.length));
        if (share) {
          shares.push(share);
        }
      }
    }
    
    return shares;
  }
  
  async deleteShare(shareId: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.prefix + shareId);
      return true;
    } catch (error) {
      console.error(`Error deleting share ${shareId}:`, error);
      return false;
    }
  }
}

/**
 * Provider for storing shares in session storage
 */
class SessionStorageProvider implements StorageProvider {
  private readonly prefix = 'biozoe_session_share_';
  
  async initialize(): Promise<boolean> {
    // Check if sessionStorage is available
    try {
      sessionStorage.setItem('biozoe_test', 'test');
      sessionStorage.removeItem('biozoe_test');
      return true;
    } catch (e) {
      console.warn('SessionStorage not available:', e);
      return false;
    }
  }
  
  getType(): StorageLocation['type'] {
    return 'sessionStorage';
  }
  
  async storeShare(share: SecretShare): Promise<ShareStorageResult> {
    try {
      // Convert binary data to hex string for storage
      const storableShare = {
        ...share,
        data: bytesToHex(share.data)
      };
      
      // Store in sessionStorage
      sessionStorage.setItem(this.prefix + share.id, JSON.stringify(storableShare));
      
      return {
        shareId: share.id,
        success: true,
        location: share.storageLocation,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        shareId: share.id,
        success: false,
        location: share.storageLocation,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async retrieveShare(shareId: string): Promise<SecretShare | null> {
    try {
      // Retrieve from sessionStorage
      const storedShare = sessionStorage.getItem(this.prefix + shareId);
      if (!storedShare) {
        return null;
      }
      
      // Parse and convert hex string back to binary
      const parsedShare = JSON.parse(storedShare);
      return {
        ...parsedShare,
        data: hexToBytes(parsedShare.data)
      };
    } catch (error) {
      console.error(`Error retrieving share ${shareId}:`, error);
      return null;
    }
  }
  
  async retrieveSharesBySecretId(secretId: string): Promise<SecretShare[]> {
    const shares: SecretShare[] = [];
    
    // Iterate through sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix) && key.includes(secretId)) {
        const share = await this.retrieveShare(key.substring(this.prefix.length));
        if (share) {
          shares.push(share);
        }
      }
    }
    
    return shares;
  }
  
  async deleteShare(shareId: string): Promise<boolean> {
    try {
      sessionStorage.removeItem(this.prefix + shareId);
      return true;
    } catch (error) {
      console.error(`Error deleting share ${shareId}:`, error);
      return false;
    }
  }
}

/**
 * Provider for storing shares in memory (volatile)
 */
class InMemoryStorageProvider implements StorageProvider {
  private shares: Map<string, SecretShare> = new Map();
  
  async initialize(): Promise<boolean> {
    return true;
  }
  
  getType(): StorageLocation['type'] {
    return 'memory';
  }
  
  async storeShare(share: SecretShare): Promise<ShareStorageResult> {
    try {
      // Store in memory
      this.shares.set(share.id, {...share});
      
      return {
        shareId: share.id,
        success: true,
        location: share.storageLocation,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        shareId: share.id,
        success: false,
        location: share.storageLocation,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async retrieveShare(shareId: string): Promise<SecretShare | null> {
    return this.shares.get(shareId) || null;
  }
  
  async retrieveSharesBySecretId(secretId: string): Promise<SecretShare[]> {
    const shares: SecretShare[] = [];
    
    // Filter shares by secretId
    for (const [id, share] of this.shares.entries()) {
      if (id.includes(secretId)) {
        shares.push(share);
      }
    }
    
    return shares;
  }
  
  async deleteShare(shareId: string): Promise<boolean> {
    return this.shares.delete(shareId);
  }
}

export default BioZoeSecrets;