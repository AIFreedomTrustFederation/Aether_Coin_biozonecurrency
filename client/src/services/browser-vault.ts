/**
 * browser-vault.ts
 * 
 * A browser-compatible version of the quantum vault service
 * that uses browser crypto APIs and local storage for key security
 */

// Interface for securely storing and retrieving API keys
export interface IBrowserVault {
  // Store a new API key securely
  storeKey(service: string, key: string): Promise<string>;
  
  // Retrieve an API key from secure storage
  retrieveKey(keyId: string): Promise<string | null>;
  
  // Verify if a key exists and is valid
  verifyKey(keyId: string): Promise<boolean>;
  
  // Remove a key from secure storage
  deleteKey(keyId: string): Promise<boolean>;
}

// Implementation using browser crypto APIs and localStorage
export class BrowserVault implements IBrowserVault {
  private readonly STORAGE_PREFIX = 'aetherion:vault:';
  private readonly SHARD_COUNT = 3; // Number of shards to split each key into
  
  /**
   * Stores an API key securely by:
   * 1. Generating a unique ID for the key
   * 2. Encrypting the key with AES-GCM using the Web Crypto API
   * 3. Splitting the encrypted key into multiple shards using fractal sharding
   * 4. Storing the shards in different localStorage locations
   */
  async storeKey(service: string, key: string): Promise<string> {
    try {
      // Generate a unique key ID
      const keyId = this.generateKeyId(service);
      
      // Generate a random encryption key
      const encryptionKey = await this.generateEncryptionKey();
      
      // Store the encryption key (in practice, this should be stored separately
      // for true security, but for demo purposes we'll store it in localStorage)
      localStorage.setItem(`${this.STORAGE_PREFIX}${keyId}:enckey`, 
        await this.arrayBufferToBase64(encryptionKey));
      
      // Encrypt the API key
      const encryptedData = await this.encryptData(key, encryptionKey);
      
      // Split the encrypted data into shards
      const shards = this.splitIntoShards(encryptedData, this.SHARD_COUNT);
      
      // Store each shard in a different location
      for (let i = 0; i < shards.length; i++) {
        localStorage.setItem(
          `${this.STORAGE_PREFIX}${keyId}:shard:${i}`, 
          shards[i]
        );
      }
      
      // Return the key ID that can be used to retrieve the key later
      return keyId;
    } catch (error) {
      console.error('Error storing key in secure vault:', error);
      throw new Error('Failed to securely store API key');
    }
  }
  
  /**
   * Retrieves an API key from secure storage by:
   * 1. Retrieving all shards associated with the key ID
   * 2. Combining the shards to get the complete encrypted data
   * 3. Retrieving the encryption key
   * 4. Decrypting the data to get the original API key
   */
  async retrieveKey(keyId: string): Promise<string | null> {
    try {
      // Verify the key exists
      const exists = await this.verifyKey(keyId);
      if (!exists) {
        return null;
      }
      
      // Retrieve all shards
      const shards: string[] = [];
      for (let i = 0; i < this.SHARD_COUNT; i++) {
        const shard = localStorage.getItem(`${this.STORAGE_PREFIX}${keyId}:shard:${i}`);
        if (!shard) {
          throw new Error(`Shard ${i} for key ${keyId} not found`);
        }
        shards.push(shard);
      }
      
      // Combine shards to get the complete encrypted data
      const encryptedData = this.combineShards(shards);
      
      // Retrieve the encryption key
      const encKeyBase64 = localStorage.getItem(`${this.STORAGE_PREFIX}${keyId}:enckey`);
      if (!encKeyBase64) {
        throw new Error(`Encryption key for ${keyId} not found`);
      }
      
      const encryptionKey = await this.base64ToArrayBuffer(encKeyBase64);
      
      // Decrypt the data
      return await this.decryptData(encryptedData, encryptionKey);
    } catch (error) {
      console.error('Error retrieving key from secure vault:', error);
      return null;
    }
  }
  
  /**
   * Verifies if a key exists and is valid by checking if all
   * necessary components (encryption key and shards) exist
   */
  async verifyKey(keyId: string): Promise<boolean> {
    try {
      // Check if encryption key exists
      const encKey = localStorage.getItem(`${this.STORAGE_PREFIX}${keyId}:enckey`);
      if (!encKey) {
        return false;
      }
      
      // Check if all shards exist
      for (let i = 0; i < this.SHARD_COUNT; i++) {
        const shard = localStorage.getItem(`${this.STORAGE_PREFIX}${keyId}:shard:${i}`);
        if (!shard) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying key:', error);
      return false;
    }
  }
  
  /**
   * Deletes a key from secure storage by removing all associated
   * data (encryption key and shards)
   */
  async deleteKey(keyId: string): Promise<boolean> {
    try {
      // Remove encryption key
      localStorage.removeItem(`${this.STORAGE_PREFIX}${keyId}:enckey`);
      
      // Remove all shards
      for (let i = 0; i < this.SHARD_COUNT; i++) {
        localStorage.removeItem(`${this.STORAGE_PREFIX}${keyId}:shard:${i}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting key from secure vault:', error);
      return false;
    }
  }
  
  // UTILITY METHODS
  
  /**
   * Generates a unique ID for a key based on service and timestamp
   */
  private generateKeyId(service: string): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${service}-${timestamp}-${randomPart}`;
  }
  
  /**
   * Generates a random encryption key using the Web Crypto API
   */
  private async generateEncryptionKey(): Promise<ArrayBuffer> {
    return await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    ).then(key => window.crypto.subtle.exportKey('raw', key));
  }
  
  /**
   * Encrypts data using AES-GCM with the Web Crypto API
   */
  private async encryptData(data: string, key: ArrayBuffer): Promise<string> {
    // Generate a random initialization vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Import the key
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Convert the data to an ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convert to Base64 for storage
    return this.arrayBufferToBase64(result);
  }
  
  /**
   * Decrypts data using AES-GCM with the Web Crypto API
   */
  private async decryptData(encryptedBase64: string, key: ArrayBuffer): Promise<string> {
    // Convert Base64 to ArrayBuffer
    const encryptedData = await this.base64ToArrayBuffer(encryptedBase64);
    
    // Extract the IV (first 12 bytes)
    const iv = encryptedData.slice(0, 12);
    
    // Extract the encrypted data (everything after the IV)
    const data = encryptedData.slice(12);
    
    // Import the key
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );
    
    // Convert the decrypted ArrayBuffer back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
  
  /**
   * Splits data into the specified number of shards
   * using a simple sharding algorithm
   */
  private splitIntoShards(data: string, numShards: number): string[] {
    const shards: string[] = [];
    
    // For simplicity in this example, we'll just split the string evenly
    // In a production system, you would use a more sophisticated algorithm
    const chunkSize = Math.ceil(data.length / numShards);
    
    for (let i = 0; i < numShards; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      shards.push(data.substring(start, end));
    }
    
    return shards;
  }
  
  /**
   * Combines shards to recreate the original data
   */
  private combineShards(shards: string[]): string {
    return shards.join('');
  }
  
  /**
   * Converts an ArrayBuffer to a Base64 string
   */
  private async arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): Promise<string> {
    // Use a FileReader to convert the buffer to a data URL
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer]);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Extract the Base64 part from the data URL
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  /**
   * Converts a Base64 string to an ArrayBuffer
   */
  private async base64ToArrayBuffer(base64: string): Promise<ArrayBuffer> {
    // Convert Base64 to binary string
    const binaryString = atob(base64);
    
    // Create an ArrayBuffer from the binary string
    const buffer = new ArrayBuffer(binaryString.length);
    const view = new Uint8Array(buffer);
    
    for (let i = 0; i < binaryString.length; i++) {
      view[i] = binaryString.charCodeAt(i);
    }
    
    return buffer;
  }
}

// Singleton instance
export const browserVault = new BrowserVault();

export default browserVault;