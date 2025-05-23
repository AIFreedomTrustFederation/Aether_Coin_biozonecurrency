import type { Credential } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Secure storage utility for handling credentials and sensitive data
 * Uses client-side encryption for securing data
 */
class SecureStorage {
  private encryptionKey: string | null = null;
  private storage: Storage = localStorage;
  private STORAGE_KEY = 'aetherion.secure_credentials';
  
  /**
   * Initialize secure storage with encryption key
   * @param key The encryption key to use
   */
  initialize(key: string): void {
    this.encryptionKey = key;
    
    // Ensure the storage location exists
    if (!this.storage.getItem(this.STORAGE_KEY)) {
      this.storage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }
  
  /**
   * Store a credential securely
   * @param credential The credential to store
   * @returns The stored credential with ID
   */
  async storeCredential(credential: any): Promise<Credential> {
    this.ensureInitialized();
    
    // Create credential object
    const newCredential: Credential = {
      id: uuidv4(),
      name: credential.name || 'Unnamed Credential',
      type: credential.type || 'generic',
      data: this.encryptData(credential.data || {}),
      createdAt: new Date()
    };
    
    // Get existing credentials
    const credentials = this.getCredentialsFromStorage();
    
    // Add new credential
    credentials.push(newCredential);
    
    // Save back to storage
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
    
    // Return the credential with unencrypted data
    return {
      ...newCredential,
      data: credential.data
    };
  }
  
  /**
   * Retrieve a credential by ID
   * @param id The credential ID
   * @returns The credential with decrypted data or null if not found
   */
  async getCredential(id: string): Promise<any | null> {
    this.ensureInitialized();
    
    const credentials = this.getCredentialsFromStorage();
    const credential = credentials.find(c => c.id === id);
    
    if (!credential) return null;
    
    // Return with decrypted data
    return {
      ...credential,
      data: this.decryptData(credential.data)
    };
  }
  
  /**
   * Get all stored credentials
   * @returns Array of credentials with decrypted data
   */
  async getAllCredentials(): Promise<Credential[]> {
    this.ensureInitialized();
    
    const credentials = this.getCredentialsFromStorage();
    
    // Return all with decrypted data
    return credentials.map(credential => ({
      ...credential,
      data: this.decryptData(credential.data)
    }));
  }
  
  /**
   * Delete a credential by ID
   * @param id The credential ID to delete
   * @returns True if deleted, false if not found
   */
  async deleteCredential(id: string): Promise<boolean> {
    this.ensureInitialized();
    
    const credentials = this.getCredentialsFromStorage();
    const initialLength = credentials.length;
    
    const filteredCredentials = credentials.filter(c => c.id !== id);
    
    if (filteredCredentials.length === initialLength) {
      return false; // Credential not found
    }
    
    // Save updated credentials
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCredentials));
    return true;
  }
  
  /**
   * Clear all stored credentials
   */
  async clearAllCredentials(): Promise<void> {
    this.ensureInitialized();
    this.storage.setItem(this.STORAGE_KEY, JSON.stringify([]));
  }
  
  // Private helper methods
  
  private ensureInitialized(): void {
    if (!this.encryptionKey) {
      throw new Error('SecureStorage has not been initialized with an encryption key.');
    }
  }
  
  private getCredentialsFromStorage(): Credential[] {
    const storedData = this.storage.getItem(this.STORAGE_KEY);
    if (!storedData) return [];
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing stored credentials:', error);
      return [];
    }
  }
  
  /**
   * Encrypt data using the encryption key
   * In a real implementation, this would use a proper encryption algorithm
   */
  private encryptData(data: any): string {
    if (!this.encryptionKey) return JSON.stringify(data);
    
    // For demo purposes, we're just doing a simple reversible "encryption"
    // Real implementation would use proper cryptography
    const jsonData = JSON.stringify(data);
    // Simple XOR with the encryption key for demo
    const encrypted = this.simpleXOR(jsonData, this.encryptionKey);
    
    return encrypted;
  }
  
  /**
   * Decrypt data using the encryption key
   * In a real implementation, this would use a proper decryption algorithm
   */
  private decryptData(encryptedData: string): any {
    if (!this.encryptionKey) return JSON.parse(encryptedData);
    
    try {
      // Reverse the simple XOR "encryption"
      const decrypted = this.simpleXOR(encryptedData, this.encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return {};
    }
  }
  
  /**
   * Simple XOR operation for demo "encryption"
   * NOT for actual security - just for demonstration
   */
  private simpleXOR(str: string, key: string): string {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }
}

// Create and export a singleton instance
export const secureStorage = new SecureStorage();

// Also export the class for extending
export default SecureStorage;