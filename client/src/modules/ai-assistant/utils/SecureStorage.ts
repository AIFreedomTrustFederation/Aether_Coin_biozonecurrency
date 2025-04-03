import { CredentialType, SecureCredential } from '../types';
import crypto from 'crypto-js';

/**
 * SecureStorage provides utilities for storing sensitive credentials
 * with encryption and secure access methods
 */
class SecureStorage {
  private readonly storagePrefix: string = 'aetherion_secure_';
  private readonly encryptionKey: string;
  private readonly localStorage: Storage;
  private readonly sessionStorage: Storage;
  
  constructor() {
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : null as any;
    this.sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null as any;
    
    // In a real implementation, this would be more secure and not hardcoded
    // Could use a master password provided by the user, or device-specific identifier
    this.encryptionKey = 'QUANTUM_RESISTANT_ENCRYPTION_KEY';
  }
  
  /**
   * Store a credential securely
   * 
   * @param credential The credential to store
   * @returns The stored credential with ID
   */
  public storeCredential(credential: Omit<SecureCredential, 'id' | 'createdAt'>): SecureCredential {
    const id = this.generateId();
    const now = new Date();
    
    const fullCredential: SecureCredential = {
      id,
      createdAt: now,
      ...credential,
      accessCount: 0
    };
    
    // Encrypt sensitive data if needed
    const storedCredential = { ...fullCredential };
    if (!storedCredential.isEncrypted && storedCredential.data) {
      storedCredential.data = this.encrypt(storedCredential.data);
      storedCredential.isEncrypted = true;
    }
    
    // Save to storage
    this.setItem(this.getCredentialKey(id), JSON.stringify(storedCredential));
    
    return fullCredential;
  }
  
  /**
   * Get a credential by ID
   * 
   * @param id The credential ID
   * @returns The credential or null if not found
   */
  public getCredential(id: number): SecureCredential | null {
    const key = this.getCredentialKey(id);
    const json = this.getItem(key);
    
    if (!json) {
      return null;
    }
    
    try {
      const credential = JSON.parse(json) as SecureCredential;
      
      // Update access count and time
      credential.accessCount = (credential.accessCount || 0) + 1;
      credential.lastAccessed = new Date();
      
      // Store updated access info
      this.setItem(key, JSON.stringify({
        ...credential,
        data: credential.data, // Keep encrypted in storage
        isEncrypted: credential.isEncrypted
      }));
      
      // Return decrypted data
      if (credential.isEncrypted && credential.data) {
        credential.data = this.decrypt(credential.data);
        credential.isEncrypted = false;
      }
      
      return credential;
    } catch (error) {
      console.error('Failed to parse credential:', error);
      return null;
    }
  }
  
  /**
   * Update an existing credential
   * 
   * @param id The credential ID to update
   * @param updates The updates to apply
   * @returns The updated credential or null if not found
   */
  public updateCredential(id: number, updates: Partial<Omit<SecureCredential, 'id' | 'createdAt'>>): SecureCredential | null {
    const credential = this.getCredential(id);
    
    if (!credential) {
      return null;
    }
    
    // Apply updates
    const updatedCredential: SecureCredential = {
      ...credential,
      ...updates,
      updatedAt: new Date()
    };
    
    // Handle encryption if data was updated
    if ('data' in updates) {
      // Ensure data is encrypted before storing
      if (!updatedCredential.isEncrypted && updatedCredential.data) {
        updatedCredential.data = this.encrypt(updatedCredential.data);
        updatedCredential.isEncrypted = true;
      }
    }
    
    // Save updated credential
    this.setItem(
      this.getCredentialKey(id),
      JSON.stringify(updatedCredential)
    );
    
    // Return decrypted version
    if (updatedCredential.isEncrypted && updatedCredential.data) {
      updatedCredential.data = this.decrypt(updatedCredential.data);
      updatedCredential.isEncrypted = false;
    }
    
    return updatedCredential;
  }
  
  /**
   * Remove a credential by ID
   * 
   * @param id The credential ID
   * @returns True if removed successfully
   */
  public removeCredential(id: number): boolean {
    const key = this.getCredentialKey(id);
    
    if (this.getItem(key)) {
      this.removeItem(key);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all credentials
   * 
   * @param userId Optional user ID to filter by
   * @returns Array of credentials (decrypted)
   */
  public getAllCredentials(userId?: number): SecureCredential[] {
    const credentials: SecureCredential[] = [];
    
    // Get all keys in localStorage that match our prefix
    for (let i = 0; i < this.localStorage.length; i++) {
      const key = this.localStorage.key(i);
      
      if (key && key.startsWith(this.storagePrefix)) {
        try {
          const json = this.getItem(key);
          if (!json) continue;
          
          const credential = JSON.parse(json) as SecureCredential;
          
          // Filter by userId if specified
          if (userId !== undefined && credential.userId !== userId) {
            continue;
          }
          
          // Decrypt data before returning
          if (credential.isEncrypted && credential.data) {
            credential.data = this.decrypt(credential.data);
            credential.isEncrypted = false;
          }
          
          credentials.push(credential);
        } catch (error) {
          console.error('Failed to parse credential:', error);
        }
      }
    }
    
    return credentials;
  }
  
  /**
   * Get credentials by service name
   * 
   * @param service The service name
   * @returns Array of matching credentials
   */
  public getCredentialsByService(service: string): SecureCredential[] {
    return this.getAllCredentials().filter(cred => 
      cred.service && cred.service.toLowerCase() === service.toLowerCase()
    );
  }
  
  /**
   * Get credentials by type
   * 
   * @param type The credential type
   * @returns Array of matching credentials
   */
  public getCredentialsByType(type: CredentialType): SecureCredential[] {
    return this.getAllCredentials().filter(cred => cred.type === type);
  }
  
  /**
   * Clear all credentials
   * 
   * @param userId Optional user ID to clear credentials for
   * @returns Number of credentials removed
   */
  public clearAllCredentials(userId?: number): number {
    const credentials = this.getAllCredentials(userId);
    
    credentials.forEach(credential => {
      this.removeCredential(credential.id);
    });
    
    return credentials.length;
  }
  
  /**
   * Encrypt sensitive data
   * 
   * @param data The data to encrypt
   * @returns Encrypted data string
   */
  private encrypt(data: string): string {
    return crypto.AES.encrypt(data, this.encryptionKey).toString();
  }
  
  /**
   * Decrypt sensitive data
   * 
   * @param encryptedData The encrypted data
   * @returns Decrypted data string
   */
  private decrypt(encryptedData: string): string {
    const bytes = crypto.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(crypto.enc.Utf8);
  }
  
  /**
   * Generate a unique ID for a credential
   * 
   * @returns A unique numeric ID
   */
  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }
  
  /**
   * Get the storage key for a credential
   * 
   * @param id The credential ID
   * @returns The storage key
   */
  private getCredentialKey(id: number): string {
    return `${this.storagePrefix}credential_${id}`;
  }
  
  /**
   * Wrapper for localStorage.getItem
   */
  private getItem(key: string): string | null {
    if (!this.localStorage) return null;
    return this.localStorage.getItem(key);
  }
  
  /**
   * Wrapper for localStorage.setItem
   */
  private setItem(key: string, value: string): void {
    if (!this.localStorage) return;
    this.localStorage.setItem(key, value);
  }
  
  /**
   * Wrapper for localStorage.removeItem
   */
  private removeItem(key: string): void {
    if (!this.localStorage) return;
    this.localStorage.removeItem(key);
  }
  
  /**
   * Calculate SHA-256 hash
   */
  private calculateHash(data: string): string {
    return crypto.SHA256(data).toString();
  }
}

// Export a singleton instance
export const secureStorage = new SecureStorage();