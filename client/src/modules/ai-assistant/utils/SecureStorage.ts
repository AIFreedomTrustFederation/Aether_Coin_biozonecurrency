import { SecureCredential } from '../types';
import CryptoJS from 'crypto-js';

// This is a simple secure storage implementation for demo purposes
// In a real application, you would want to use a more secure solution like Web Crypto API
// or integration with a hardware wallet for storing sensitive information

class SecureStorage {
  private encryptionKey: string;
  private storagePrefix: string = 'aetherion_secure_';
  private credentials: Map<string, SecureCredential> = new Map();

  constructor(userId: number, userSalt?: string) {
    // In a real implementation, this key would be derived from a user-provided password
    // or from a secure key management system
    this.encryptionKey = `user_${userId}_${userSalt || this.generateSalt()}`;
    
    // Load credentials from storage
    this.loadFromStorage();
  }

  // Generate a random salt
  private generateSalt(length: number = 16): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    
    for (let i = 0; i < length; i++) {
      salt += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return salt;
  }

  // Encrypt data
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  // Decrypt data
  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Load credentials from storage
  private loadFromStorage(): void {
    try {
      // In a real implementation, this would be stored more securely
      const storedCredentials = localStorage.getItem(`${this.storagePrefix}credentials`);
      
      if (storedCredentials) {
        const decryptedData = this.decrypt(storedCredentials);
        const parsedData = JSON.parse(decryptedData) as SecureCredential[];
        
        parsedData.forEach(credential => {
          this.credentials.set(credential.id, credential);
        });
      }
    } catch (error) {
      console.error('Failed to load credentials from storage:', error);
    }
  }

  // Save credentials to storage
  private saveToStorage(): void {
    try {
      const credentialsArray = Array.from(this.credentials.values());
      const encryptedData = this.encrypt(JSON.stringify(credentialsArray));
      
      localStorage.setItem(`${this.storagePrefix}credentials`, encryptedData);
    } catch (error) {
      console.error('Failed to save credentials to storage:', error);
    }
  }

  // Store a credential
  storeCredential(service: string, name: string, value: string): SecureCredential {
    const id = `cred_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Encrypt the actual credential value
    const encryptedValue = this.encrypt(value);
    
    const credential: SecureCredential = {
      id,
      name,
      service,
      lastUpdated: new Date(),
      encrypted: true,
      // In a real implementation, this would be stored more securely
      // For demo purposes, we store the encrypted value in the credential object itself
      data: encryptedValue
    };
    
    this.credentials.set(id, credential);
    this.saveToStorage();
    
    return credential;
  }

  // Get a credential
  getCredential(id: string): string | null {
    const credential = this.credentials.get(id);
    
    if (!credential || !credential.data) {
      return null;
    }
    
    try {
      return this.decrypt(credential.data);
    } catch (error) {
      console.error('Failed to decrypt credential:', error);
      return null;
    }
  }

  // Delete a credential
  deleteCredential(id: string): boolean {
    const result = this.credentials.delete(id);
    
    if (result) {
      this.saveToStorage();
    }
    
    return result;
  }

  // List all credentials (without the actual values)
  listCredentials(): SecureCredential[] {
    return Array.from(this.credentials.values()).map(cred => {
      // Return a copy without the actual data
      const { data, ...rest } = cred;
      return rest;
    });
  }

  // Clear all stored credentials
  clearAll(): void {
    this.credentials.clear();
    localStorage.removeItem(`${this.storagePrefix}credentials`);
  }
}

export default SecureStorage;